import { RequestMessage, ResponseMessage } from "vscode-jsonrpc";
import { CompletionItem, CompletionList, Diagnostic, Hover, MarkupContent, SemanticTokens } from "vscode-languageserver-types";
import { WebSocket, WebSocketServer } from "ws";

import { basicVts } from "./compiler/baseVts.js";
import { Linker } from "./compiler/linker.js";
import { getLastPos } from "./compiler/parser/ast.js";
import { TokenType } from "./compiler/parser/tokenizer.js";
import {
	CompletionParams,
	DidChangeTextDocumentParams,
	DidOpenTextDocumentParams,
	DocumentDiagnosticParams,
	FullDocumentDiagnosticReport,
	HoverParams,
	InitializeParams,
	InitializeResult,
	SemanticTokensParams,
	ServerCapabilities
} from "./lspTypes/protocol.js";
import { processChange } from "./textUpdater.js";
import net from "net";

enum TextDocumentSyncKind {
	None = 0,
	Full = 1,
	Incremental = 2
}

enum SemanticTokenTypes {
	type = "type",
	class = "class",
	parameter = "parameter",
	variable = "variable",
	property = "property",
	function = "function",
	method = "method",
	keyword = "keyword",
	comment = "comment",
	string = "string",
	number = "number"
}

enum CompletionItemKind {
	Method = 2,
	Function = 3,
	Variable = 6
}

const serverCapabilities: ServerCapabilities = {
	// colorProvider: true,
	semanticTokensProvider: {
		documentSelector: [{ pattern: "**/*.vtsl" }],
		legend: {
			tokenTypes: [
				SemanticTokenTypes.type,
				SemanticTokenTypes.class,
				SemanticTokenTypes.parameter,
				SemanticTokenTypes.variable,
				SemanticTokenTypes.property,
				SemanticTokenTypes.function,
				SemanticTokenTypes.method,
				SemanticTokenTypes.keyword,
				SemanticTokenTypes.comment,
				SemanticTokenTypes.string,
				SemanticTokenTypes.number
			],
			tokenModifiers: []
		},
		full: { delta: false },
		range: false
	},
	completionProvider: {
		triggerCharacters: ["."]
	},
	diagnosticProvider: {
		documentSelector: [{ pattern: "**/*.vtsl" }],
		workspaceDiagnostics: false,
		interFileDependencies: true
	},
	textDocumentSync: {
		change: TextDocumentSyncKind.Full,
		openClose: true
	},
	hoverProvider: true
};

const semanticIdx = (type: SemanticTokenTypes) => serverCapabilities.semanticTokensProvider.legend.tokenTypes.indexOf(type);

class LSP {
	private client: WebSocket;
	private wss: WebSocketServer;

	private messageHandlers: Record<string, (message: RequestMessage, payload: any) => any> = {};
	private files: Record<string, { content: string; linker: Linker }> = {};

	private transportWriter: (data: string) => void;
	constructor(private port: number) {}

	public async init() {
		console.log(`Server args: `, process.argv);
		const pipeArg = process.argv.find(a => a.startsWith("--pipe="));
		if (pipeArg) {
			console.log(`Configuring for local IPC`);

			const handler = this.getRawMessageHandler();
			const pipeName = pipeArg.split("=")[1];
			console.log(`Connecting to pipe ${pipeName}`);
			await new Promise<void>(res => {
				const client = net.createConnection(pipeName, res);
				client.on("data", data => {
					data
						.toString()
						.split("\n")
						.forEach(m => handler(m));
				});

				this.transportWriter = data => client.write(data);
			});
		} else {
			console.log(`Starting a websocket server on port ${this.port}`);
			const { WebSocketServer } = await import("ws");
			this.wss = new WebSocketServer({ port: 8000 });
			this.wss.on("connection", ws => {
				if (this.client != null) {
					console.log(`Replacing client`);
					this.client.close();
				}

				this.client = ws;

				const handler = this.getRawMessageHandler();
				this.client.on("message", m => handler(m.toString()));
				this.client.on("close", () => console.log("Client disconnected"));

				this.transportWriter = data => this.client.send(data);
			});

			this.wss.on("listening", () => {
				console.log(`Listening on port ${this.port}`);
			});
		}

		this.registerMessageHandler("initialize", this.handleInit.bind(this));
		this.registerMessageHandler("textDocument/semanticTokens/full", this.handleSemanticTokensRequest.bind(this));
		this.registerMessageHandler("textDocument/didOpen", this.handleDocumentOpen.bind(this));
		this.registerMessageHandler("textDocument/didChange", this.handleDocumentChange.bind(this));
		this.registerMessageHandler("textDocument/diagnostic", this.handleDiagnosticRequest.bind(this));
		this.registerMessageHandler("textDocument/completion", this.handleCompletionRequest.bind(this));
		this.registerMessageHandler("textDocument/hover", this.handleHoverRequest.bind(this));
	}

	private handleInit(message: RequestMessage, payload: InitializeParams) {
		console.log(`Received init message from ${payload.clientInfo.name}`);

		const replyBody: InitializeResult = {
			capabilities: serverCapabilities,
			serverInfo: {
				name: "VTSL LSP Implementation"
			}
		};

		return replyBody;
	}

	private handleDocumentOpen(message: RequestMessage, payload: DidOpenTextDocumentParams) {
		console.log(
			`Received open document request for ${payload.textDocument.uri} (${payload.textDocument.languageId}) with ${payload.textDocument.text.length} characters`
		);

		// this.files[payload.textDocument.uri] = payload.textDocument.text;
		this.setFile(payload.textDocument.uri, payload.textDocument.text);
	}

	private handleDocumentChange(message: RequestMessage, payload: DidChangeTextDocumentParams) {
		// console.log(`Received document change for ${payload.textDocument.uri}`);
		// this.files[payload.textDocument.uri] = payload.contentChanges[0].text;
		// this.setFile(payload.textDocument.uri, payload.contentChanges[0].text);
		let text = this.files[payload.textDocument.uri].content;
		payload.contentChanges.forEach(change => {
			text = processChange(text, change);
		});

		this.setFile(payload.textDocument.uri, text);
	}

	private setFile(uri: string, text: string) {
		const linker = new Linker();
		linker.compile(text, basicVts, {
			skipIR: true,
			includeStripInfo: false,
			stripInput: false,
			stackSize: 2,
			generateExceptionObjectives: false
		});
		this.files[uri] = { content: text, linker };
	}

	private handleDiagnosticRequest(message: RequestMessage, payload: DocumentDiagnosticParams) {
		const file = this.files[payload.textDocument.uri];

		const parserDiagnostics: Diagnostic[] = file.linker.parserErrors.map(err => {
			return {
				message: err.message,
				range: {
					start: { line: err.line - 1, character: err.column - 1 },
					end: { line: err.line - 1, character: err.column + err.token.value.length - 1 }
				}
			};
		});

		const compilerDiagnostics: Diagnostic[] = file.linker.compilerErrors.map(err => {
			if (!err.node) return { message: err.message, range: { start: { line: 0, character: 0 }, end: { line: 0, character: 0 } } };
			const end = getLastPos(err.node);

			return {
				message: err.message,
				range: {
					start: { line: err.node.line - 1, character: err.node.column - 1 },
					end: { line: end.line - 1, character: end.column - 1 }
				}
			};
		});

		const diagnosticReport: FullDocumentDiagnosticReport = {
			kind: "full",
			items: [...parserDiagnostics, ...compilerDiagnostics]
		};

		return diagnosticReport;
	}

	private handleSemanticTokensRequest(message: RequestMessage, payload: SemanticTokensParams) {
		console.log(`Received semantic token request for ${payload.textDocument.uri}`);
		const file = this.files[payload.textDocument.uri];
		const semanticTokens = file.linker.analyzer.getTokenSemantics();

		const result: number[] = [];
		let lastLine = 0;
		let lastChar = 0;

		semanticTokens.forEach(({ token, type }) => {
			const deltaLine = token.line - 1 - lastLine;
			if (deltaLine > 0) lastChar = 0; // New line, reset char position

			// Offsets to cover the quotes of strings
			const colOffset = token.type == TokenType.LiteralString ? -1 : 0;
			const lenOffset = token.type == TokenType.LiteralString ? 2 : 0;

			const deltaChar = token.column + colOffset - 1 - lastChar;

			result.push(deltaLine, deltaChar, token.value.length + lenOffset, semanticIdx(type), 0);
			lastLine = token.line - 1;
			lastChar = token.column - 1;
		});

		const semanticTokensResponse: SemanticTokens = {
			data: result
		};

		return semanticTokensResponse;
	}

	private handleCompletionRequest(message: RequestMessage, payload: CompletionParams) {
		const file = this.files[payload.textDocument.uri];
		const symbols = file.linker.analyzer.getSymbolsAtLine(payload.position.line + 1, payload.position.character + 1);
		const items: CompletionItem[] = symbols.map(symbol => {
			if (symbol.type == "variable") return { label: symbol.name, kind: CompletionItemKind.Variable };
			if (symbol.type == "define") {
				const item: CompletionItem = {
					label: symbol.name,
					detail: symbol.defType,
					kind: CompletionItemKind.Variable
				};
				return item;
			}

			const item: CompletionItem = {
				kind: CompletionItemKind.Method,
				label: symbol.name,
				detail: `${symbol.name}(${symbol.args.map(a => `${a.name}: ${a.type}`).join(", ")}): ${symbol.returnType}`,
				tags: symbol.intended ? [] : [1]
			};

			if (!symbol.intended) {
				item.documentation = `The game does not typically expose this function, so use at your own risk.`;
				// item.detail += "\n\n The game does not typically expose this function, so use at your own risk.";
			}

			return item;
		});
		// (method) LSP.handleCompletionRequest(message: RequestMessage, payload: CompletionParams): CompletionList

		const result: CompletionList = {
			isIncomplete: false,
			items
		};

		return result;
	}

	private handleHoverRequest(message: RequestMessage, payload: HoverParams) {
		const file = this.files[payload.textDocument.uri];
		const hover = file.linker.analyzer.getHoverAtLine(payload.position.line + 1, payload.position.character + 1);
		if (!hover) return null;

		const content: MarkupContent = {
			kind: "markdown",
			value: "```typescript\n" + hover + "\n```"
		};

		const result: Hover = {
			contents: content
		};

		return result;
	}

	private getRawMessageHandler() {
		let mBuffer = "";
		let expectLength = 0;

		const handleMessage = (message: string) => {
			if (message.trim().length == 0) return;
			if (message.startsWith("Content-Length:")) {
				const lenMatch = message.match(/Content-Length: (\d+)/);
				expectLength = parseInt(lenMatch[1]);
				return;
			}

			mBuffer += message;
			if (mBuffer.length < expectLength) return;

			if (mBuffer.length > expectLength) {
				console.log(`Received more data than expected: ${mBuffer.length} > ${expectLength}`);
			}

			const jsonData = JSON.parse(mBuffer);
			this.handleMessage(jsonData);
			mBuffer = "";
		};

		return handleMessage;
	}

	private reply(to: RequestMessage, data: any) {
		const reply: ResponseMessage = {
			id: to.id,
			jsonrpc: to.jsonrpc,
			result: data
		};

		const content = JSON.stringify(reply);
		this.transportWriter(`Content-Length: ${content.length}\r\n\r\n${content}`);

		// if (this.useWs) this.client.send(`Content-Length: ${content.length}\r\n\r\n${content}`);
		// else this.transportWriter(`Content-Length: ${content.length}\r\n\r\n${content}`);
	}

	private registerMessageHandler<T>(method: string, handler: (message: RequestMessage, payload: T) => any) {
		this.messageHandlers[method] = handler;
	}

	private handleMessage(message: RequestMessage) {
		const handler = this.messageHandlers[message.method];
		if (!handler) {
			console.log(`No handler for method ${message.method}`);
			return;
		}
		console.log(`Handling message ${message.method}`);

		const result = handler(message, message.params);
		this.reply(message, result);
	}
}

const lsp = new LSP(8000);
lsp.init();

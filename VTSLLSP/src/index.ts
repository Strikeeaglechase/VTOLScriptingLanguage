import fs from "fs";
import { RequestMessage, ResponseMessage } from "vscode-jsonrpc";
import { WebSocketServer, WebSocket } from "ws";
import {
	DidChangeTextDocumentParams,
	DidOpenTextDocumentParams,
	DocumentColorParams,
	DocumentColorRequest,
	DocumentDiagnosticParams,
	FullDocumentDiagnosticReport,
	InitializeParams,
	InitializeResult,
	SemanticTokensParams,
	SemanticTokensRequest,
	ServerCapabilities,
	TextDocumentContentChangeEvent
} from "./lspTypes/protocol.js";
import { ColorInformation, Diagnostic, SemanticTokens } from "vscode-languageserver-types";
import { Preprocessor } from "./compiler/parser/preprocessor.js";
import { Tokenizer } from "./compiler/parser/tokenizer.js";
import { Parser } from "./compiler/parser/parser.js";
import { Analyzer } from "./compiler/analyzer.js";
import { Linker } from "./compiler/linker.js";

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
	completionProvider: { triggerCharacters: ["."] },
	diagnosticProvider: {
		documentSelector: [{ pattern: "**/*.vtsl" }],
		workspaceDiagnostics: false,
		interFileDependencies: true
	},
	textDocumentSync: {
		change: TextDocumentSyncKind.Full,
		openClose: true
	}
};

const semanticIdx = (type: SemanticTokenTypes) => serverCapabilities.semanticTokensProvider.legend.tokenTypes.indexOf(type);

class LSP {
	private client: WebSocket;
	private wss: WebSocketServer;

	private messageHandlers: Record<string, (message: RequestMessage, payload: any) => any> = {};

	private files: Record<string, { content: string; linker: Linker }> = {};

	constructor(private port: number) {}

	public init() {
		this.wss = new WebSocketServer({ port: 8000 });
		this.wss.on("connection", ws => {
			if (this.client != null) {
				console.log(`Replacing client`);
				this.client.close();
			}

			this.client = ws;

			this.setupWs();
		});

		this.wss.on("listening", () => {
			console.log(`Listening on port ${this.port}`);
		});

		this.registerMessageHandler("initialize", this.handleInit.bind(this));
		this.registerMessageHandler("textDocument/semanticTokens/full", this.handleSemanticTokensRequest.bind(this));
		this.registerMessageHandler("textDocument/didOpen", this.handleDocumentOpen.bind(this));
		this.registerMessageHandler("textDocument/didChange", this.handleDocumentChange.bind(this));
		this.registerMessageHandler("textDocument/diagnostic", this.handleDiagnosticRequest.bind(this));
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
		this.setFile(payload.textDocument.uri, payload.contentChanges[0].text);
	}

	private setFile(uri: string, text: string) {
		const linker = new Linker();
		linker.compile(text, "", true);
		this.files[uri] = { content: text, linker };
	}

	private handleDiagnosticRequest(message: RequestMessage, payload: DocumentDiagnosticParams) {
		const file = this.files[payload.textDocument.uri];
		const parseErrors = file.linker.parserErrors;

		const diagnostics: Diagnostic[] = parseErrors.map(err => {
			return {
				message: err.message,
				range: {
					start: { line: err.line - 1, character: err.column - 1 },
					end: { line: err.line - 1, character: err.column + err.token.value.length - 1 }
				}
			};
		});

		const diagnosticReport: FullDocumentDiagnosticReport = {
			kind: "full",
			items: diagnostics
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
			const deltaChar = token.column - 1 - lastChar;

			result.push(deltaLine, deltaChar, token.value.length, semanticIdx(type), 0);
			lastLine = token.line - 1;
			lastChar = token.column - 1;
		});

		const semanticTokensResponse: SemanticTokens = {
			data: result
		};

		return semanticTokensResponse;
	}

	private setupWs() {
		let mBuffer = "";
		let expectLength = 0;

		const stream = fs.createWriteStream("../output.txt");
		this.client.on("message", m => {
			const message = m.toString();
			stream.write(message.trim() + "\n");

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
		});

		this.client.on("close", () => {
			console.log(`Client disconnected`);
		});
	}

	private reply(to: RequestMessage, data: any) {
		const reply: ResponseMessage = {
			id: to.id,
			jsonrpc: to.jsonrpc,
			result: data
		};

		const content = JSON.stringify(reply);
		this.client.send(`Content-Length: ${content.length}\r\n\r\n${content}`);
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

		const result = handler(message, message.params);
		if (result) {
			this.reply(message, result);
		}
	}
}

const lsp = new LSP(8000);
lsp.init();

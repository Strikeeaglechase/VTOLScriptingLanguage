import * as path from "path";
import { ExtensionContext } from "vscode";
// import { WebSocket } from "ws";
import {
	LanguageClient,
	LanguageClientOptions,
	TransportKind,
} from "vscode-languageclient/node";

let client: LanguageClient;

async function connectToServer(url: string) {
	const WebSocket = await import("ws");
	const ws = new WebSocket(url);
	return { stream: WebSocket.createWebSocketStream(ws), ws };
}

const useWebSocket = false;

export async function activate(context: ExtensionContext) {
	console.log(`VTSL Language server is starting...`);
	const clientOptions: LanguageClientOptions = {
		documentSelector: [
			{ scheme: "file", language: "vtsl", pattern: "**/*.vtsl" },
		],
	};

	if (useWebSocket) {
		const { stream, ws } = await connectToServer("ws://localhost:8000");

		ws.on("close", () => {
			console.log("Connection to LSP lost...");
		});

		client = new LanguageClient(
			"vtslLanguageServer",
			"VTSL Language Server",
			() =>
				Promise.resolve({
					reader: stream,
					writer: stream,
				}),
			clientOptions
		);
	} else {
		client = new LanguageClient(
			"vtslLanguageServer",
			"VTSL Language Server",
			{
				command: "node",
				args: [
					path.join(__dirname, "..", "..", "server", "dist", "index.js"),
				],
				transport: TransportKind.pipe,
			},
			clientOptions
		);
	}

	// Start the client. This will also launch the server
	client.start();

	console.log(`VTSL Language server started`);
}

export function deactivate(): Thenable<void> | undefined {
	if (!client) {
		return undefined;
	}
	return client.stop();
}

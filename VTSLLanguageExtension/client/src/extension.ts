import * as path from "path";
import { ExtensionContext } from "vscode";
import { WebSocket } from "ws";
import {
	LanguageClient,
	LanguageClientOptions,
} from "vscode-languageclient/node";

let client: LanguageClient;

function connectToServer(url: string) {
	const ws = new WebSocket(url);
	return { stream: WebSocket.createWebSocketStream(ws), ws };
}

export function activate(context: ExtensionContext) {
	console.log(`VTSL Language server is starting...`);
	const clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [
			{ scheme: "file", language: "vtsl", pattern: "**/*.vtsl" },
		],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			// fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
		},
	};

	// Create the language client and start the client.
	const { stream, ws } = connectToServer("ws://localhost:8000");

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

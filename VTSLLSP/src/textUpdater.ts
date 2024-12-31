import { TextDocumentContentChangeEvent } from "./lspTypes/protocol.js";

const text = `Hello world!`;

interface Change {
	range: {
		start: { line: number; character: number };
		end: { line: number; character: number };
	};
	rangeLength: number;
	text: string;
}

// const change = {
// 	range: {
// 		start: { line: 0, character: 6 },
// 		end: { line: 0, character: 11 }
// 	},
// 	rangeLength: 5,
// 	text: ""
// };

export function processChange(text: string, change: TextDocumentContentChangeEvent) {
	const lines = text.split("\n");

	if ("range" in change) {
		const startLine = lines[change.range.start.line];
		const endLine = lines[change.range.end.line];
		console.log(change.range);
		if (change.range.start.line != change.range.end.line) throw new Error(`Oops an assumption we made was wrong`);

		const newLines = [startLine.substring(0, change.range.start.character) + change.text + endLine.substring(change.range.end.character)];

		return newLines.join("\n");
	} else {
		return change.text;
	}
}

import { Stream } from "../stream.js";

interface PosChar {
	char: string;
	line: number;
	column: number;
}

class Preprocessor {
	constructor(private input: string) {}

	public preprocess(): Stream<PosChar> {
		let currentLine = 1;
		let currentColumn = 1;
		const posChars = this.input.split("").map(c => {
			const posChar = {
				char: c,
				line: currentLine,
				column: currentColumn
			};

			if (c == "\n") {
				currentLine++;
				currentColumn = 1;
			} else currentColumn++;

			return posChar;
		});

		return new Stream(posChars);
	}
}

export { Preprocessor, PosChar };

import { Stream } from "../stream.js";
import { PosChar } from "./preprocessor.js";

const identifierStartChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";

const trueName = "true";
const falseName = "false";
const keywords = ["define", "forEach", "for", "while", "if", "else", "fn", "let", "arr", "ref", "as", "return", "declare", "nowait"];
const operands = ["+", "-", "*", "/", "%", "|", "&", "||", "&&", "!", "==", "!=", "<", ">", "<=", ">=", "..", "+=", "-="];
const symbols = ["(", ")", "[", "]", "{", "}", ";", ",", ".", "=", ":"];

const operatorStartChars = [...new Set(operands.map(o => o[0]))];
const operandPrecedence: Record<string, number> = {
	"!": 1,
	"..": 1,
	"||": 2,
	"&&": 3,
	"<": 7,
	"<=": 7,
	">": 7,
	">=": 7,
	"==": 7,
	"!=": 7,
	"+": 10,
	"-": 10,
	"*": 20,
	"/": 20,
	"%": 20
};

enum TokenType {
	Keyword = "keyword",
	Operand = "operand",
	Symbol = "symbol",
	Identifier = "identifier",
	LiteralNumber = "literalNumber",
	LiteralString = "literalString",
	LiteralBoolean = "literalBoolean",
	Comment = "comment"
}

interface Token {
	type: TokenType;
	value: string;

	line: number;
	column: number;
}

class Tokenizer {
	private tokens: Token[] = [];
	constructor(private input: Stream<PosChar>) {}

	public parse(): Stream<Token> {
		while (!this.input.eof()) {
			this.parseToken();
		}

		return new Stream(this.tokens);
	}

	private parseToken() {
		const posChar = this.input.next();
		const char = posChar.char;
		if (char.trim() == "") return;

		const next = this.input.peek();
		const pair = char + next?.char;
		if (pair == "//") return this.parseComment(posChar);
		if (char == '"') return this.tokens.push(this.parseString('"'));
		if (char == "'") return this.parseChar();
		if (operands.includes(pair)) return this.parseOperand(pair, posChar);
		if (symbols.includes(pair)) return this.parseSymbol(pair, posChar);
		if (operands.includes(char)) return this.parseOperand(char, posChar);
		if (symbols.includes(char)) return this.parseSymbol(char, posChar);

		// Try parsing a keyword or identifier
		const chars = [char];
		const line = posChar.line;
		const column = posChar.column;

		while (!this.input.eof()) {
			const posChar = this.input.peek();
			if (symbols.includes(posChar.char)) break;
			if (posChar.char == " ") break;
			if (posChar.char == "\n") break;
			if (posChar.char == "\r") break;
			if (posChar.char == "\t") break;
			if (operatorStartChars.includes(posChar.char)) break;

			chars.push(this.input.next().char);
		}
		const value = chars.join("");

		if (keywords.includes(value.trim())) {
			this.tokens.push({
				type: TokenType.Keyword,
				value: value.trim(),
				line: line,
				column: column
			});
			return;
		}

		if (value == trueName || value == falseName) {
			this.tokens.push({
				type: TokenType.LiteralBoolean,
				value: value,
				line: line,
				column: column
			});
		} else if (identifierStartChars.includes(value[0])) {
			this.tokens.push({
				type: TokenType.Identifier,
				value: value.trim(),
				line: line,
				column: column
			});
		} else {
			this.tokens.push({
				type: TokenType.LiteralNumber,
				value: value,
				line: line,
				column: column
			});
		}
	}

	private parseComment(pc: PosChar) {
		const secondSlash = this.input.next();
		const comment = [pc, secondSlash, ...this.input.readUntil(pc => pc.char == "\n")];

		this.tokens.push({
			type: TokenType.Comment,
			value: comment.map(pc => pc.char).join(""),
			line: comment[0].line,
			column: comment[0].column
		});
	}

	private parseOperand(value: string, pc: PosChar) {
		if (value.length == 2) this.input.next();

		this.tokens.push({
			type: TokenType.Operand,
			value: value,
			line: pc.line,
			column: pc.column
		});
	}

	private parseSymbol(value: string, pc: PosChar) {
		if (value.length == 2) this.input.next();

		this.tokens.push({
			type: TokenType.Symbol,
			value: value,
			line: pc.line,
			column: pc.column
		});
	}

	private parseChar() {
		const posChars = this.parseString("'");
		if (posChars.value.length > 1) throw new Error("Invalid char literal: " + posChars);

		this.tokens.push({
			type: TokenType.LiteralNumber,
			value: posChars.value.charCodeAt(0).toString(),
			line: posChars.line,
			column: posChars.column
		});
	}

	private parseString(endChar: string): Token {
		const chars: string[] = [];
		const charEscapedConversions: Record<string, string> = {
			n: "\n",
			t: "\t",
			r: "\r"
		};

		let firstCharLine = -1;
		let firstCharColumn = -1;

		while (!this.input.eof()) {
			const posChar = this.input.next();
			if (firstCharLine == -1) {
				firstCharLine = posChar.line;
				firstCharColumn = posChar.column;
			}

			const char = posChar.char;
			if (char == "\\") {
				// Maybe convert to newlines, tabs, etc
				const next = this.input.next();
				if (next.char in charEscapedConversions) {
					chars.push(charEscapedConversions[next.char]);
				} else {
					chars.push(next.char);
				}
			} else {
				if (char == endChar) break;
				chars.push(char);
			}
		}

		return {
			type: TokenType.LiteralString,
			value: chars.join(""),
			line: firstCharLine,
			column: firstCharColumn
		};
	}

	public static debug(stream: Stream<Token>) {
		let result = ``;
		stream._all().forEach(token => {
			result += `${token.line}:${token.column} ${token.type} ${token.value}\n`;
		});

		return result;
	}
}

export { Tokenizer, Token, TokenType, operandPrecedence, trueName, falseName };

import { DefinedUnitList, RefVar } from "./compiler/compiler.js";
import { Context } from "./compiler/context.js";
import { AST, getLastPos } from "./parser/ast.js";
import { Token, TokenType } from "./parser/tokenizer.js";
import { VTNode } from "./vtsParser.js";
import fs from "fs";

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

class AnalyzerContext {
	vars: string[] = [];

	constructor(public parent: AnalyzerContext | null) {}

	public hasVar(name: string) {
		const hasLocal = this.vars.includes(name);
		if (hasLocal) return true;
		if (this.parent) return this.parent.hasVar(name);
		return false;
	}

	public addVar(name: string) {
		this.vars.push(name);
	}

	public allVars(): string[] {
		return this.vars.concat(this.parent ? this.parent.allVars() : []);
	}
}

class Analyzer {
	public flatAst: AST.AnyAST[] = [];

	// private allContexts: AnalyzerContext[] = [];
	// private nodeContextMap: Map<AST.AnyAST, AnalyzerContext> = new Map();
	private contextRanges: { startLine: number; startColumn: number; endLine: number; endColumn: number; context: AnalyzerContext }[] = [];
	private contexts: AnalyzerContext[] = [new AnalyzerContext(null)];
	private unitLists: { name: string; type: string }[] = [];

	private get currentContext() {
		return this.contexts[this.contexts.length - 1];
	}

	constructor(private ast: AST.Program, private tokens: Token[], private vts: VTNode) {
		AST.walk(this.ast, node => this.flatAst.push(node));
	}

	public analyze() {
		this.flatAst.forEach(ast => this.analyzeAst(ast));
	}

	private analyzeAst(ast: AST.AnyAST) {
		// Load all context's and the variables in them
		if (!ast.lineEnd) {
			const end = getLastPos(ast);
			ast.lineEnd = end.line;
			ast.columnEnd = end.column;
		}

		switch (ast.type) {
			case AST.Type.VariableDeclaration:
				this.currentContext.addVar(ast.name.value);
				break;

			case AST.Type.FunctionDeclaration:
				const ctx = new AnalyzerContext(this.currentContext);
				this.contexts.push(ctx);
				this.contextRanges.push({ startLine: ast.line, startColumn: ast.column, endLine: ast.lineEnd, endColumn: ast.columnEnd, context: ctx });
				ast.parameters.forEach(param => this.currentContext.addVar(param.value));
				ast.body.forEach(node => this.analyzeAst(node));
				this.contexts.pop();
				break;

			case AST.Type.UnitDefine:
				this.unitLists.push({ name: ast.name.value, type: ast.unitType.value });
				break;
		}
	}

	public getSymbolsAtLine(line: number, column: number) {
		const contextRange = this.contextRanges.find(ctx => {
			if (line > ctx.startLine && line < ctx.endLine) return true; // Inside context
			const firstLineInside = line != ctx.startLine || column >= ctx.startColumn;
			const lastLineInside = line != ctx.endLine || column <= ctx.endColumn;
			const inLineBounds = line >= ctx.startLine && line <= ctx.endLine;

			return inLineBounds && firstLineInside && lastLineInside;
		});

		if (!contextRange) return this.contexts[0].allVars().concat(this.unitLists.map(unit => unit.name));

		return contextRange.context.allVars().concat(this.unitLists.map(unit => unit.name));
	}

	public getTokenSemantics() {
		return this.tokens
			.map(token => {
				const tokenSemantics = this.getTokenSemantic(token);

				if (tokenSemantics) {
					return {
						token: token,
						type: tokenSemantics
					};
				} else {
					return null;
				}
			})
			.filter(token => token != null);
	}

	private getTokenSemantic(token: Token): SemanticTokenTypes {
		switch (token.type) {
			case TokenType.Keyword:
				return SemanticTokenTypes.keyword;
			case TokenType.Symbol:
			case TokenType.Operand:
				return null;
			case TokenType.LiteralNumber:
				return SemanticTokenTypes.number;
			case TokenType.LiteralString:
				return SemanticTokenTypes.string;
			case TokenType.Identifier:
				return this.findIdentifierSemantics(token);
			case TokenType.Comment:
				return SemanticTokenTypes.comment;
			default:
				throw new Error(`Unknown token type ${token.type}`);
		}
	}

	private findIdentifierSemantics(token: Token): SemanticTokenTypes {
		const matchingAst = this.flatAst.find(ast => {
			for (const key in ast) {
				if (ast[key] === token) return true;
				if (Array.isArray(ast[key]) && ast[key].includes(token)) return true;
			}

			return false;
		});

		if (!matchingAst) {
			console.log(`Could not find token ${token.value} (${token.line}:${token.column})`);
			return null;
		}

		switch (matchingAst.type) {
			case AST.Type.UnitDefine:
				if (matchingAst.name == token) return SemanticTokenTypes.variable;
				if (matchingAst.unitType == token) return SemanticTokenTypes.class;
				throw new Error("Unknown identifier in UnitDefine");
			case AST.Type.VariableDeclaration:
			case AST.Type.VariableReference:
			case AST.Type.VariableAssignment:
				return SemanticTokenTypes.variable;
			case AST.Type.MethodCall:
				if (matchingAst.method == token) return SemanticTokenTypes.method;
				if (matchingAst.target == token) return SemanticTokenTypes.variable;
				throw new Error("Unknown identifier in MethodCall");
			case AST.Type.FunctionDeclaration:
				if (matchingAst.parameters.includes(token)) return SemanticTokenTypes.parameter;
				return SemanticTokenTypes.function;

			default:
				throw new Error(`Identifier semantics not implemented for ${matchingAst.type}`);
		}
	}
}

export { Analyzer };

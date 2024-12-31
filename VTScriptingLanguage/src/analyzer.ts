import { loadGameTypes } from "./compiler/gameTypes.js";
import { AST, getLastPos } from "./parser/ast.js";
import { Token, TokenType } from "./parser/tokenizer.js";
import { VTNode } from "./vtsParser.js";

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

// interface SymbolInformation {
// }
type SymbolInformation =
	| { type: "variable"; name: string }
	| { type: "define"; name: string; defType: string }
	| { type: "function"; name: string; args: { name: string; type: string }[]; returnType: string; intended: boolean };

class AnalyzerContext {
	private vars: string[] = [];
	private defines: { name: string; type: string }[] = [];

	constructor(public parent: AnalyzerContext | null) {}

	public hasVar(name: string) {
		const hasLocal = this.vars.includes(name);
		if (hasLocal) return true;
		if (this.parent) return this.parent.hasVar(name);
		return false;
	}

	public getDefine(name: string) {
		const local = this.defines.find(d => d.name == name);
		if (local) return local;

		if (this.parent) return this.parent.getDefine(name);
		return null;
	}

	public addVar(name: string) {
		this.vars.push(name);
	}

	public addDefine(name: string, type: string) {
		this.defines.push({ name, type });
	}

	public allVars(): string[] {
		// const allLocalVars = this.vars.concat(this.defines.map(d => d.name));
		return this.vars.concat(this.parent ? this.parent.allVars() : []);
	}

	public allDefines(): { name: string; type: string }[] {
		return this.defines.concat(this.parent ? this.parent.allDefines() : []);
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
		if (!ast) return;
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

			case AST.Type.FunctionDeclaration: {
				const ctx = new AnalyzerContext(this.currentContext);
				this.contexts.push(ctx);
				this.contextRanges.push({ startLine: ast.line, startColumn: ast.column, endLine: ast.lineEnd, endColumn: ast.columnEnd, context: ctx });
				ast.parameters.forEach(param => this.currentContext.addVar(param.value));
				ast.body.forEach(node => this.analyzeAst(node));
				this.contexts.pop();
				break;
			}

			case AST.Type.UnitDefine:
				// this.unitLists.push({ name: ast.name.value, type: ast.unitType.value });
				this.currentContext.addDefine(ast.name.value, ast.unitType.value);
				break;

			case AST.Type.ForEach: {
				const ctx = new AnalyzerContext(this.currentContext);
				const define = this.currentContext.getDefine(ast.list.value);
				ctx.addDefine(ast.variable.value, define.type);
				this.contextRanges.push({ startLine: ast.line, startColumn: ast.column, endLine: ast.lineEnd, endColumn: ast.columnEnd, context: ctx });
				break;
			}
		}
	}

	private identifyPartialEnumRead(line: number, column: number) {
		const selectedToken = this.tokens.find(token => {
			if (token.line != line) return false;
			const len = token.value.length;
			return token.column <= column && token.column + len >= column;
		});
		if (!selectedToken) return null;

		let isPartOfDotExpression = selectedToken.type == TokenType.Symbol && selectedToken.value == ".";
		let indexOffset = -1;
		if (!isPartOfDotExpression) {
			const previousToken = this.tokens[this.tokens.indexOf(selectedToken) - 1];
			isPartOfDotExpression = previousToken.type == TokenType.Symbol && previousToken.value == ".";
			indexOffset = -2;
		}

		if (!isPartOfDotExpression) return null;

		const enumName = this.tokens[this.tokens.indexOf(selectedToken) + indexOffset].value;
		const enumType = loadGameTypes().enums.find(e => e.name == enumName);
		return enumType;
	}

	public identifyPartialMethodCall(line: number, column: number, contexts: AnalyzerContext[]) {
		const selectedToken = this.tokens.find(token => {
			if (token.line != line) return false;
			const len = token.value.length;
			return token.column <= column && token.column + len >= column;
		});
		if (!selectedToken) return null;

		let isPartOfDotExpression = selectedToken.type == TokenType.Symbol && selectedToken.value == ".";
		let index = this.tokens.indexOf(selectedToken) - 1;
		if (!isPartOfDotExpression) {
			const previousToken = this.tokens[index];
			isPartOfDotExpression = previousToken.type == TokenType.Symbol && previousToken.value == ".";
			index--;
		}

		if (!isPartOfDotExpression) return null;

		const maybeIndexExpr = this.tokens[index];
		if (maybeIndexExpr.type == TokenType.Symbol && maybeIndexExpr.value == "]") {
			while (this.tokens[index].value != "[") index--;
		}
		const maybeCloseIndexExpr = this.tokens[index];
		if (maybeCloseIndexExpr.type == TokenType.Symbol && maybeCloseIndexExpr.value == "[") index--;

		const targetName = this.tokens[index].value;
		const isEnum = loadGameTypes().enums.some(e => e.name == targetName);
		if (isEnum) return null;

		const define = contexts.find(ctx => ctx.getDefine(targetName))?.getDefine(targetName);
		if (!define) return null;

		const methods = loadGameTypes().classes.find(c => c.name == define.type).methods;
		return methods;
	}

	public identifyPartialDefine(line: number, column: number) {
		const selectedToken = this.tokens.find(token => {
			if (token.line != line) return false;
			const len = token.value.length;
			return token.column <= column && token.column + len >= column;
		});
		if (!selectedToken) return null;
		let isPartOfColon = selectedToken.type == TokenType.Symbol && selectedToken.value == ":";
		let indexOffset = -1;
		if (!isPartOfColon) {
			const previousToken = this.tokens[this.tokens.indexOf(selectedToken) - 1];
			isPartOfColon = previousToken.type == TokenType.Symbol && previousToken.value == ":";
			indexOffset = -2;
		}

		if (!isPartOfColon) return null;

		const defineKeyword = this.tokens[this.tokens.indexOf(selectedToken) + indexOffset - 1];
		if (!defineKeyword || defineKeyword.type != TokenType.Keyword || defineKeyword.value != "define") return null;

		const classTypes = loadGameTypes().classes.map(c => c.name);
		return classTypes;
	}

	public getSymbolsAtLine(line: number, column: number): SymbolInformation[] {
		const partialEnum = this.identifyPartialEnumRead(line, column);
		if (partialEnum) return partialEnum.values.map(v => ({ name: v.key, type: "variable" }));

		const partialDefine = this.identifyPartialDefine(line, column);
		if (partialDefine) return partialDefine.map(d => ({ name: d, type: "variable" }));

		const contextRange = this.contextRanges.filter(ctx => {
			if (line > ctx.startLine && line < ctx.endLine) return true; // Inside context
			const firstLineInside = line != ctx.startLine || column >= ctx.startColumn;
			const lastLineInside = line != ctx.endLine || column <= ctx.endColumn;
			const inLineBounds = line >= ctx.startLine && line <= ctx.endLine;

			return inLineBounds && firstLineInside && lastLineInside;
		});

		contextRange.forEach(ctx => console.log(ctx.context));

		const partialMethod = this.identifyPartialMethodCall(line, column, [this.contexts[0], ...contextRange.map(ctx => ctx.context)]);
		if (partialMethod) {
			return partialMethod.map(m => {
				return {
					name: m.name,
					type: "function",
					args: m.args,
					returnType: m.returnType,
					intended: !!m.decorator
				};
			});
		}

		const vars: Set<string> = new Set();
		const defs: { name: string; type: string }[] = [];
		this.contexts[0].allVars().forEach(varName => vars.add(varName));
		this.contexts[0].allDefines().forEach(def => {
			if (defs.some(d => d.name == def.name)) return;
			defs.push(def);
		});

		contextRange.forEach(range => {
			range.context.allVars().forEach(varName => vars.add(varName));
			range.context.allDefines().forEach(def => {
				if (defs.some(d => d.name == def.name)) return;
				defs.push(def);
			});
		});

		// Load enums
		loadGameTypes().enums.forEach(e => vars.add(e.name));

		const result: SymbolInformation[] = [];
		vars.forEach(v => result.push({ name: v, type: "variable" }));
		defs.forEach(d => result.push({ name: d.name, type: "define", defType: d.type }));

		return result;
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
			case TokenType.LiteralBoolean:
				return SemanticTokenTypes.type;
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
			console.log(`Could not find token ${token.value} (${token.line}:${token.column}) for semantics`);
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
				if (matchingAst.noWait == token) return SemanticTokenTypes.keyword;
				return SemanticTokenTypes.function;
			case AST.Type.ForEach:
				return SemanticTokenTypes.variable;
			case AST.Type.PropertyAccess:
				if (matchingAst.property == token) return SemanticTokenTypes.property;
				if (matchingAst.target == token) return SemanticTokenTypes.class;
				throw new Error("Unknown identifier in PropertyAccess");
			case AST.Type.FunctionCall:
				if (matchingAst.target == token) return SemanticTokenTypes.function;
				// if(matchingAst.arguments.includes(token)) return SemanticTokenTypes.parameter;
				throw new Error("Unknown identifier in FunctionCall");

			default:
				console.log(`Identifier semantics not implemented for ${matchingAst.type}`);
			// throw new Error(`Identifier semantics not implemented for ${matchingAst.type}`);
		}
	}
}

export { Analyzer };

import { Compiler } from "./compiler/compiler.js";
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

	public hasDefine(name: string) {
		const hasLocal = this.defines.find(d => d.name == name);
		if (hasLocal) return true;
		if (this.parent) return this.parent.hasDefine(name);
		return false;
	}

	public getDefine(name: string): { name: string; type: string } {
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
	private functions: AST.FunctionDeclaration[] = [];

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
				this.functions.push(ast);
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
		// let indexOffset = -1;
		let index = this.tokens.indexOf(selectedToken) - 1;
		if (index < 0) return null;
		if (!isPartOfDotExpression) {
			const previousToken = this.tokens[index];
			isPartOfDotExpression = previousToken.type == TokenType.Symbol && previousToken.value == ".";
			index--;
		}

		if (!isPartOfDotExpression) return null;
		if (index < 0) return null;

		const enumName = this.tokens[index].value;
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
		if (index < 0) return null;
		if (!isPartOfDotExpression) {
			const previousToken = this.tokens[index];
			isPartOfDotExpression = previousToken.type == TokenType.Symbol && previousToken.value == ".";
			index--;
		}

		if (!isPartOfDotExpression) return null;
		if (index < 0) return null;

		const maybeModifier = this.tokens[index];
		if (maybeModifier.type == TokenType.Identifier && (maybeModifier.value == "any" || maybeModifier.value == "all")) index -= 2;
		if (index < 0) return null;

		const maybeIndexExpr = this.tokens[index];
		if (maybeIndexExpr.type == TokenType.Symbol && maybeIndexExpr.value == "]") {
			while (this.tokens[index].value != "[") index--;
		}

		if (index < 0) return null;
		const maybeCloseIndexExpr = this.tokens[index];
		if (maybeCloseIndexExpr.type == TokenType.Symbol && maybeCloseIndexExpr.value == "[") index--;

		if (index < 0) return null;
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
		// let indexOffset = -1;
		let index = this.tokens.indexOf(selectedToken) - 1;
		if (index < 0) return null;
		if (!isPartOfColon) {
			const previousToken = this.tokens[index];
			isPartOfColon = previousToken.type == TokenType.Symbol && previousToken.value == ":";
			index--;
		}

		if (!isPartOfColon) return null;
		if (index - 1 < 0) return null;

		const defineKeyword = this.tokens[index - 1];
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

		const partialMethod = this.identifyPartialMethodCall(line, column, [this.contexts[0], ...contextRange.map(ctx => ctx.context)]);
		if (partialMethod) {
			const pMethods: SymbolInformation[] = partialMethod.map(m => {
				return {
					name: m.name,
					type: "function",
					args: m.args,
					returnType: m.returnType,
					intended: !!m.decorator
				};
			});

			pMethods.push({ name: "any", type: "variable" });
			pMethods.push({ name: "all", type: "variable" });

			return pMethods;
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

		this.functions.forEach(f => {
			result.push({ name: f.name.value, type: "function", args: f.parameters.map(p => ({ name: p.value, type: "GV" })), returnType: "", intended: true });
		});

		const builtIns = Compiler.getBuiltInFunctions(null);
		builtIns.forEach(b => {
			result.push({ name: b.name, type: "function", args: b.args, returnType: b.returnType, intended: true });
		});

		return result;
	}

	public getHoverAtLine(line: number, column: number): string {
		const token = this.tokens.find(token => {
			if (token.line != line) return false;
			const len = token.value.length;
			return token.column <= column && token.column + len >= column;
		});
		if (!token) return null;
		if (token.type != TokenType.Identifier) return null;

		const contextRange = this.contextRanges.filter(ctx => {
			if (line > ctx.startLine && line < ctx.endLine) return true; // Inside context
			const firstLineInside = line != ctx.startLine || column >= ctx.startColumn;
			const lastLineInside = line != ctx.endLine || column <= ctx.endColumn;
			const inLineBounds = line >= ctx.startLine && line <= ctx.endLine;

			return inLineBounds && firstLineInside && lastLineInside;
		});
		const contexts = [this.contexts[0], ...contextRange.map(ctx => ctx.context)];
		const matchingAst = this.getTokenAst(token);
		if (!matchingAst) return null;
		switch (matchingAst.type) {
			case AST.Type.UnitDefine:
				if (matchingAst.name == token) return `${matchingAst.name.value}: ${matchingAst.unitType.value}`;
				if (matchingAst.unitType == token) return `(type) ${matchingAst.unitType.value}`;
				throw new Error("Unknown identifier in UnitDefine");
			case AST.Type.VariableDeclaration:
			case AST.Type.VariableReference:
				const fn = this.functions.find(f => f.name.value == matchingAst.name.value);
				if (fn) return `(function) ${matchingAst.name.value}(${fn.parameters.map(p => p.value).join(", ")})`;
			case AST.Type.VariableAssignment:
				return `let ${matchingAst.name.value}: GV`;
			case AST.Type.MethodCall:
				const ctx = contexts.find(ctx => ctx.hasDefine(matchingAst.target.value));
				if (!ctx) return `(method) Unknown.${matchingAst.method.value}()`;
				const define = ctx.getDefine(matchingAst.target.value);
				if (matchingAst.target == token) return `${matchingAst.target.value}: ${define.type}`;

				const method = loadGameTypes()
					.classes.find(c => c.name == define.type)
					.methods.find(m => m.name == matchingAst.method.value);
				if (!method) return `(method) ${define.type}.${matchingAst.method.value}()`;

				const args = method.args.map(a => `${a.name}: ${a.type}`).join(", ");
				return `(method) ${define.type}.${matchingAst.method.value}(${args}): ${method.returnType}`;

			case AST.Type.FunctionDeclaration:
				return `(function) ${matchingAst.name.value}(${matchingAst.parameters.map(p => p.value).join(", ")})`;
			// case AST.Type.PropertyAccess:
			// 	if (matchingAst.property == token) return SemanticTokenTypes.property;
			// 	if (matchingAst.target == token) return SemanticTokenTypes.class;
			// 	throw new Error("Unknown identifier in PropertyAccess");
			case AST.Type.FunctionCall:
				const declaration = this.functions.find(f => f.name.value == matchingAst.target.value);
				if (!declaration) return `(function) ${matchingAst.target.value}()`;
				const callArgs = declaration.parameters.map(p => p.value).join(", ");
				return `(function) ${matchingAst.target.value}(${callArgs})`;

			case AST.Type.Declare:
				if (matchingAst.name != token) return null;
				if (matchingAst.declareType.value == "GV") return `${matchingAst.name.value}: GV`;
				if (matchingAst.declareType.value == "Sequence") return `(function) ${matchingAst.name.value}()`;
				return null;
		}
	}

	public getTokenSemantics() {
		return this.tokens
			.map(token => {
				const tokenSemantics = this.getTokenSemantic(token);
				// if (token.type == TokenType.LiteralString) token.value += "  "; // Hack to make sure the string includes the last quote

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

	private getTokenAst(token: Token): AST.AnyAST {
		return this.flatAst.find(ast => {
			for (const key in ast) {
				if (ast[key] === token) return true;
				if (Array.isArray(ast[key]) && ast[key].includes(token)) return true;
			}

			return false;
		});
	}

	private findIdentifierSemantics(token: Token): SemanticTokenTypes {
		const matchingAst = this.getTokenAst(token);
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
				if (matchingAst.modifier == token) return SemanticTokenTypes.keyword;
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

			case AST.Type.Declare:
				if (matchingAst.name == token) return SemanticTokenTypes.variable;
				if (matchingAst.declareType == token) return SemanticTokenTypes.class;
				throw new Error("Unknown identifier in Declare");

			default:
				console.log(`Identifier semantics not implemented for ${matchingAst.type}`);
			// throw new Error(`Identifier semantics not implemented for ${matchingAst.type}`);
		}
	}
}

export { Analyzer };

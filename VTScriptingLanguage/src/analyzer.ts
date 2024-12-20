import { DefinedUnitList, RefVar } from "./compiler/compiler.js";
import { Context } from "./compiler/context.js";
import { AST } from "./parser/ast.js";
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

class Analyzer {
	private flatAst: AST.AnyAST[] = [];

	constructor(private ast: AST.Program, private tokens: Token[], private vts: VTNode) {
		AST.walk(this.ast, node => this.flatAst.push(node));
	}

	public analyze() {}

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
			case TokenType.Literal:
				return SemanticTokenTypes.number;
			case TokenType.Identifier:
				return this.findIdentifierSemantics(token);
		}
	}

	private findIdentifierSemantics(token: Token): SemanticTokenTypes {
		const matchingAst = this.flatAst.find(ast => {
			for (const key in ast) {
				if (ast[key] === token) return true;
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

			default:
				console.log(`Identifier semantics not implemented for ${matchingAst.type}`);
		}
	}

	private analyzeAst(ast: AST.AnyAST) {}
}

export { Analyzer };

import { Stream } from "../stream.js";
import { AST } from "./ast.js";
import { operandPrecedence, Token, TokenType } from "./tokenizer.js";

type Positional = { line: number; column: number; lineEnd?: number; columnEnd?: number };
function getLastPos(ast: Positional | Positional[], fallback?: Positional) {
	if (ast === undefined && fallback === undefined) throw new Error("No fallback provided for getLastPos");
	if ((Array.isArray(ast) && ast.length == 0) || !ast) return getLastPos(fallback);
	const last = Array.isArray(ast) ? ast[ast.length - 1] : ast;
	if (last.lineEnd) {
		return {
			line: last.lineEnd,
			column: last.columnEnd
		};
	}

	return {
		line: last.line,
		column: last.column
	};
}

function getLastPosNamed(ast: Positional | Positional[], fallback?: Positional) {
	const last = getLastPos(ast, fallback);
	return {
		lineEnd: last.line,
		columnEnd: last.column
	};
}

function correctOrderPos(a: Positional, b: Positional) {
	const sameLine = a.line == b.line;
	if (a.line < b.line || (sameLine && a.column < b.column)) {
		const bEnd = getLastPos(b);
		return {
			line: a.line,
			column: a.column,

			lineEnd: bEnd.line,
			columnEnd: bEnd.column
		};
	} else {
		const aEnd = getLastPos(a);
		return {
			line: b.line,
			column: b.column,

			lineEnd: aEnd.line,
			columnEnd: aEnd.column
		};
	}
}

class Parser {
	constructor(private tokens: Stream<Token>) {}

	public parse() {
		const prog: AST.Program = {
			type: AST.Type.Prog,
			body: [],
			line: 0,
			column: 0
		};

		while (!this.tokens.eof()) {
			prog.body.push(this.parseAst());
		}

		return prog;
	}

	private parseAst(): AST.AnyAST {
		const token = this.tokens.peek();
		let result: AST.AnyAST;
		switch (token.type) {
			case TokenType.Keyword:
				result = this.handleKeyword();
				break;
			case TokenType.Literal:
				result = this.handleLiteral();
				break;
			case TokenType.Symbol:
				result = this.handleSymbol();
				break;
			case TokenType.Operand:
				result = this.handleOperand();
				break;
			case TokenType.Identifier:
				result = this.handleIdentifier();
				break;
			default:
				throw new Error(`Unexpected type ${token.type} (${token.value}) at ${token.line}:${token.column}`);
		}

		const next = this.tokens.peek();
		if (!next) return result;

		if (next.type == TokenType.Operand && token.value != ";") {
			return this.handleBinaryOperation(result);
		}

		return result;
	}

	private handleIncOrDec(left: AST.AnyAST, operation: string) {
		if (left.type != AST.Type.VariableReference) throw new Error(`Invalid operand for ${operation} at ${left.line}:${left.column}`);

		const op: Token = { type: TokenType.Operand, value: operation[0], line: left.line, column: left.column };

		const right = this.parseAst();
		const binOp: AST.BinaryOperation = {
			type: AST.Type.BinaryOperation,
			left: left,
			right: right,
			operator: op,

			...correctOrderPos(left, getLastPos(right))
		};

		const assignment: AST.VariableAssignment = {
			type: AST.Type.VariableAssignment,
			name: left.name,
			expression: binOp,

			...correctOrderPos(left, getLastPos(binOp))
		};

		return assignment;
	}

	private handleBinaryOperation(left: AST.AnyAST, prec = 0) {
		const operator = this.tokens.peek();
		if (!operator || operator.type != TokenType.Operand) {
			return left;
		}

		this.tokens.next();

		if (operator.value == "+=" || operator.value == "-=" || operator.value == "*=") {
			return this.handleIncOrDec(left, operator.value);
		}

		const opPrec = operandPrecedence[operator.value];
		if (!opPrec) throw new Error(`No operand precedence for ${operator.value}`);

		if (opPrec > prec) {
			const right = this.handleBinaryOperation(this.parseAst(), opPrec);
			const binOp: AST.AnyAST = {
				type: AST.Type.BinaryOperation,
				operator: operator,
				left: left,
				right: right,

				...correctOrderPos(left, getLastPos(right))
			};

			return this.handleBinaryOperation(binOp, prec);
		} else {
			return left;
		}
	}

	private handleKeyword() {
		const keyword = this.tokens.peek();
		switch (keyword.value) {
			case "define":
				return this.handleUnitDefine();
			case "forEach":
				return this.handleForEach();
			// case "for":
			// 	return this.handleFor();
			case "while":
				return this.handleWhile();
			case "fn":
				return this.handleFunctionDeclaration();
			case "let":
				return this.handleVariableDeclaration();
			case "ref":
				return this.handleUnitReference();
			case "if":
				return this.handleIfStatement();
			case "return":
				return this.handleReturn();
			default:
				throw new Error(`Unexpected keyword ${keyword.value} at ${keyword.line}:${keyword.column}`);
		}
	}

	private handleSymbol() {
		const symbol = this.tokens.next();
		switch (symbol.value) {
			case "(": {
				const result = this.parseAst();
				// this.tokens.next(); // Read )
				this.consumeOrThrow(")");
				return result;
			}

			case ";": {
				const semi: AST.Semi = { type: AST.Type.Semi, line: symbol.line, column: symbol.column };
				return semi;
			}

			default:
				throw new Error(`Unexpected symbol "${symbol.value}" at ${symbol.line}:${symbol.column}`);
		}
	}

	private handleOperand() {
		const operand = this.tokens.next();

		switch (operand.value) {
			case "-":
			case "!":
				const expression = this.parseAst();
				const operandNode: AST.UnaryOperation = {
					type: AST.Type.UnaryOperation,
					operator: operand,
					operand: expression,
					line: operand.line,
					column: operand.column,
					...getLastPosNamed(expression)
				};
				return operandNode;

			default:
				throw new Error(`Unexpected operand "${operand.value}" at ${operand.line}:${operand.column}`);
		}
	}

	private handleReturn() {
		const ret = this.tokens.next();
		const retValue = this.parseAst();
		const retAst: AST.Return = {
			type: AST.Type.Return,
			value: retValue,
			line: ret.line,
			column: ret.column,
			...getLastPosNamed(retValue)
		};

		return retAst;
	}

	private handleIdentifier() {
		const identifier = this.tokens.next();
		const next = this.tokens.peek();
		if (next.value == "(") return this.handleFunctionCall(identifier);
		if (next.value == ".") return this.handlePropertyAccess(identifier);
		if (next.value == "[") return this.handleIndexAccess(identifier);
		if (next.value == "=") return this.handleVariableAssignment(identifier);

		const variableReference: AST.VariableReference = {
			type: AST.Type.VariableReference,
			name: identifier,
			line: identifier.line,
			column: identifier.column
		};

		return variableReference;
	}

	private handleVariableAssignment(identifier: Token) {
		this.consumeOrThrow("=");
		const value = this.parseAst();

		const variableAssignment: AST.VariableAssignment = {
			type: AST.Type.VariableAssignment,
			name: identifier,
			expression: value,

			line: identifier.line,
			column: identifier.column,

			...getLastPosNamed(value)
		};

		return variableAssignment;
	}

	private handleFunctionCall(identifier: Token) {
		const args = this.parseParenthesizedList();
		const functionCall: AST.FunctionCall = {
			type: AST.Type.FunctionCall,
			target: identifier,
			arguments: args,

			line: identifier.line,
			column: identifier.column,
			...getLastPosNamed(args, identifier)
		};

		return functionCall;
	}

	private handlePropertyAccess(identifier: Token) {
		this.consumeOrThrow(".");
		const property = this.tokens.next();

		const nextTkn = this.tokens.peek();
		if (nextTkn.value == "(") {
			// Method call
			const args = this.parseParenthesizedList();
			const methodCall: AST.MethodCall = {
				type: AST.Type.MethodCall,
				target: identifier,
				method: property,
				arguments: args,

				line: identifier.line,
				column: identifier.column,

				...getLastPosNamed(args, identifier)
			};

			return methodCall;
		}

		const propertyAccess: AST.PropertyAccess = {
			type: AST.Type.PropertyAccess,
			target: identifier,
			property: property,

			line: identifier.line,
			column: identifier.column,

			...getLastPosNamed(property)
		};

		return propertyAccess;
	}

	private handleIndexAccess(identifier: Token) {
		this.consumeOrThrow("[");
		const index = this.parseAst();
		this.consumeOrThrow("]");
		const indexAccess: AST.IndexAccess = {
			type: AST.Type.IndexAccess,
			target: identifier,
			index: index,

			line: identifier.line,
			column: identifier.column,

			...getLastPosNamed(index)
		};

		return indexAccess;
	}

	private handleLiteral() {
		const literal = this.tokens.next();
		const val = parseInt(literal.value);
		if (isNaN(val)) throw new Error(`Invalid numeric ${literal.value} at ${literal.line}:${literal.column}`);

		const literalNumber: AST.LiteralNumber = {
			type: AST.Type.LiteralNumber,
			value: val,
			line: literal.line,
			column: literal.column
		};

		return literalNumber;
	}

	private parseOptionallyParenthesizedList() {
		const next = this.tokens.peek();
		if (next.value == "(") {
			return this.parseParenthesizedList();
		} else {
			return [this.parseAst()];
		}
	}

	private parseParenthesizedList() {
		const result: AST.AnyAST[] = [];

		this.consumeOrThrow("(");
		while (!this.maybeConsume(")")) {
			if (this.maybeConsume(",")) continue;
			result.push(this.parseAst());
		}

		return result;
	}

	private parseOptionallyBracketedBody() {
		const next = this.tokens.peek();
		if (next.value == "{") {
			return this.parseBracketedBody();
		} else {
			return [this.parseAst()];
		}
	}

	private parseBracketedBody() {
		this.consumeOrThrow("{");
		const body: AST.AnyAST[] = [];
		while (!this.maybeConsume("}")) {
			body.push(this.parseAst());
		}

		return body;
	}

	private handleUnitDefine() {
		// define players: MultiplayerSpawn = (1..5, 11, 12);

		const define = this.tokens.next();
		const name = this.tokens.next();
		this.consumeOrThrow(":");
		const type = this.tokens.next();
		this.consumeOrThrow("=");

		const values = this.parseOptionallyParenthesizedList();
		values.forEach(value => {
			if (value.type == AST.Type.BinaryOperation) {
				if (value.left.type != AST.Type.LiteralNumber || value.right.type != AST.Type.LiteralNumber) {
					throw new Error(`Invalid range ${value.left}..${value.right} (must be constant) at ${value.line}:${value.column}`);
				}
			} else if (value.type != AST.Type.LiteralNumber) throw new Error(`Invalid value ${value} (must be constant) at ${value.line}:${value.column}`);
		});

		const unitDefine: AST.UnitDefine = {
			type: AST.Type.UnitDefine,
			name: name,

			idRanges: values as (AST.LiteralNumber | AST.BinaryOperation)[],
			unitType: type,

			line: define.line,
			column: define.column,

			...getLastPosNamed(values, type)
		};

		return unitDefine;
	}

	private handleForEach() {
		const forEach = this.tokens.next();
		this.consumeOrThrow("(");
		const list = this.tokens.next();
		this.consumeOrThrow("as");
		const variable = this.tokens.next();
		this.consumeOrThrow(")");
		const body = this.parseOptionallyBracketedBody();

		const forEachStatement: AST.ForEach = {
			type: AST.Type.ForEach,
			list: list,
			variable: variable,
			body: body,

			line: forEach.line,
			column: forEach.column,

			...getLastPosNamed(body)
		};

		return forEachStatement;
	}

	private handleWhile() {
		const _while = this.tokens.next();
		this.consumeOrThrow("(");
		const condition = this.parseAst();
		this.consumeOrThrow(")");
		const body = this.parseOptionallyBracketedBody();

		const whileStatement: AST.While = {
			type: AST.Type.While,
			condition: condition,
			body: body,

			line: _while.line,
			column: _while.column,

			...getLastPosNamed(body)
		};

		return whileStatement;
	}

	private handleFunctionDeclaration() {
		const fn = this.tokens.next();
		const name = this.tokens.next();

		const params: Token[] = [];
		this.consumeOrThrow("(");
		while (!this.maybeConsume(")")) {
			if (this.maybeConsume(",")) continue;
			params.push(this.tokens.next());
		}

		const body = this.parseBracketedBody();

		const functionDeclaration: AST.FunctionDeclaration = {
			type: AST.Type.FunctionDeclaration,
			name: name,
			body: body,
			parameters: params,

			line: fn.line,
			column: fn.column,

			...getLastPosNamed(body)
		};

		return functionDeclaration;
	}

	private handleVariableDeclaration() {
		const letToken = this.tokens.next();
		const name = this.tokens.next();
		this.consumeOrThrow("=");
		const value = this.parseAst();

		const variableDeclaration: AST.VariableDeclaration = {
			type: AST.Type.VariableDeclaration,
			name: name,
			expression: value,

			line: letToken.line,
			column: letToken.column,

			...getLastPosNamed(value)
		};

		return variableDeclaration;
	}

	private handleUnitReference() {
		const ref = this.tokens.next();
		const name = this.tokens.next();
		this.consumeOrThrow("=");
		const value = this.parseAst();
		if (value.type != AST.Type.IndexAccess) throw new Error(`Unit reference must be an indexed lookup currently at ${value.line}:${value.column}`);

		const unitReference: AST.UnitReference = {
			type: AST.Type.UnitReference,
			name: name,
			expression: value,

			line: ref.line,
			column: ref.column,

			...getLastPosNamed(value)
		};

		return unitReference;
	}

	private handleIfStatement() {
		const _if = this.tokens.next();
		this.consumeOrThrow("(");
		const condition = this.parseAst();
		this.consumeOrThrow(")");
		const body = this.parseOptionallyBracketedBody();

		const elIfs: AST.IfStatement[] = [];
		let next = this.tokens.peek();
		while (next && next.value == "elseif") {
			const nextIfToken = this.tokens.next(); // Read elseif

			elIfs.push(this.handleIfStatement());
		}

		let elseBody: AST.AnyAST[] = [];
		next = this.tokens.peek();
		if (next && next.value == "else") {
			const elseToken = this.tokens.next(); // Read else
			elseBody = this.parseBracketedBody();
		}

		const ifStatement: AST.IfStatement = {
			type: AST.Type.IfStatement,
			condition: condition,
			then: body,
			elseIfs: elIfs,
			else: elseBody.length > 0 ? elseBody : null,

			line: _if.line,
			column: _if.column,

			...getLastPosNamed(elseBody, getLastPos(elIfs, getLastPos(body)))
		};

		return ifStatement;
	}

	private maybeConsume(value: string) {
		const next = this.tokens.peek();
		if (next.value == value) {
			this.tokens.next();
			return true;
		}

		return false;
	}

	private maybeConsumeAndReturn(value: string) {
		const next = this.tokens.peek();
		if (next.value == value) {
			return this.tokens.next();
		}

		return null;
	}

	private consumeOrThrow(value: string) {
		const consumed = this.maybeConsume(value);
		if (!consumed) throw new Error(`Expected ${value}`);
	}
}

export { Parser };

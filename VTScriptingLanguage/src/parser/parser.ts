import { Stream } from "../stream.js";
import { AST, correctOrderPos, getLastPos, getLastPosNamed } from "./ast.js";
import { operandPrecedence, Token, TokenType, trueName } from "./tokenizer.js";

interface ParserError {
	message: string;
	line: number;
	column: number;
	token: Token;
}

const LOG_STACK = true;

class Parser {
	public errors: ParserError[] = [];
	private lastMaybeConsumed: Token;
	constructor(private tokens: Stream<Token>, private continueOnError = true) {}

	public parse() {
		const prog: AST.Program = {
			type: AST.Type.Prog,
			body: [],
			line: 0,
			column: 0
		};

		try {
			while (!this.tokens.eof()) {
				const ast = this.parseAst();
				if (ast != null) prog.body.push(ast);
			}
		} catch (e) {
			console.log(`Parse error bubbled to top level: ${e.message}`);
			this.errors.push({
				message: e.message,
				line: 0,
				column: 0,
				token: { type: TokenType.Comment, value: "", line: 0, column: 0 }
			});
		}

		return prog;
	}

	private parseAst(): AST.AnyAST {
		if (this.errors.length > 50) throw new Error("Too many errors, aborting parsing");
		const token = this.tokens.peek();
		try {
			let result: AST.AnyAST;
			switch (token.type) {
				case TokenType.Keyword:
					result = this.handleKeyword();
					break;
				case TokenType.LiteralNumber:
					result = this.handleLiteralNumber();
					break;
				case TokenType.LiteralString:
					result = this.handleLiteralString();
					break;
				case TokenType.LiteralBoolean:
					result = this.handleLiteralBool();
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
				case TokenType.Comment:
					result = this.handleComment();
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
		} catch (e) {
			console.log(`Error parsing token ${token.value} at ${token.line}:${token.column}`);
			if (!LOG_STACK) console.log(`\t${e.message}`);
			else console.log(e);

			this.errors.push({
				message: e.message,
				line: token.line,
				column: token.column,
				token: token
			});

			if (!this.continueOnError) throw e;

			return null;
		}
	}

	private handleComment() {
		const commentToken = this.tokens.next();
		const comment: AST.Comment = {
			type: AST.Type.Comment,
			value: commentToken,

			line: commentToken.line,
			column: commentToken.column,
			lineEnd: commentToken.line,
			columnEnd: commentToken.column + commentToken.value.length
		};

		return comment;
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
			indexer: null,

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
			case "for":
				return this.handleFor();
			case "while":
				return this.handleWhile();
			case "fn":
				return this.handleFunctionDeclaration();
			case "let":
				return this.handleVariableDeclaration();
			case "arr":
				return this.handleArrayDeclaration();
			case "ref":
				return this.handleUnitReference();
			case "if":
				return this.handleIfStatement();
			case "return":
				return this.handleReturn();
			case "declare":
				return this.handleExternalDeclaration();
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

			case "{": {
				return this.parseVectorLiteral(symbol);
			}

			case ";": {
				const semi: AST.Semi = { type: AST.Type.Semi, line: symbol.line, column: symbol.column, lineEnd: symbol.line, columnEnd: symbol.column + 1 };
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
		let next = this.tokens.peek();

		let indexer: AST.AnyAST = null;
		if (next.value == "(") return this.handleFunctionCall(identifier);
		if (next.value == "." || next.value == "[") {
			const propMethodOrIndex = this.handlePropertyAccess(identifier);
			if (!propMethodOrIndex) return null;

			if (propMethodOrIndex.type == "index") indexer = propMethodOrIndex.result;
			else return propMethodOrIndex.result;
		}

		// Re-peak next as consuming the indexer might have consumed the next token
		next = this.tokens.peek();
		if (next.value == "=") return this.handleVariableAssignment(identifier, indexer);

		const variableReference: AST.VariableReference = {
			type: AST.Type.VariableReference,
			name: identifier,
			indexer: indexer,
			line: identifier.line,
			column: identifier.column,
			lineEnd: identifier.line,
			columnEnd: identifier.column + identifier.value.length
		};

		return variableReference;
	}

	private handleVariableAssignment(identifier: Token, indexer: AST.AnyAST) {
		this.consumeOrThrow("=");
		const value = this.parseAst();

		const variableAssignment: AST.VariableAssignment = {
			type: AST.Type.VariableAssignment,
			name: identifier,
			expression: value,
			indexer: indexer,

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

	private handlePropertyAccess(identifier: Token): { type: "index" | "property"; result: AST.AnyAST } {
		const next = this.tokens.peek();
		let indexer: AST.AnyAST | null = null;
		if (next.value == "[") {
			this.consumeOrThrow("[");
			indexer = this.parseAst();
			this.consumeOrThrow("]");
		}

		if (!this.maybeConsume(".")) {
			if (!indexer) throw new Error(`Expected . or [ at ${next.line}:${next.column}`);
			return { type: "index", result: indexer };
		}

		let property = this.tokens.peek();
		if (property.type != TokenType.Identifier) {
			// Misstyped property, should error but lets gracefully exit so that we can provide autocomplete
			return null;
			// throw new Error(`Invalid property ${property.value} at ${property.line}:${property.column}`);
		}
		this.tokens.next();

		let middle: Token = null;
		if (this.maybeConsume(".")) {
			middle = property;
			property = this.tokens.next();
		}

		const nextTkn = this.tokens.peek();
		if (nextTkn.value == "(") {
			// Method call
			const args = this.parseParenthesizedList();
			const methodCall: AST.MethodCall = {
				type: AST.Type.MethodCall,
				target: identifier,
				method: property,
				arguments: args,
				indexer: indexer,
				modifier: middle,

				line: identifier.line,
				column: identifier.column,

				...getLastPosNamed(args, nextTkn)
			};

			return { type: "property", result: methodCall };
		}

		const propertyAccess: AST.PropertyAccess = {
			type: AST.Type.PropertyAccess,
			target: identifier,
			property: property,
			indexer: indexer,

			line: identifier.line,
			column: identifier.column,

			...getLastPosNamed(property)
		};

		return { type: "property", result: propertyAccess };
	}

	private handleLiteralNumber() {
		const literal = this.tokens.next();
		const val = parseInt(literal.value);
		if (isNaN(val)) throw new Error(`Invalid numeric ${literal.value} at ${literal.line}:${literal.column}`);

		const literalNumber: AST.Literal = {
			type: AST.Type.Literal,
			value: val,
			line: literal.line,
			column: literal.column,
			lineEnd: literal.line,
			columnEnd: literal.column + literal.value.length
		};

		return literalNumber;
	}

	private handleLiteralString() {
		const literal = this.tokens.next();
		const val = literal.value;
		const literalString: AST.Literal = {
			type: AST.Type.Literal,
			value: val,
			line: literal.line,
			column: literal.column,
			lineEnd: literal.line,
			columnEnd: literal.column + val.length
		};

		return literalString;
	}

	private handleLiteralBool() {
		const literal = this.tokens.next();
		const val = literal.value == trueName;
		const literalBool: AST.Literal = {
			type: AST.Type.Literal,
			value: val,
			line: literal.line,
			column: literal.column,
			lineEnd: literal.line,
			columnEnd: literal.column + literal.value.length
		};

		return literalBool;
	}

	private parseVectorLiteral(openBrace: Token) {
		const vec = { x: 0, y: 0, z: 0 };
		let closeBrace: Token;
		while (!(closeBrace = this.maybeConsumeAndReturn("}"))) {
			const key = this.tokens.next();
			this.consumeOrThrow(":");
			const value = this.tokens.next();
			this.maybeConsume(",");
			if (value.type != TokenType.LiteralNumber) throw new Error(`Invalid literal ${value.value} for vector at ${value.line}:${value.column}`);

			switch (key.value) {
				case "x":
					vec.x = parseInt(value.value);
					break;
				case "y":
					vec.y = parseInt(value.value);
					break;
				case "z":
					vec.z = parseInt(value.value);
					break;
				default:
					throw new Error(`Invalid key ${key.value} for vector at ${key.line}:${key.column}`);
			}
		}

		const vectorLiteral: AST.VectorLiteral = {
			type: AST.Type.VectorLiteral,
			value: vec,
			line: openBrace.line,
			column: openBrace.column,
			lineEnd: closeBrace.line,
			columnEnd: closeBrace.column + 1
		};

		return vectorLiteral;
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
				if (value.left.type != AST.Type.Literal || value.right.type != AST.Type.Literal) {
					throw new Error(`Invalid range ${value.left}..${value.right} (must be constant) at ${value.line}:${value.column}`);
				}
			} else if (value.type != AST.Type.Literal) throw new Error(`Invalid value ${value} (must be constant) at ${value.line}:${value.column}`);
		});

		const unitDefine: AST.UnitDefine = {
			type: AST.Type.UnitDefine,
			name: name,

			idRanges: values as (AST.Literal | AST.BinaryOperation)[],
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

			...getLastPosNamed([...body, this.lastMaybeConsumed])
		};

		return forEachStatement;
	}

	private handleFor() {
		const forTok = this.tokens.next();
		this.consumeOrThrow("(");
		const init = this.parseAst();
		this.maybeConsume(";");
		const condition = this.parseAst();
		this.maybeConsume(";");
		const inc = this.parseAst();
		this.consumeOrThrow(")");
		const body = this.parseOptionallyBracketedBody();

		const forStatement: AST.For = {
			type: AST.Type.For,
			init: init,
			condition: condition,
			iteration: inc,
			body: body,

			line: forTok.line,
			column: forTok.column,

			...getLastPosNamed([...body, this.lastMaybeConsumed])
		};

		return forStatement;
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

			...getLastPosNamed([...body, this.lastMaybeConsumed])
		};

		return whileStatement;
	}

	private handleFunctionDeclaration() {
		const fn = this.tokens.next();
		let name = this.tokens.next();
		let noWait: Token;
		if (name.type == TokenType.Keyword && name.value == "nowait") {
			noWait = name;
			name = this.tokens.next();
		}

		const params: Token[] = [];
		this.consumeOrThrow("(");
		while (!this.maybeConsume(")")) {
			if (this.maybeConsume(",")) continue;
			params.push(this.tokens.next());
		}

		let forceId: Token = null;
		if (this.maybeConsume("=")) {
			forceId = this.tokens.next();
		}

		const body = this.parseBracketedBody();

		const functionDeclaration: AST.FunctionDeclaration = {
			type: AST.Type.FunctionDeclaration,
			name: name,
			body: body,
			parameters: params,
			noWait: noWait,
			forceId: forceId,

			line: fn.line,
			column: fn.column,

			...getLastPosNamed([...body, this.lastMaybeConsumed])
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

	private handleArrayDeclaration() {
		const arrToken = this.tokens.next();
		const name = this.tokens.next();
		this.consumeOrThrow(":");
		const length = this.tokens.next();

		const arrayDeclaration: AST.ArrayDeclaration = {
			type: AST.Type.ArrayDeclaration,
			name: name,
			length: length,

			line: arrToken.line,
			column: arrToken.column,

			...getLastPosNamed(length)
		};

		return arrayDeclaration;
	}

	private handleUnitReference() {
		const ref = this.tokens.next();
		const name = this.tokens.next();
		this.consumeOrThrow("=");
		const unitGroup = this.tokens.next();
		this.consumeOrThrow("[");
		const index = this.parseAst();
		this.consumeOrThrow("]");

		const unitReference: AST.UnitReference = {
			type: AST.Type.UnitReference,
			name: name,
			unitGroup: unitGroup,
			indexer: index,

			line: ref.line,
			column: ref.column,

			...getLastPosNamed(ref)
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

			...getLastPosNamed([...elseBody, this.lastMaybeConsumed], getLastPos(elIfs, getLastPos(body)))
		};

		return ifStatement;
	}

	private handleExternalDeclaration() {
		const declare = this.tokens.next();
		const name = this.tokens.next();
		this.consumeOrThrow(":");
		const type = this.tokens.next();
		this.consumeOrThrow("=");
		const rightHand = this.parseOptionallyParenthesizedList() as AST.Literal[];
		if (rightHand.some(r => r.type != AST.Type.Literal)) throw new Error(`Invalid right hand side for declare at ${declare.line}:${declare.column}`);

		const externalDeclaration: AST.Declare = {
			type: AST.Type.Declare,
			name: name,
			params: rightHand,
			declareType: type,

			line: declare.line,
			column: declare.column,
			lineEnd: rightHand[rightHand.length - 1].line,
			columnEnd: rightHand[rightHand.length - 1].column + rightHand[rightHand.length - 1].value.toString().length
		};

		return externalDeclaration;
	}

	private maybeConsume(value: string) {
		const next = this.tokens.peek();
		if (next.value == value) {
			this.lastMaybeConsumed = this.tokens.next();
			return true;
		}

		this.lastMaybeConsumed = null;
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

export { Parser, ParserError };

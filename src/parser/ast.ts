import { Token } from "./tokenizer.js";

export namespace AST {
	export enum Type {
		Prog = "prog",
		BinaryOperation = "binary",
		UnaryOperation = "unary",
		UnitDefine = "define",
		FunctionDeclaration = "fn",
		VariableDeclaration = "var",
		VariableReference = "varRef",
		VariableAssignment = "varAssign",
		UnitReference = "unitRef",
		IndexAccess = "index",
		PropertyAccess = "property",
		MethodCall = "method",
		FunctionCall = "call",
		IfStatement = "if",
		LiteralNumber = "number",
		Semi = "semi",
		ForEach = "forEach",
		While = "while",
		Return = "return"
	}

	export interface Node {
		type: Type;

		line: number;
		column: number;

		lineEnd?: number;
		columnEnd?: number;
	}

	export interface Program extends Node {
		type: Type.Prog;
		body: AnyAST[];
	}

	export interface BinaryOperation extends Node {
		type: Type.BinaryOperation;
		operator: Token;
		left: AnyAST;
		right: AnyAST;
	}

	export interface UnaryOperation extends Node {
		type: Type.UnaryOperation;
		operator: Token;
		operand: AnyAST;
	}

	export interface UnitDefine extends Node {
		type: Type.UnitDefine;
		name: Token;
		unitType: Token;

		idRanges: (LiteralNumber | BinaryOperation)[];
	}

	export interface FunctionDeclaration extends Node {
		type: Type.FunctionDeclaration;
		name: Token;

		parameters: Token[];
		body: AnyAST[];
	}

	export interface VariableDeclaration extends Node {
		type: Type.VariableDeclaration;
		name: Token;
		expression: AnyAST;
	}

	export interface UnitReference extends Node {
		type: Type.UnitReference;
		name: Token;
		expression: IndexAccess;
	}

	export interface VariableReference extends Node {
		type: Type.VariableReference;
		name: Token;
	}

	export interface VariableAssignment extends Node {
		type: Type.VariableAssignment;
		name: Token;
		expression: AnyAST;
	}

	export interface IndexAccess extends Node {
		type: Type.IndexAccess;

		target: Token;
		index: AnyAST;
	}

	export interface PropertyAccess extends Node {
		type: Type.PropertyAccess;

		target: Token;
		property: Token;
	}

	export interface MethodCall extends Node {
		type: Type.MethodCall;

		target: Token;
		method: Token;
		arguments: AnyAST[];
	}

	export interface FunctionCall extends Node {
		type: Type.FunctionCall;

		target: Token;
		arguments: AnyAST[];
	}

	export interface IfStatement extends Node {
		type: Type.IfStatement;

		condition: AnyAST;
		then: AnyAST[];
		elseIfs: IfStatement[];
		else: AnyAST[] | null;
	}

	export interface ForEach extends Node {
		type: Type.ForEach;

		list: Token;
		variable: Token;
		body: AnyAST[];
	}

	export interface While extends Node {
		type: Type.While;

		condition: AnyAST;
		body: AnyAST[];
	}

	export interface LiteralNumber extends Node {
		type: Type.LiteralNumber;
		// token: Token;
		value: number;
	}

	export interface Return extends Node {
		type: Type.Return;
		value: AnyAST;
	}

	export interface Semi extends Node {
		type: Type.Semi;
	}

	export type AnyAST =
		| Program
		| BinaryOperation
		| UnaryOperation
		| UnitDefine
		| FunctionDeclaration
		| VariableDeclaration
		| VariableReference
		| VariableAssignment
		| UnitReference
		| IndexAccess
		| PropertyAccess
		| MethodCall
		| FunctionCall
		| IfStatement
		| ForEach
		| While
		| Return
		| LiteralNumber
		| Semi;
}

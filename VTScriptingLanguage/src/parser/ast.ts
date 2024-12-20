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
		For = "for",
		While = "while",
		Return = "return"
	}

	type WalkHandlersMap = { [K in AnyAST["type"]]: (node: Extract<AnyAST, { type: K }>, visitor: (node: AnyAST) => void) => void };

	export const walkNodeHandlers: WalkHandlersMap = {
		[Type.Prog]: (node, visitor) => node.body.forEach(visitor),
		[Type.BinaryOperation]: (node: AST.BinaryOperation, visitor) => {
			visitor(node.left);
			visitor(node.right);
		},
		[Type.UnaryOperation]: (node, visitor) => visitor(node.operand),
		[Type.UnitDefine]: (node, visitor) => node.idRanges.forEach(v => visitor(v)),
		[Type.FunctionDeclaration]: (node, visitor) => node.body.forEach(visitor),
		[Type.VariableDeclaration]: (node, visitor) => visitor(node.expression),
		[Type.VariableReference]: () => {},
		[Type.VariableAssignment]: (node, visitor) => visitor(node.expression),
		[Type.UnitReference]: (node, visitor) => visitor(node.indexer),
		// [Type.IndexAccess]: (node, visitor) => visitor(node.index),
		[Type.PropertyAccess]: (node, visitor) => visitor(node.indexer),
		[Type.MethodCall]: (node, visitor) => {
			node.arguments.forEach(visitor);
			visitor(node.indexer);
		},
		[Type.FunctionCall]: (node, visitor) => node.arguments.forEach(visitor),
		[Type.IfStatement]: (node, visitor) => {
			visitor(node.condition);
			node.then.forEach(visitor);
			node.elseIfs.forEach(v => walkNodeHandlers[Type.IfStatement](v, visitor));
			if (node.else) node.else.forEach(visitor);
		},
		[Type.ForEach]: (node, visitor) => node.body.forEach(visitor),
		[Type.For]: (node, visitor) => {
			visitor(node.init);
			visitor(node.condition);
			node.body.forEach(visitor);
		},
		[Type.While]: (node, visitor) => {
			visitor(node.condition);
			node.body.forEach(visitor);
		},
		[Type.Return]: (node, visitor) => visitor(node.value),
		[Type.LiteralNumber]: () => {},
		[Type.Semi]: () => {}
	};

	export const walk = (node: AnyAST, visitor: (node: AnyAST, depth: number) => void, depth = 0) => {
		if (!node) return;
		visitor(node, depth);

		const handler = walkNodeHandlers[node.type] as (node: AnyAST, visitor: (node: AnyAST, depth: number) => void) => void;
		handler(node, childNode => {
			walk(childNode, visitor, depth + 1);
		});
	};

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
		unitGroup: Token;
		indexer: AnyAST;
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

	// export interface IndexAccess extends Node {
	// 	type: Type.IndexAccess;

	// 	target: Token;
	// 	index: AnyAST;
	// }

	export interface PropertyAccess extends Node {
		type: Type.PropertyAccess;

		target: Token;
		property: Token;

		indexer: AnyAST | null;
	}

	export interface MethodCall extends Node {
		type: Type.MethodCall;

		target: Token;
		method: Token;
		arguments: AnyAST[];

		indexer: AnyAST | null;
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

	export interface For extends Node {
		type: Type.For;

		init: AnyAST;
		condition: AnyAST;
		iteration: AnyAST;

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
		// | IndexAccess
		| PropertyAccess
		| MethodCall
		| FunctionCall
		| IfStatement
		| ForEach
		| For
		| While
		| Return
		| LiteralNumber
		| Semi;
}

import { AST } from "../parser/ast.js";
import { VTNode } from "../vtsParser.js";
import { BaseBlockKeys, CompKeys, GVKeys } from "../vtTypes.js";
import { Context, GV, Iterator } from "./context.js";
import { VTSGenerator } from "./vtsGenerator.js";

export interface UnitListMethod {
	actionMethod: string;
	actionId: number;
	jumpFlagCondId: number;
}

export interface DefinedUnitList {
	name: string;
	type: string;
	ids: number[];

	createdActions: UnitListMethod[];
}

export interface RefVar {
	name: string;
	indexExpression: AST.AnyAST;
	def: DefinedUnitList;
}

const vars = {
	result: "c_result",
	mathA: "c_mathA",
	mathB: "c_mathB",
	stackOverflowFlag: "c_stackOverflowFlag",
	indexOutOfBoundsFlag: "c_indexOutOfBoundsFlag",
	jumpFlag: "c_jumpFlag",
	sp: "c_sp"
};

const idStart = 10000;
const varIds: Record<keyof typeof vars, number> = {
	mathA: idStart + 0,
	mathB: idStart + 1,
	result: idStart + 2,
	stackOverflowFlag: idStart + 3,
	indexOutOfBoundsFlag: idStart + 4,
	jumpFlag: idStart + 5,
	sp: idStart + 6
};

const stackSize = 16;

const stackIdx = (i: number) => `_stack_${i}`;

// Traditionally function parameters are pushed onto the stack and popped within the function
// Because we don't support recursion each function has its own singular dedicated variable
// So we can write directly to that variable, which *can* save instructions when optimization is enabled
enum FunctionParamMode {
	Stack,
	DirectWrite
}
const functionParamMode: FunctionParamMode = FunctionParamMode.DirectWrite;

interface FunctionDeclaration {
	name: string;
	id: number;
	jumpFlagId: number;
	context: Context;
	params: GV[];
}

interface CompilerError {
	message: string;
	node: AST.AnyAST;
}

class Compiler {
	private vts: VTNode;
	private _nextId = idStart + 10;

	private defines: DefinedUnitList[] = [];
	private blockContextStack: VTNode[] = [];
	private contextStack: Context[] = [];
	private refVars: RefVar[] = [];
	private functions: FunctionDeclaration[] = [];

	private pushActionId = 0;
	private popActionId = 0;

	private pushJumpFlagConditional = 0;
	private popJumpFlagConditional = 0;

	public gen: VTSGenerator;

	public errors: CompilerError[] = [];

	private get currentVTContext() {
		return this.blockContextStack[this.blockContextStack.length - 1];
	}

	public get context() {
		return this.contextStack[this.contextStack.length - 1];
	}

	private get currentEventContext() {
		const ctx = this.currentVTContext;
		switch (ctx.name) {
			case "SEQUENCE":
				const events = ctx.getChildrenWithName("EVENT");
				const eventInfo = events[events.length - 1].getNode("EventInfo");
				return eventInfo;
			default:
				throw new Error(`Unsupported context for event: ${ctx.name}`);
		}
	}

	private vn(name: string) {
		return this.context.getGVId(name);
	}

	private add(node: VTNode) {
		this.currentEventContext.addChild(node);
	}

	private nextId() {
		return this._nextId++;
	}

	constructor(private ast: AST.Program, orgVts: VTNode) {
		this.vts = orgVts.clone();
		this.gen = new VTSGenerator(this.nextId.bind(this), this.vts);

		const context = new Context(null, this.nextId.bind(this));
		this.contextStack.push(context);
	}

	private createAndAddConditional(cond: VTNode<CompKeys>): number {
		const conditionalsParent = this.vts.getNode("Conditionals");
		const conditional = this.gen.conditionalWithCondition(cond);

		conditionalsParent.addChild(conditional);

		return conditional.getValue("id");
	}

	private getJumpFlagConditional() {
		const jumpFlagValue = this.nextId();
		const condId = this.createAndAddConditional(this.gen.gvComp(this.vn(vars.jumpFlag), jumpFlagValue, "Equals"));

		return { jumpFlagValue, condId };
	}

	private createStack() {
		for (let i = 0; i < stackSize; i++) this.makeVar(stackIdx(i));

		// = Push setup =
		{
			// const pushSeq = this.gen.sequence("push");
			const pushCondAction = this.gen.conditionalAction("push");
			this.pushActionId = pushCondAction.getValue("id");

			// Jump flag setup
			const condActionJumpFlagValue = this.nextId();
			const condActionJumpFlagConditional = this.createAndAddConditional(this.gen.gvComp(this.vn(vars.jumpFlag), condActionJumpFlagValue, "Equals"));
			this.pushJumpFlagConditional = condActionJumpFlagConditional;
			const setCondJumpFlag = this.gen.gvSet(this.vn(vars.jumpFlag), condActionJumpFlagValue);

			// Base case
			const baseCaseConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.sp), 0, "Equals"));
			const actionParent = new VTNode<"eventName">("ACTIONS");
			actionParent.setValue("eventName", null);
			actionParent.addChild(this.gen.gvCopy(this.vn(vars.result), this.vn(stackIdx(0))));
			actionParent.addChild(this.gen.gvIncDec(this.vn(vars.sp), 1, "IncrementValue"));
			actionParent.addChild(setCondJumpFlag);

			const baseBlock = pushCondAction.findChildWithName("BASE_BLOCK");
			baseBlock.addChild(baseCaseConditional);
			baseBlock.addChild(actionParent);

			for (let i = 1; i < stackSize; i++) {
				const elseIf = new VTNode<BaseBlockKeys>("ELSE_IF");
				elseIf.setValue("{blockName}", `stack[${i}]`);
				elseIf.setValue("blockId", this.nextId());
				const elseIfConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.sp), i, "Equals"));

				const elseIfActionParent = new VTNode<"eventName">("ACTIONS");
				elseIfActionParent.setValue("eventName", null);
				elseIfActionParent.addChild(this.gen.gvCopy(this.vn(vars.result), this.vn(stackIdx(i))));
				elseIfActionParent.addChild(this.gen.gvIncDec(this.vn(vars.sp), 1, "IncrementValue"));
				elseIfActionParent.addChild(setCondJumpFlag);

				elseIf.addChild(elseIfConditional);
				elseIf.addChild(elseIfActionParent);

				baseBlock.addChild(elseIf);
			}

			const elseBlock = new VTNode<"eventName">("ELSE_ACTIONS");
			elseBlock.setValue("eventName", null);
			elseBlock.addChild(this.gen.gvSet(this.vn(vars.stackOverflowFlag), 1));
			baseBlock.addChild(elseBlock);
		}

		// = Pop setup =
		{
			const popCondAction = this.gen.conditionalAction("pop");
			this.popActionId = popCondAction.getValue("id");

			const condActionJumpFlagValue = this.nextId();
			const condActionJumpFlagConditional = this.createAndAddConditional(this.gen.gvComp(this.vn(vars.jumpFlag), condActionJumpFlagValue, "Equals"));
			this.popJumpFlagConditional = condActionJumpFlagConditional;

			const setCondJumpFlag = this.gen.gvSet(this.vn(vars.jumpFlag), condActionJumpFlagValue);

			// Base case
			const baseCaseConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.sp), 1, "Equals"));
			const actionParent = new VTNode<"eventName">("ACTIONS");
			actionParent.setValue("eventName", null);
			actionParent.addChild(this.gen.gvIncDec(this.vn(vars.sp), 1, "DecrementValue"));
			actionParent.addChild(this.gen.gvCopy(this.vn(stackIdx(0)), this.vn(vars.result)));
			actionParent.addChild(setCondJumpFlag);

			const baseBlock = popCondAction.findChildWithName("BASE_BLOCK");
			baseBlock.addChild(baseCaseConditional);
			baseBlock.addChild(actionParent);

			for (let i = 1; i < stackSize; i++) {
				const elseIf = new VTNode<BaseBlockKeys>("ELSE_IF");
				elseIf.setValue("{blockName}", `stack[${i}]`);
				elseIf.setValue("blockId", this.nextId());
				const elseIfConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.sp), i + 1, "Equals"));

				const elseIfActionParent = new VTNode<"eventName">("ACTIONS");
				elseIfActionParent.setValue("eventName", null);
				elseIfActionParent.addChild(this.gen.gvIncDec(this.vn(vars.sp), 1, "DecrementValue"));
				elseIfActionParent.addChild(this.gen.gvCopy(this.vn(stackIdx(i)), this.vn(vars.result)));
				elseIfActionParent.addChild(setCondJumpFlag);

				elseIf.addChild(elseIfConditional);
				elseIf.addChild(elseIfActionParent);

				baseBlock.addChild(elseIf);
			}
		}
	}

	private splitCurrentContext(conditionalId: number) {
		const newEvent = this.gen.eventParent(conditionalId);
		this.currentVTContext.addChild(newEvent);
		this.add(this.gen.gvSet(this.vn(vars.jumpFlag), 0));
	}

	private push() {
		this.add(this.gen.fireConditional(this.pushActionId));
		this.splitCurrentContext(this.pushJumpFlagConditional);
	}

	private pop() {
		this.add(this.gen.fireConditional(this.popActionId));
		this.splitCurrentContext(this.popJumpFlagConditional);
	}

	public compile() {
		const entrypointSequence = this.gen.sequence("Entrypoint");
		entrypointSequence.setValue("startImmediately", true, true);
		this.blockContextStack.push(entrypointSequence);

		for (const key in vars) {
			this.makeVar(vars[key], varIds[key]);
		}
		this.createStack();
		// this.gen.stackOverflowExceptionObjective();
		this.gen.exceptionObjective("Stack Overflow", this.vn(vars.stackOverflowFlag));
		this.gen.exceptionObjective("Index Out of Bounds", this.vn(vars.indexOutOfBoundsFlag));

		this.ast.body.forEach(child => this.compileAst(child));

		this.add(this.gen.gvSet(this.vn(vars.jumpFlag), -1)); // jumpFlag=-1 = halt

		return this.vts;
	}

	private compileAst(ast: AST.AnyAST) {
		try {
			switch (ast.type) {
				case AST.Type.UnitDefine:
					this.handleUnitDefine(ast);
					break;
				case AST.Type.FunctionDeclaration:
					this.handleFunctionDeclaration(ast);
					break;
				case AST.Type.FunctionCall:
					this.handleFunctionCall(ast);
					break;
				case AST.Type.MethodCall:
					this.handleMethodCall(ast);
					break;
				case AST.Type.ForEach:
					this.handleForEach(ast);
					break;
				case AST.Type.For:
					this.handleFor(ast);
					break;
				case AST.Type.VariableDeclaration:
					this.handleVarDeclaration(ast);
					break;
				case AST.Type.VariableAssignment:
					this.handleVarAssignment(ast);
					break;
				case AST.Type.VariableReference:
					this.handleVarReference(ast);
					break;
				case AST.Type.BinaryOperation:
					this.handleBinaryOperation(ast);
					break;
				case AST.Type.LiteralNumber:
					this.handleLiteralNumber(ast);
					break;
				case AST.Type.IfStatement:
					this.handleIf(ast);
					break;
				case AST.Type.While:
					this.handleWhile(ast);
					break;
				case AST.Type.Return:
					this.handleReturn(ast);
					break;
				case AST.Type.UnaryOperation:
					this.handleUnaryOperation(ast);
					break;
				case AST.Type.Declare:
					this.handleExternalDeclaration(ast);
					break;
				case AST.Type.Semi:
				case AST.Type.Comment:
					break;

				default:
					throw new Error(`Unhandled AST type: ${ast.type}`);
			}
		} catch (e) {
			this.errors.push({ message: e.message, node: ast });
			console.log(e);
		}
	}

	private handleVarAssignment(ast: AST.VariableAssignment) {
		this.compileAst(ast.expression);

		this.pop();
		const gv = this.context.getGV(ast.name.value);
		this.add(this.gen.gvCopy(this.vn(vars.result), this.vn(gv.name)));
	}

	private handleVarDeclaration(ast: AST.VariableDeclaration) {
		const gv = this.makeVar(ast.name.value);
		this.compileAst(ast.expression);
		this.pop();
		this.add(this.gen.gvCopy(this.vn(vars.result), this.vn(gv.name)));
	}

	private handleVarReference(ast: AST.VariableReference) {
		this.add(this.gen.gvCopy(this.vn(ast.name.value), this.vn(vars.result)));
		this.push();
	}

	private handleExternalDeclaration(ast: AST.Declare) {
		switch (ast.declareType.value) {
			case "GV":
				// Make var would produce the GV VTS, however Declare is telling the compiler that it already exists
				this.context.addGV(ast.name.value, ast.id);
				break;
			default:
				throw new Error(`Unhandled declare type: ${ast.declareType.value}`);
		}
	}

	private handleLiteralNumber(ast: AST.LiteralNumber) {
		this.add(this.gen.gvSet(this.vn(vars.result), ast.value));
		this.push();
	}

	private handleBinaryOperation(ast: AST.BinaryOperation) {
		this.compileAst(ast.left);
		this.compileAst(ast.right);
		this.pop();
		this.add(this.gen.gvCopy(this.vn(vars.result), this.vn(vars.mathB)));
		this.pop();
		this.add(this.gen.gvCopy(this.vn(vars.result), this.vn(vars.mathA)));

		switch (ast.operator.value) {
			case "+":
				this.add(this.gen.gvMath(this.vn(vars.mathA), this.vn(vars.mathB), "AddValues"));
				break;
			case "-":
				this.add(this.gen.gvMath(this.vn(vars.mathA), this.vn(vars.mathB), "SubtractValues"));
				break;
			case "*":
				this.add(this.gen.gvMath(this.vn(vars.mathA), this.vn(vars.mathB), "MultiplyValues"));
				break;
			case "==":
			case "!=":
			case ">":
			case ">=":
			case "<":
			case "<=":
				const cond = this.gen.gvGvComp(this.vn(vars.mathA), this.vn(vars.mathB), ast.operator.value);
				const setOne = this.gen.gvSet(this.vn(vars.mathB), 1);
				const setZero = this.gen.gvSet(this.vn(vars.mathB), 0);
				this.add(this.gen.simpleConditional("mathComp", cond, setOne, setZero));
				break;

			default:
				throw new Error(`Unhandled operator: ${ast.operator.value}`);
		}

		this.add(this.gen.gvCopy(this.vn(vars.mathB), this.vn(vars.result)));
		this.push();
	}

	private handleUnaryOperation(ast: AST.UnaryOperation) {
		this.compileAst(ast.operand);
		switch (ast.operator.value) {
			case "-":
				this.add(this.gen.gvSet(this.vn(vars.mathA), -1));
				this.pop();
				this.add(this.gen.gvMath(this.vn(vars.mathA), this.vn(vars.result), "MultiplyValues"));
				this.push();
				break;
			case "!":
				this.pop();
				const setZero = this.gen.gvSet(this.vn(vars.result), 0);
				const setOne = this.gen.gvSet(this.vn(vars.result), 1);
				this.add(this.gen.simpleConditional("boolNegate", this.gen.gvNotZero(this.vn(vars.result)), setZero, setOne));
				this.push();
				break;
			default:
				throw new Error(`Unhandled unary operator ${ast.operator.value}`);
		}
	}

	private handleIf(ast: AST.IfStatement) {
		const ifDoneJumpId = this.nextId();
		const doneConditional = this.createAndAddConditional(this.gen.gvComp(this.vn(vars.jumpFlag), ifDoneJumpId, "Equals"));

		const thenBlock = this.gen.sequence("ifThen");
		this.withContext(thenBlock, () => {
			ast.then.forEach(child => this.compileAst(child));
			this.add(this.gen.gvSet(this.vn(vars.jumpFlag), ifDoneJumpId));
		});

		const thenId = thenBlock.getValue("id") as number;
		// let elseId = 0;
		// if (ast.else) {
		// 	const elseBlock = this.gen.sequence("ifElse");
		// 	this.withContext(elseBlock, () => {
		// 		ast.else.forEach(child => this.compileAst(child));
		// 		this.add(this.gen.gvSet(this.vn(vars.jumpFlag), ifDoneJumpId));
		// 	});
		// 	elseId = elseBlock.getValue("id");
		// }

		const elseBlock = this.gen.sequence("ifElse");
		this.withContext(elseBlock, () => {
			ast.else?.forEach(child => this.compileAst(child));
			this.add(this.gen.gvSet(this.vn(vars.jumpFlag), ifDoneJumpId));
		});

		const elseId = elseBlock.getValue("id") as number;

		this.compileAst(ast.condition);
		this.pop();
		const cond = this.gen.gvNotZero(this.vn(vars.result));
		const thenAction = this.gen.callSequence(thenId);
		const elseAction = this.gen.callSequence(elseId);
		// const elseAction = elseId ? this.gen.callSequence(elseId) : null;

		this.add(this.gen.simpleConditional("ifCond", cond, thenAction, elseAction));
		this.splitCurrentContext(doneConditional);
	}

	private handleReturn(ast: AST.Return) {
		this.compileAst(ast.value);
		// this.pop();
		// this.add(this.gen.createGvCopy(vars.result, "result"));
	}

	private handleWhile(ast: AST.While) {
		const whileDoneId = this.nextId();
		const whileDoneCond = this.createAndAddConditional(this.gen.gvComp(this.vn(vars.jumpFlag), whileDoneId, "Equals"));

		const whileCondSeq = this.gen.sequence("whileCond");
		const whileBodySeq = this.gen.sequence("whileBody");

		this.withContext(whileCondSeq, () => {
			this.compileAst(ast.condition);
			this.pop();
			const cond = this.gen.gvNotZero(this.vn(vars.result));
			const action = this.gen.callSequence(whileBodySeq.getValue("id"));
			const elseSetDone = this.gen.gvSet(this.vn(vars.jumpFlag), whileDoneId);
			this.add(this.gen.simpleConditional("whileCondCheck", cond, action, elseSetDone));
		});

		this.withContext(whileBodySeq, () => {
			ast.body.forEach(child => this.compileAst(child));
			this.add(this.gen.callSequence(whileCondSeq.getValue("id")));
		});

		this.add(this.gen.callSequence(whileCondSeq.getValue("id")));
		this.splitCurrentContext(whileDoneCond);
	}

	private handleForEach(ast: AST.ForEach) {
		const def = this.defines.find(d => d.name == ast.list.value);
		if (!def) throw new Error(`No defined list "${ast.list.value}"`);
		if (def.ids.length == 0) throw new Error(`Unit list "${ast.list.value}" is empty`);

		const backingGv = this.makeVar(`_iter_${ast.variable.value}_${this.nextId()}`);
		this.context.addIterator(def.name, ast.variable.value, backingGv);
		const forDoneId = this.nextId();
		const forDoneCond = this.createAndAddConditional(this.gen.gvComp(this.vn(vars.jumpFlag), forDoneId, "Equals"));

		const forBodySeq = this.gen.sequence("forEachBody");
		this.add(this.gen.gvSet(backingGv.id, 0));
		this.withContext(forBodySeq, () => {
			ast.body.forEach(child => this.compileAst(child));
			this.add(this.gen.gvIncDec(backingGv.id, 1, "IncrementValue"));

			const cond = this.gen.gvComp(backingGv.id, def.ids.length, "Equals");
			const continueAction = this.gen.callSequence(forBodySeq.getValue("id"));
			const exitAction = this.gen.gvSet(this.vn(vars.jumpFlag), forDoneId);
			this.add(this.gen.simpleConditional("forEachCheck", cond, exitAction, continueAction));
		});

		this.context.removeIterator(ast.variable.value);

		this.add(this.gen.callSequence(forBodySeq.getValue("id")));
		this.splitCurrentContext(forDoneCond);
	}

	private handleFor(ast: AST.For) {
		const forDoneId = this.nextId();
		const forDoneCond = this.createAndAddConditional(this.gen.gvComp(this.vn(vars.jumpFlag), forDoneId, "Equals"));

		const forCondSeq = this.gen.sequence("forCond");
		const forBodySeq = this.gen.sequence("forBody");
		this.compileAst(ast.init);

		this.withContext(forCondSeq, () => {
			this.compileAst(ast.condition);
			this.pop();
			const cond = this.gen.gvNotZero(this.vn(vars.result));
			const action = this.gen.callSequence(forBodySeq.getValue("id"));
			const elseSetDone = this.gen.gvSet(this.vn(vars.jumpFlag), forDoneId);
			this.add(this.gen.simpleConditional("forCondCheck", cond, action, elseSetDone));
		});

		this.withContext(forBodySeq, () => {
			ast.body.forEach(child => this.compileAst(child));
			this.compileAst(ast.iteration);
			this.add(this.gen.callSequence(forCondSeq.getValue("id")));
		});

		this.add(this.gen.callSequence(forCondSeq.getValue("id")));
		this.splitCurrentContext(forDoneCond);
	}

	private createMethodCallAction(unitList: DefinedUnitList, method: string) {
		// const methodSeq = this.gen.sequence(method);
		const methodCondAction = this.gen.conditionalAction(method);

		const jumpFlagValue = this.nextId();
		const condActionJumpFlagValue = this.nextId();
		const condId = this.createAndAddConditional(this.gen.gvComp(this.vn(vars.jumpFlag), condActionJumpFlagValue, "Equals"));
		const condActJumpFlagConditional = this.createAndAddConditional(this.gen.gvComp(this.vn(vars.jumpFlag), jumpFlagValue, "Equals"));

		const setJumpFlag = this.gen.gvSet(this.vn(vars.jumpFlag), jumpFlagValue);
		const setCondJumpFlag = this.gen.gvSet(this.vn(vars.jumpFlag), condActionJumpFlagValue);

		const baseCaseConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.result), -1, "Equals"));
		const actionParent = new VTNode<"eventName">("ACTIONS");
		actionParent.setValue("eventName", null);
		unitList.ids.forEach(id => actionParent.addChild(this.gen.unitMethod(method, id)));
		actionParent.addChild(setCondJumpFlag);

		const baseBlock = methodCondAction.findChildWithName("BASE_BLOCK");
		baseBlock.addChild(baseCaseConditional);
		baseBlock.addChild(actionParent);

		unitList.ids.forEach((id, idx) => {
			const elseIf = new VTNode<BaseBlockKeys>("ELSE_IF");
			elseIf.setValue("{blockName}", `[${id}]${method}`);
			elseIf.setValue("blockId", this.nextId());
			const elseIfConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.result), idx, "Equals"));

			const elseIfActionParent = new VTNode<"eventName">("ACTIONS");
			elseIfActionParent.setValue("eventName", null);
			elseIfActionParent.addChild(this.gen.unitMethod(method, id));
			elseIfActionParent.addChild(setCondJumpFlag);

			elseIf.addChild(elseIfConditional);
			elseIf.addChild(elseIfActionParent);

			baseBlock.addChild(elseIf);
		});

		const elseBlock = new VTNode<"eventName">("ELSE_ACTIONS");
		elseBlock.setValue("eventName", null);
		elseBlock.addChild(this.gen.gvSet(this.vn(vars.indexOutOfBoundsFlag), 1));
		baseBlock.addChild(elseBlock);

		// const methodBlockSecondEventsParent = this.gen.eventParent(condActJumpFlagConditional);
		// methodSeq.addChild(methodBlockSecondEventsParent);
		// const methodBlockSecondEvents = methodBlockSecondEventsParent.getNode("EventInfo");
		// methodBlockSecondEvents.addChild(setJumpFlag);

		const ulMethod: UnitListMethod = { actionMethod: method, actionId: methodCondAction.getValue("id"), jumpFlagCondId: condId };
		unitList.createdActions.push(ulMethod);

		return ulMethod;
	}

	private handleMethodCall(ast: AST.MethodCall) {
		let unitList = this.defines.find(d => d.name == ast.target.value);
		const isIter = this.context.hasIterator(ast.target.value);

		let iterator: Iterator = null;
		if (isIter) {
			iterator = this.context.getIterator(ast.target.value);
			unitList = this.defines.find(d => d.name == iterator.unitList);
		}

		if (!unitList) throw new Error(`Unit list "${ast.target.value}" not found`);

		let condActionId = unitList.createdActions.find(a => a.actionMethod == ast.method.value);
		if (!condActionId) condActionId = this.createMethodCallAction(unitList, ast.method.value);

		if (iterator) {
			this.add(this.gen.gvCopy(iterator.backingGv.id, this.vn(vars.result)));
		} else if (ast.indexer) {
			this.compileAst(ast.indexer);
			this.pop();
		} else {
			this.add(this.gen.gvSet(this.vn(vars.result), -1));
		}

		this.add(this.gen.fireConditional(condActionId.actionId));
		this.splitCurrentContext(condActionId.jumpFlagCondId);
	}

	private handleFunctionDeclaration(ast: AST.FunctionDeclaration) {
		const fnSeq = this.gen.sequence(ast.name.value);
		const { jumpFlagValue, condId } = this.getJumpFlagConditional();

		const fnCtx = new Context(this.context, this.nextId.bind(this));
		const declaration: FunctionDeclaration = {
			name: ast.name.value,
			id: fnSeq.getValue("id") as number,
			jumpFlagId: condId,
			context: fnCtx,
			params: []
		};

		this.functions.push(declaration);
		this.contextStack.push(fnCtx);

		ast.parameters.forEach(param => {
			const newVar = this.makeVar(param.value);
			declaration.params.push(newVar);
		});

		this.withContext(fnSeq, () => {
			if (functionParamMode == FunctionParamMode.Stack) {
				ast.parameters.reverse().forEach(param => {
					this.pop();
					this.add(this.gen.gvCopy(this.vn(vars.result), this.vn(param.value)));
				});
			}

			ast.body.forEach(child => this.compileAst(child));

			this.add(this.gen.gvSet(this.vn(vars.jumpFlag), jumpFlagValue));
		});
		this.contextStack.pop();
	}

	private handleFunctionCall(ast: AST.FunctionCall) {
		// Probably better as a proper "builtinFunction" system, but don't want to deal with having to publicize a bunch of stuff
		if (ast.target.value == "print") return this.handlePrintFunctionCall(ast);
		const fn = this.functions.find(f => f.name == ast.target.value);
		if (!fn) throw new Error(`Function "${ast.target.value}" not found`);

		ast.arguments.forEach((arg, idx) => {
			this.compileAst(arg);

			if (functionParamMode == FunctionParamMode.DirectWrite) {
				this.pop();
				const param = fn.params[idx];
				this.add(this.gen.gvCopy(this.vn(vars.result), param.id));
			}
		});

		this.add(this.gen.callSequence(fn.id));
		this.splitCurrentContext(fn.jumpFlagId);
	}

	private handlePrintFunctionCall(ast: AST.FunctionCall) {
		const message = ast.arguments[0];
		if (message.type != AST.Type.LiteralString) throw new Error("print() only supports string literals");

		this.add(this.gen.displayMessage(message.value));
	}

	private handleUnitDefine(ast: AST.UnitDefine) {
		const def: DefinedUnitList = {
			name: ast.name.value,
			type: ast.unitType.value,
			ids: [],
			createdActions: []
		};

		ast.idRanges.forEach(idRange => {
			if (idRange.type == AST.Type.BinaryOperation) {
				const lower = (idRange.left as AST.LiteralNumber).value;
				const upper = (idRange.right as AST.LiteralNumber).value;

				for (let i = lower; i <= upper; i++) def.ids.push(i);
			} else {
				def.ids.push(idRange.value);
			}
		});

		this.defines.push(def);
	}

	private makeVar(name: string, forcedId?: number): GV {
		// if(th)
		if (this.context.hasGV(name)) {
			throw new Error(`Variable "${name}" already exists`);
		}

		const gvVar = this.context.addGV(name, forcedId);

		const gv = new VTNode<GVKeys>("gv");
		// const dataStr = `${id};${name};;0;`;
		const data = [gvVar.id, name, null, 0];
		gv.setValue("data", data);
		const gvContainer = this.vts.getNode("GlobalValues");
		gvContainer.addChild(gv);

		return gvVar;
	}

	private withContext(node: VTNode, execute: () => void) {
		this.blockContextStack.push(node);
		execute();
		this.blockContextStack.pop();
	}
}

export { Compiler, CompilerError, vars, varIds };

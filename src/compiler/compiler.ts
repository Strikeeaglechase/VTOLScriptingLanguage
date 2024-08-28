import { AST } from "../parser/ast.js";
import { VTNode } from "../vtsParser.js";
import { BaseBlockKeys, GVKeys } from "../vtTypes.js";
import { Context, GV } from "./context.js";
import { VTSGenerator } from "./vtsGenerator.js";

interface DefinedUnitList {
	name: string;
	type: string;
	ids: number[];
}

interface Iterator {
	variable: string;
	define: DefinedUnitList;
}

interface RefVar {
	name: string;
	indexExpression: AST.AnyAST;
	def: DefinedUnitList;
}

const vars = {
	result: "result",
	mathA: "mathA",
	mathB: "mathB",
	sp: "sp"
};

const stackSize = 15;

const stackIdx = (i: number) => `_stack_${i}`;

class Compiler {
	private vts: VTNode;
	private _nextId = 10000;

	private defines: DefinedUnitList[] = [];
	private localIters: Iterator[] = [];
	private blockContextStack: VTNode[] = [];
	private contextStack: Context[] = [];
	private refVars: RefVar[] = [];
	private functions: { name: string; id: number }[] = [];

	private pushSeqId = 0;
	private popSeqId = 0;

	public gen: VTSGenerator;

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

	private add(node: VTNode) {
		this.currentEventContext.addChild(node);
	}

	private nextId() {
		return this._nextId++;
	}

	constructor(private ast: AST.Program, orgVts: VTNode) {
		this.vts = orgVts.clone();
		this.gen = new VTSGenerator(this, this.nextId.bind(this), this.vts);

		const context = new Context(null, this.nextId.bind(this));
		this.contextStack.push(context);
	}

	private createStack() {
		for (let i = 0; i < stackSize; i++) this.makeVar(stackIdx(i));

		// = Push setup =
		{
			const pushSeq = this.gen.sequence("push");
			this.pushSeqId = pushSeq.getValue("id");
			const pushCondAction = this.gen.conditionalAction("push");

			// Base case
			const baseCaseConditional = this.gen.conditionalWithCondition(this.gen.gvComp("sp", 0, "Equals"));
			const actionParent = new VTNode<"eventName">("ACTIONS");
			actionParent.setValue("eventName", null);
			actionParent.addChild(this.gen.gvCopy(vars.result, stackIdx(0)));
			const baseBlock = pushCondAction.findChildWithName("BASE_BLOCK");
			baseBlock.addChild(baseCaseConditional);
			baseBlock.addChild(actionParent);

			for (let i = 1; i < stackSize; i++) {
				const elseIf = new VTNode<BaseBlockKeys>("ELSE_IF");
				elseIf.setValue("{blockName}", `stack[${i}]`);
				elseIf.setValue("blockId", this.nextId());
				const elseIfConditional = this.gen.conditionalWithCondition(this.gen.gvComp("sp", i, "Equals"));

				const elseIfActionParent = new VTNode<"eventName">("ACTIONS");
				elseIfActionParent.setValue("eventName", null);
				elseIfActionParent.addChild(this.gen.gvCopy(vars.result, stackIdx(i)));
				elseIf.addChild(elseIfConditional);
				elseIf.addChild(elseIfActionParent);

				baseBlock.addChild(elseIf);
			}

			// Set, then increment
			const pushBlockEvents = pushSeq.findChildWithName("EventInfo");
			pushBlockEvents.addChild(this.gen.fireConditional(pushCondAction.getValue("id")));
			pushBlockEvents.addChild(this.gen.gvIncDec("sp", 1, "IncrementValue"));
		}

		// = Pop setup =
		{
			const popSeq = this.gen.sequence("pop");
			this.popSeqId = popSeq.getValue("id");
			const popCondAction = this.gen.conditionalAction("pop");

			// Base case
			const baseCaseConditional = this.gen.conditionalWithCondition(this.gen.gvComp("sp", 0, "Equals"));
			const actionParent = new VTNode<"eventName">("ACTIONS");
			actionParent.setValue("eventName", null);
			actionParent.addChild(this.gen.gvCopy(stackIdx(0), vars.result));
			const baseBlock = popCondAction.findChildWithName("BASE_BLOCK");
			baseBlock.addChild(baseCaseConditional);
			baseBlock.addChild(actionParent);

			for (let i = 1; i < stackSize; i++) {
				const elseIf = new VTNode<BaseBlockKeys>("ELSE_IF");
				elseIf.setValue("{blockName}", `stack[${i}]`);
				elseIf.setValue("blockId", this.nextId());
				const elseIfConditional = this.gen.conditionalWithCondition(this.gen.gvComp("sp", i, "Equals"));

				const elseIfActionParent = new VTNode<"eventName">("ACTIONS");
				elseIfActionParent.setValue("eventName", null);
				elseIfActionParent.addChild(this.gen.gvCopy(stackIdx(i), vars.result));
				elseIf.addChild(elseIfConditional);
				elseIf.addChild(elseIfActionParent);

				baseBlock.addChild(elseIf);
			}

			// Decrement, then retrieve
			const popBlockEvents = popSeq.findChildWithName("EventInfo");
			popBlockEvents.addChild(this.gen.gvIncDec("sp", 1, "DecrementValue"));
			popBlockEvents.addChild(this.gen.fireConditional(popCondAction.getValue("id")));
		}
	}

	private push() {
		this.add(this.gen.callSequence(this.pushSeqId));
	}

	private pop() {
		this.add(this.gen.callSequence(this.popSeqId));
	}

	public compile() {
		const entrypointSequence = this.gen.sequence("Entrypoint");
		entrypointSequence.setValue("startImmediately", true, true);
		this.blockContextStack.push(entrypointSequence);

		for (const key in vars) {
			this.makeVar(vars[key]);
		}
		this.createStack();

		this.ast.body.forEach(child => this.compileAst(child));

		return this.vts;
	}

	private compileAst(ast: AST.AnyAST) {
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
			case AST.Type.ForEach:
				this.handleForEach(ast);
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
			case AST.Type.Semi:
				break;

			default:
				throw new Error(`Unhandled AST type: ${ast.type}`);
		}
	}

	private handleVarAssignment(ast: AST.VariableAssignment) {
		this.compileAst(ast.expression);

		this.pop();
		const gv = this.context.getGV(ast.name.value);
		this.add(this.gen.gvCopy(vars.result, gv.name));
	}

	private handleVarDeclaration(ast: AST.VariableDeclaration) {
		const gv = this.makeVar(ast.name.value);
		this.compileAst(ast.expression);
		this.pop();
		this.add(this.gen.gvCopy(vars.result, gv.name));
	}

	private handleVarReference(ast: AST.VariableReference) {
		this.add(this.gen.gvCopy(ast.name.value, vars.result));
		this.push();
	}

	private handleLiteralNumber(ast: AST.LiteralNumber) {
		this.add(this.gen.gvSet(vars.result, ast.value));
		this.push();
	}

	private handleBinaryOperation(ast: AST.BinaryOperation) {
		this.compileAst(ast.left);
		this.compileAst(ast.right);
		this.pop();
		this.add(this.gen.gvCopy(vars.result, vars.mathB));
		this.pop();
		this.add(this.gen.gvCopy(vars.result, vars.mathA));

		switch (ast.operator.value) {
			case "+":
				this.add(this.gen.gvMath(vars.mathA, vars.mathB, "AddValues"));
				break;
			case "-":
				this.add(this.gen.gvMath(vars.mathA, vars.mathB, "SubtractValues"));
				break;
			case "*":
				this.add(this.gen.gvMath(vars.mathA, vars.mathB, "MultiplyValues"));
				break;
			case "==":
			case "!=":
			case ">":
			case ">=":
			case "<":
			case "<=":
				const cond = this.gen.gvGvComp(vars.mathA, vars.mathB, ast.operator.value);
				const setOne = this.gen.gvSet(vars.mathB, 1);
				const setZero = this.gen.gvSet(vars.mathB, 0);
				this.add(this.gen.simpleConditional("mathComp", cond, setOne, setZero));
				break;

			default:
				throw new Error(`Unhandled operator: ${ast.operator.value}`);
		}

		this.add(this.gen.gvCopy(vars.mathB, vars.result));
		this.push();
	}

	private handleUnaryOperation(ast: AST.UnaryOperation) {
		this.compileAst(ast.operand);
		switch (ast.operator.value) {
			case "-":
				this.add(this.gen.gvSet(vars.mathA, -1));
				this.pop();
				this.add(this.gen.gvMath(vars.mathA, vars.result, "MultiplyValues"));
				this.push();
				break;
			case "!":
				this.pop();
				const setZero = this.gen.gvSet(vars.result, 0);
				const setOne = this.gen.gvSet(vars.result, 1);
				this.add(this.gen.simpleConditional("boolNegate", this.gen.gvNotZero(vars.result), setZero, setOne));
				break;
			default:
				throw new Error(`Unhandled unary operator ${ast.operator.value}`);
		}
	}

	private handleIf(ast: AST.IfStatement) {
		const thenBlock = this.gen.sequence("ifThen");
		this.withContext(thenBlock, () => ast.then.forEach(child => this.compileAst(child)));
		const thenId = thenBlock.getValue("id") as number;
		let elseId = 0;

		if (ast.else) {
			const elseBlock = this.gen.sequence("ifElse");
			this.withContext(elseBlock, () => ast.else.forEach(child => this.compileAst(child)));
			elseId = elseBlock.getValue("id");
		}

		this.compileAst(ast.condition);
		this.pop();
		const cond = this.gen.gvNotZero(vars.result);
		const thenAction = this.gen.callSequence(thenId);
		const elseAction = elseId ? this.gen.callSequence(elseId) : null;

		this.add(this.gen.simpleConditional("ifCond", cond, thenAction, elseAction));
	}

	private handleReturn(ast: AST.Return) {
		this.compileAst(ast.value);
		// this.pop();
		// this.add(this.gen.createGvCopy(vars.result, "result"));
	}

	private handleWhile(ast: AST.While) {
		const whileCondSeq = this.gen.sequence("whileCond");
		const whileBodySeq = this.gen.sequence("whileBody");

		this.withContext(whileCondSeq, () => {
			this.compileAst(ast.condition);
			this.pop();
			const cond = this.gen.gvNotZero(vars.result);
			const action = this.gen.callSequence(whileBodySeq.getValue("id"));
			this.add(this.gen.simpleConditional("whileCondCheck", cond, action));
		});
		this.withContext(whileBodySeq, () => {
			ast.body.forEach(child => this.compileAst(child));
			this.add(this.gen.callSequence(whileCondSeq.getValue("id")));
		});

		this.add(this.gen.callSequence(whileCondSeq.getValue("id")));
	}

	private handleForEach(ast: AST.ForEach) {
		const def = this.defines.find(d => d.name == ast.list.value);
		if (!def) throw new Error(`No defined list "${ast.list.value}"`);

		const newIter: Iterator = { variable: ast.variable.value, define: def };
		this.localIters.push(newIter);

		ast.body.forEach(child => this.compileAst(child));

		this.localIters = this.localIters.filter(it => it != newIter);
	}

	private handleFunctionDeclaration(ast: AST.FunctionDeclaration) {
		const fnSeq = this.gen.sequence(ast.name.value);
		this.functions.push({ name: ast.name.value, id: fnSeq.getValue("id") as number });

		const fnCtx = new Context(this.context, this.nextId.bind(this));
		this.contextStack.push(fnCtx);
		ast.parameters.forEach(param => this.makeVar(param.value));
		this.withContext(fnSeq, () => {
			ast.parameters.reverse().forEach(param => {
				this.pop();
				this.add(this.gen.gvCopy(vars.result, param.value));
			});

			ast.body.forEach(child => this.compileAst(child));
		});
		this.contextStack.pop();
	}

	private handleFunctionCall(ast: AST.FunctionCall) {
		const fn = this.functions.find(f => f.name == ast.target.value);
		if (!fn) throw new Error(`Function "${ast.target.value}" not found`);

		ast.arguments.forEach(arg => this.compileAst(arg));
		this.add(this.gen.callSequence(fn.id));
	}

	private handleUnitDefine(ast: AST.UnitDefine) {
		const def: DefinedUnitList = {
			name: ast.name.value,
			type: ast.unitType.value,
			ids: []
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

	private makeVar(name: string): GV {
		// if(th)
		if (this.context.hasGV(name)) {
			throw new Error(`Variable "${name}" already exists`);
		}

		const gvVar = this.context.addGV(name);

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

export { Compiler };

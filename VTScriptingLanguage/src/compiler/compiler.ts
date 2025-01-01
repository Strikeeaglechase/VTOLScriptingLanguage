import { AST } from "../parser/ast.js";
import { stringifyVTValue, VTNode, VTValue } from "../vtsParser.js";
import { BaseBlockKeys, CompKeys, ConditionalActionKeys, GVKeys, SequenceKeys } from "../vtTypes.js";
import { Context, GV, Iterator } from "./context.js";
import { loadGameTypes, Method } from "./gameTypes.js";
import { convertAstToMethodParameters, convertAstToParamInfo } from "./vtArgConverter.js";
import { VTSGenerator } from "./vtsGenerator.js";

export interface UnitListMethod {
	actionMethod: string;
	argKey: string;
	actionId: number;
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
	// jumpFlag: "c_jumpFlag",
	exitFlag: "c_exitFlag",
	sp: "c_sp"
};

const idStart = 10000;
const varIds: Record<keyof typeof vars, number> = {
	mathA: idStart + 0,
	mathB: idStart + 1,
	result: idStart + 2, // Changing result id will break backwards compatibility
	stackOverflowFlag: idStart + 3,
	indexOutOfBoundsFlag: idStart + 4,
	exitFlag: idStart + 5,
	sp: idStart + 6
};

const stackIdx = (i: number) => `_stack_${i}`;

interface FunctionDeclaration {
	name: string;
	id: number;
	gvValue: number;
	context: Context;
	params: GV[];
	type: "sequence" | "conditionalAction";
}

interface CompilerError {
	message: string;
	node: AST.AnyAST;
}

interface CompilerOptions {
	stackSize: number;
	generateExceptionObjectives: boolean;
}

const gameTypes = loadGameTypes();
class Compiler {
	private vts: VTNode;
	private _nextId = idStart + 10;

	private defines: DefinedUnitList[] = [];
	private blockContextStack: VTNode[] = [];
	private contextStack: Context[] = [];
	private refVars: RefVar[] = [];
	private functions: FunctionDeclaration[] = [];
	private functionGvVal = 0;
	private functionExecCaId: number;
	private functionExecCa: VTNode<ConditionalActionKeys>;

	private pushActionId = 0;
	private popActionId = 0;

	public gen: VTSGenerator;

	public errors: CompilerError[] = [];
	private opts: CompilerOptions = {
		stackSize: 16,
		generateExceptionObjectives: true
	};

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
			case "ConditionalAction":
				return ctx.getNode("BASE_BLOCK").getNode("ACTIONS");
			case "ACTIONS":
			case "ELSE_ACTIONS":
				return ctx;
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

	constructor(private ast: AST.Program, orgVts: VTNode, uOpts: Partial<CompilerOptions>) {
		this.opts = { ...this.opts, ...uOpts };
		this.vts = orgVts.clone();
		this.gen = new VTSGenerator(this.nextId.bind(this), this.vts);

		const context = new Context(null, this.nextId.bind(this), "");
		this.contextStack.push(context);
	}

	private createStack() {
		for (let i = 0; i < this.opts.stackSize; i++) this.makeVar(stackIdx(i));

		// = Push setup =
		{
			// const pushSeq = this.gen.sequence("push");
			const pushCondAction = this.gen.conditionalAction("push");
			this.pushActionId = pushCondAction.getValue("id");

			// Base case
			const baseCaseConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.sp), 0, "Equals"));
			const actionParent = new VTNode<"eventName">("ACTIONS");
			actionParent.setValue("eventName", null);
			actionParent.addChild(this.gen.gvCopy(this.vn(vars.result), this.vn(stackIdx(0))));
			actionParent.addChild(this.gen.gvIncDec(this.vn(vars.sp), 1, "IncrementValue"));

			const baseBlock = pushCondAction.findChildWithName("BASE_BLOCK");
			baseBlock.addChild(baseCaseConditional);
			baseBlock.addChild(actionParent);

			for (let i = 1; i < this.opts.stackSize; i++) {
				const elseIf = new VTNode<BaseBlockKeys>("ELSE_IF");
				elseIf.setValue("{blockName}", `stack[${i}]`);
				elseIf.setValue("blockId", this.nextId());
				const elseIfConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.sp), i, "Equals"));

				const elseIfActionParent = new VTNode<"eventName">("ACTIONS");
				elseIfActionParent.setValue("eventName", null);
				elseIfActionParent.addChild(this.gen.gvCopy(this.vn(vars.result), this.vn(stackIdx(i))));
				elseIfActionParent.addChild(this.gen.gvIncDec(this.vn(vars.sp), 1, "IncrementValue"));

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

			// Base case
			const baseCaseConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.sp), 1, "Equals"));
			const actionParent = new VTNode<"eventName">("ACTIONS");
			actionParent.setValue("eventName", null);
			actionParent.addChild(this.gen.gvIncDec(this.vn(vars.sp), 1, "DecrementValue"));
			actionParent.addChild(this.gen.gvCopy(this.vn(stackIdx(0)), this.vn(vars.result)));

			const baseBlock = popCondAction.findChildWithName("BASE_BLOCK");
			baseBlock.addChild(baseCaseConditional);
			baseBlock.addChild(actionParent);

			for (let i = 1; i < this.opts.stackSize; i++) {
				const elseIf = new VTNode<BaseBlockKeys>("ELSE_IF");
				elseIf.setValue("{blockName}", `stack[${i}]`);
				elseIf.setValue("blockId", this.nextId());
				const elseIfConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.sp), i + 1, "Equals"));

				const elseIfActionParent = new VTNode<"eventName">("ACTIONS");
				elseIfActionParent.setValue("eventName", null);
				elseIfActionParent.addChild(this.gen.gvIncDec(this.vn(vars.sp), 1, "DecrementValue"));
				elseIfActionParent.addChild(this.gen.gvCopy(this.vn(stackIdx(i)), this.vn(vars.result)));

				elseIf.addChild(elseIfConditional);
				elseIf.addChild(elseIfActionParent);

				baseBlock.addChild(elseIf);
			}
		}
	}

	private prepFunctionGvExec() {
		this.functionExecCa = this.gen.conditionalAction("functionExec", false);
		this.functionExecCaId = this.functionExecCa.getValue("id");
	}

	private finalizeFunctionGvExec() {
		if (this.functions.length == 0) return;

		const baseCaseFn = this.functions[0];
		const baseCaseConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.result), baseCaseFn.gvValue, "Equals"));
		const actionParent = new VTNode<"eventName">("ACTIONS");
		actionParent.setValue("eventName", null);

		if (baseCaseFn.params.length > 0) {
			this.withContext(actionParent, () => {
				baseCaseFn.params.reverse().forEach(param => {
					this.pop();
					this.add(this.gen.gvCopy(this.vn(vars.result), param.id));
				});
			});
		}
		actionParent.addChild(baseCaseFn.type == "conditionalAction" ? this.gen.fireConditionalAction(baseCaseFn.id) : this.gen.callSequence(baseCaseFn.id));

		const baseBlock = this.functionExecCa.findChildWithName("BASE_BLOCK");
		baseBlock.addChild(baseCaseConditional);
		baseBlock.addChild(actionParent);

		this.functions.forEach((fn, idx) => {
			if (idx == 0) return;
			const elseIf = new VTNode<BaseBlockKeys>("ELSE_IF");
			elseIf.setValue("{blockName}", fn.name);
			elseIf.setValue("blockId", this.nextId());
			const elseIfConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.result), fn.gvValue, "Equals"));

			const elseIfActionParent = new VTNode<"eventName">("ACTIONS");
			elseIfActionParent.setValue("eventName", null);
			if (fn.params.length > 0) {
				this.withContext(elseIfActionParent, () => {
					fn.params.reverse().forEach(param => {
						this.pop();
						this.add(this.gen.gvCopy(this.vn(vars.result), param.id));
					});
				});
			}

			elseIfActionParent.addChild(fn.type == "conditionalAction" ? this.gen.fireConditionalAction(fn.id) : this.gen.callSequence(fn.id));

			elseIf.addChild(elseIfConditional);
			elseIf.addChild(elseIfActionParent);

			baseBlock.addChild(elseIf);
		});

		const elseBlock = new VTNode<"eventName">("ELSE_ACTIONS");
		elseBlock.setValue("eventName", null);
		elseBlock.addChild(this.gen.gvSet(this.vn(vars.indexOutOfBoundsFlag), 1));
		baseBlock.addChild(elseBlock);

		const caParent = this.vts.getNode("ConditionalActions");
		caParent.addChild(this.functionExecCa);
	}

	private push() {
		this.add(this.gen.fireConditionalAction(this.pushActionId));
	}

	private pop() {
		this.add(this.gen.fireConditionalAction(this.popActionId));
	}

	public compile() {
		const entrypointSequence = this.gen.sequence("Entrypoint");
		entrypointSequence.setValue("startImmediately", true, true);
		this.blockContextStack.push(entrypointSequence);

		for (const key in vars) {
			this.makeVar(vars[key], varIds[key]);
		}
		this.createStack();
		this.prepFunctionGvExec();
		if (this.opts.generateExceptionObjectives) {
			this.gen.exceptionObjective("Stack Overflow", this.vn(vars.stackOverflowFlag));
			this.gen.exceptionObjective("Index Out of Bounds", this.vn(vars.indexOutOfBoundsFlag));
		}

		this.ast.body.forEach(child => this.compileAst(child));

		const loopFn = this.functions.find(f => f.name == "loop");
		if (loopFn) {
			const loopSeq = this.gen.sequence("loop");
			this.withContext(loopSeq, () => {
				this.add(this.gen.fireConditionalAction(loopFn.id));
				this.add(this.gen.callSequence(loopSeq.getValue("id")));
			});

			this.add(this.gen.callSequence(loopSeq.getValue("id")));
		} else {
			this.add(this.gen.gvSet(this.vn(vars.exitFlag), -1)); // jumpFlag=-1 = halt
		}

		this.finalizeFunctionGvExec();

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
				case AST.Type.Literal:
					this.handleLiteral(ast);
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
			console.log(`Error compiling AST node: ${ast.type} at ${ast.line}:${ast.column}`);
			console.log(`\t${e.message}`);
			// console.log(e);
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
		if (this.context.hasGV(ast.name.value)) {
			this.add(this.gen.gvCopy(this.vn(ast.name.value), this.vn(vars.result)));
			this.push();
		} else {
			const fn = this.functions.find(f => f.name == ast.name.value);
			if (fn) {
				this.add(this.gen.gvSet(this.vn(vars.result), fn.gvValue));
				this.push();
			} else {
				throw new Error(`Variable "${ast.name.value}" not found`);
			}
		}
	}

	private handleExternalDeclaration(ast: AST.Declare) {
		switch (ast.declareType.value) {
			case "GV":
				// Make var would produce the GV VTS, however Declare is telling the compiler that it already exists
				let gvId = ast.params[0].value;
				if (typeof gvId == "string") {
					const gvs = this.vts.getNode("GlobalValues").getChildrenWithName("gv");
					const refedGv = gvs.find(gv => gv.getValue("data")[1] == gvId);
					if (!refedGv) throw new Error(`Global value "${gvId}" not found`);
					gvId = refedGv.getValue("data")[0];
				}

				if (typeof gvId != "number") throw new Error("GV declaration requires a number or valid name as the external id");
				this.context.addGV(ast.name.value, gvId);
				break;
			case "Sequence":
				let seqId = ast.params[0].value;
				if (typeof seqId == "string") {
					const seqs = this.vts.getNode("EventSequences").getChildrenWithName("SEQUENCE") as VTNode<SequenceKeys>[];
					const refedSeq = seqs.find(seq => seq.getValue("sequenceName") == seqId);
					if (!refedSeq) throw new Error(`Sequence "${seqId}" not found`);
					seqId = refedSeq.getValue("id");
				}
				if (typeof ast.params[0].value != "number") throw new Error("Sequence declaration requires a number as the external id");

				while (this.functions.some(fn => fn.gvValue == this.functionGvVal)) this.functionGvVal++;
				const decl: FunctionDeclaration = {
					id: ast.params[0].value as number,
					context: new Context(this.context, this.nextId.bind(this), ""),
					name: ast.name.value,
					params: [],
					gvValue: this.functionGvVal++,
					type: "sequence"
				};

				this.functions.push(decl);

				break;
			default:
				throw new Error(`Unhandled declare type: ${ast.declareType.value}`);
		}
	}

	private handleLiteral(ast: AST.Literal) {
		if (typeof ast.value != "number") {
			throw new Error(`The only datatype supported is numbers, ${typeof ast.value} can only be used in special cases`);
		}

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
				// VTOL does subtraction as dest - source, so we have to swap the operands
				this.add(this.gen.gvMath(this.vn(vars.mathB), this.vn(vars.mathA), "SubtractValues"));
				this.add(this.gen.gvCopy(this.vn(vars.mathA), this.vn(vars.mathB)));
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
		const conditionalAction = this.gen.conditionalAction("ifCond");
		const baseBlock = conditionalAction.getNode("BASE_BLOCK");

		const thenBlock = new VTNode<"eventName">("ACTIONS");
		thenBlock.setValue("eventName", null);

		const elseBlock = new VTNode<"eventName">("ELSE_ACTIONS");
		elseBlock.setValue("eventName", null);

		this.withContext(thenBlock, () => {
			ast.then.forEach(child => this.compileAst(child));
		});

		this.withContext(elseBlock, () => {
			ast.else?.forEach(child => this.compileAst(child));
		});

		this.compileAst(ast.condition);
		this.pop();
		const cond = this.gen.gvNotZero(this.vn(vars.result));
		baseBlock.addChild(cond);
		baseBlock.addChild(thenBlock);
		baseBlock.addChild(elseBlock);

		this.add(this.gen.fireConditionalAction(conditionalAction.getValue("id")));
	}

	private handleReturn(ast: AST.Return) {
		this.compileAst(ast.value);
	}

	private handleWhile(ast: AST.While) {
		const whileCondSeq = this.gen.caSequence("whileCond");
		const whileBodySeq = this.gen.caSequence("whileBody");

		this.withContext(whileCondSeq, () => {
			this.compileAst(ast.condition);
			this.pop();
			const cond = this.gen.gvNotZero(this.vn(vars.result));
			const action = this.gen.fireConditionalAction(whileBodySeq.getValue("id"));
			this.add(this.gen.simpleConditional("whileCondCheck", cond, action));
		});

		this.withContext(whileBodySeq, () => {
			ast.body.forEach(child => this.compileAst(child));
			this.add(this.gen.fireConditionalAction(whileCondSeq.getValue("id")));
		});

		this.add(this.gen.fireConditionalAction(whileCondSeq.getValue("id")));
	}

	private handleForEach(ast: AST.ForEach) {
		const def = this.defines.find(d => d.name == ast.list.value);
		if (!def) throw new Error(`No defined list "${ast.list.value}"`);
		if (def.ids.length == 0) throw new Error(`Unit list "${ast.list.value}" is empty`);

		const backingGv = this.makeVar(`_iter_${ast.variable.value}_${this.nextId()}`);
		this.context.addIterator(def.name, ast.variable.value, backingGv);

		const forBodySeq = this.gen.caSequence("forEachBody");
		this.add(this.gen.gvSet(backingGv.id, 0));
		this.withContext(forBodySeq, () => {
			ast.body.forEach(child => this.compileAst(child));
			this.add(this.gen.gvIncDec(backingGv.id, 1, "IncrementValue"));

			const cond = this.gen.gvComp(backingGv.id, def.ids.length, "Equals");
			const continueAction = this.gen.fireConditionalAction(forBodySeq.getValue("id"));
			this.add(this.gen.simpleConditional("forEachCheck", cond, null, continueAction));
		});

		this.context.removeIterator(ast.variable.value);

		this.add(this.gen.fireConditionalAction(forBodySeq.getValue("id")));
	}

	private handleFor(ast: AST.For) {
		const forCondSeq = this.gen.caSequence("forCond");
		const forBodySeq = this.gen.caSequence("forBody");
		this.compileAst(ast.init);

		this.withContext(forCondSeq, () => {
			this.compileAst(ast.condition);
			this.pop();
			const cond = this.gen.gvNotZero(this.vn(vars.result));
			const action = this.gen.fireConditionalAction(forBodySeq.getValue("id"));
			this.add(this.gen.simpleConditional("forCondCheck", cond, action));
		});

		this.withContext(forBodySeq, () => {
			ast.body.forEach(child => this.compileAst(child));
			this.compileAst(ast.iteration);
			this.add(this.gen.fireConditionalAction(forCondSeq.getValue("id")));
		});

		this.add(this.gen.fireConditionalAction(forCondSeq.getValue("id")));
	}

	private createMethodCallAction(unitList: DefinedUnitList, method: string, params: { type: string; name: string; value: VTValue }[]) {
		const methodCondAction = this.gen.conditionalAction(method);

		const baseCaseConditional = this.gen.conditionalWithCondition(this.gen.gvComp(this.vn(vars.result), -1, "Equals"));
		const actionParent = new VTNode<"eventName">("ACTIONS");
		actionParent.setValue("eventName", null);
		unitList.ids.forEach(id => {
			const unitMethod = this.gen.unitMethod(method, id, params);
			actionParent.addChild(unitMethod);
		});

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
			const unitMethod = this.gen.unitMethod(method, id, params);
			elseIfActionParent.addChild(unitMethod);

			elseIf.addChild(elseIfConditional);
			elseIf.addChild(elseIfActionParent);

			baseBlock.addChild(elseIf);
		});

		const elseBlock = new VTNode<"eventName">("ELSE_ACTIONS");
		elseBlock.setValue("eventName", null);
		elseBlock.addChild(this.gen.gvSet(this.vn(vars.indexOutOfBoundsFlag), 1));
		baseBlock.addChild(elseBlock);

		const ulMethod: UnitListMethod = {
			actionMethod: method,
			actionId: methodCondAction.getValue("id"),
			argKey: params.map(p => stringifyVTValue(p.value)).join(",")
		};
		unitList.createdActions.push(ulMethod);

		return ulMethod;
	}

	private createMethodCondCallAction(unitList: DefinedUnitList, method: string, params: VTValue[]) {
		const resultOrBlockIds: number[] = [];
		const conds: VTNode<CompKeys>[] = [];

		const isMinusOne = this.gen.gvComp(this.vn(vars.result), -1, "Equals");
		const isMinusTwo = this.gen.gvComp(this.vn(vars.result), -2, "Equals");

		const unitComps: number[] = unitList.ids.map(id => {
			const comp = this.gen.unitComp(method, id, false, params);
			conds.push(comp);
			return comp.getValue("id");
		});

		const allMatchAnd = this.gen.compAnd([isMinusOne.getValue("id"), ...unitComps]); // When result is -1, check condition on every unit
		const anyMatchOr = this.gen.compOr(unitComps);
		const anyMatchOrAndTwo = this.gen.compAnd([anyMatchOr.getValue("id"), isMinusTwo.getValue("id")]); // When result is -2, check if any unit matches

		conds.push(isMinusOne, isMinusTwo, anyMatchOr, anyMatchOrAndTwo, allMatchAnd);
		resultOrBlockIds.push(allMatchAnd.getValue("id"));
		resultOrBlockIds.push(anyMatchOrAndTwo.getValue("id"));

		unitList.ids.forEach((id, idx) => {
			const idMatch = this.gen.gvComp(this.vn(vars.result), idx, "Equals");
			const methodId = unitComps[idx];
			const and = this.gen.compAnd([idMatch.getValue("id"), methodId]);
			conds.push(and, idMatch);
			resultOrBlockIds.push(and.getValue("id"));
		});

		const resultOr = this.gen.compOr(resultOrBlockIds);
		conds.push(resultOr);
		// conds.unshift(resultOr);
		const conditional = this.gen.conditionalWithManyConditions(resultOr.getValue("id"), conds);
		// conds.forEach(cond => conditional.addChild(cond));
		// const conditionalsParent = this.vts.getNode("Conditionals");
		// conditionalsParent.addChild(conditional);

		const conditionalAction = this.gen.conditionalAction("methodCondCall");
		const bb = conditionalAction.getNode("BASE_BLOCK");
		bb.addChild(conditional);

		const actionParent = new VTNode<"eventName">("ACTIONS");
		actionParent.setValue("eventName", null);
		actionParent.addChild(this.gen.gvSet(this.vn(vars.result), 1));
		bb.addChild(actionParent);

		const elseBlock = new VTNode<"eventName">("ELSE_ACTIONS");
		elseBlock.setValue("eventName", null);
		elseBlock.addChild(this.gen.gvSet(this.vn(vars.result), 0));
		bb.addChild(elseBlock);

		const ulMethod: UnitListMethod = {
			actionMethod: method,
			actionId: conditionalAction.getValue("id"),
			argKey: params.map(stringifyVTValue).join(",")
		};
		unitList.createdActions.push(ulMethod);

		return ulMethod;
	}

	private getOrCreateMethodCall(method: Method, ast: AST.MethodCall, unitList: DefinedUnitList) {
		if (method.args.length != ast.arguments.length)
			throw new Error(`Method "${ast.method.value}" expected ${method.args.length} arguments, got ${ast.arguments.length}`);

		if (method.returnType == "void") {
			const params = ast.arguments.map((arg, idx) => convertAstToParamInfo(arg, method.args[idx]));
			const paramKey = params.map(p => stringifyVTValue(p.value)).join(",");
			const ulMethod = unitList.createdActions.find(a => a.actionMethod == ast.method.value && a.argKey == paramKey);
			if (ulMethod) return ulMethod;
			return this.createMethodCallAction(unitList, ast.method.value, params);
		} else {
			const params = ast.arguments.map(arg => convertAstToMethodParameters(arg));
			const paramKey = params.map(stringifyVTValue).join(",");
			const ulMethod = unitList.createdActions.find(a => a.actionMethod == ast.method.value && a.argKey == paramKey);
			if (ulMethod) return ulMethod;

			return this.createMethodCondCallAction(unitList, ast.method.value, params);
		}
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

		const classInfo = gameTypes.classes.find(c => c.name == unitList.type);
		if (!classInfo) throw new Error(`Class "${unitList.type}" not found`);
		const methodInfo = classInfo.methods.find(m => m.name == ast.method.value);
		if (!methodInfo) throw new Error(`Method "${ast.method.value}" not found on type "${unitList.type}"`);

		// if (unitList.ids.length > 1) {
		// 	this.add(this.gen.unitMethod(ast.method.value, unitList.ids[0]));
		// }
		const ulMethod = this.getOrCreateMethodCall(methodInfo, ast, unitList);

		if (ast.modifier) {
			if (iterator || ast.indexer) throw new Error("Cannot use modifier with iterator or indexer");
			if (ast.modifier.value != "all" && ast.modifier.value != "any")
				throw new Error(`Unsupported modifier: "${ast.modifier.value}", expected "all" or "any"`);
		}

		if (iterator) {
			this.add(this.gen.gvCopy(iterator.backingGv.id, this.vn(vars.result)));
		} else if (ast.indexer) {
			this.compileAst(ast.indexer);
			this.pop();
		} else {
			if (!ast.modifier || ast.modifier.value == "all") {
				this.add(this.gen.gvSet(this.vn(vars.result), -1));
			} else {
				this.add(this.gen.gvSet(this.vn(vars.result), -2));
			}
		}

		this.add(this.gen.fireConditionalAction(ulMethod.actionId));
		if (methodInfo.returnType != "void") this.push();
	}

	private handleFunctionDeclaration(ast: AST.FunctionDeclaration) {
		const seqId: number = ast.forceId && !isNaN(+ast.forceId.value) ? +ast.forceId.value : null;
		const fnCaSeq = this.gen.caSequence(ast.name.value);
		if (seqId) {
			const seq = this.gen.sequence(ast.name.value, seqId);
			this.withContext(seq, () => {
				this.add(this.gen.fireConditionalAction(fnCaSeq.getValue("id")));
			});
		}

		const fnCtx = new Context(this.context, this.nextId.bind(this), ast.name.value);
		let gvValue = 0;
		if (ast.forceId && !isNaN(+ast.forceId.value)) {
			gvValue = +ast.forceId.value;
		} else {
			while (this.functions.some(fn => fn.gvValue == this.functionGvVal)) this.functionGvVal++;
			gvValue = this.functionGvVal++;
		}

		const declaration: FunctionDeclaration = {
			name: ast.name.value,
			id: fnCaSeq.getValue("id") as number,
			context: fnCtx,
			params: [],
			gvValue: gvValue,
			type: "conditionalAction"
		};

		this.functions.push(declaration);
		this.contextStack.push(fnCtx);

		ast.parameters.forEach(param => {
			const newVar = this.makeVar(param.value);
			declaration.params.push(newVar);
		});

		this.withContext(fnCaSeq, () => {
			ast.body.forEach(child => this.compileAst(child));
		});
		this.contextStack.pop();
	}

	private handleFunctionCall(ast: AST.FunctionCall) {
		// Probably better as a proper "builtinFunction" system, but don't want to deal with having to publicize a bunch of stuff
		if (ast.target.value == "print") return this.handlePrintFunctionCall(ast);
		if (ast.target.value == "rand") return this.handleRandFunctionCall(ast);

		const fn = this.functions.find(f => f.name == ast.target.value);
		if (!fn) {
			if (this.context.hasGV(ast.target.value)) {
				ast.arguments.forEach((arg, idx) => this.compileAst(arg));
				this.add(this.gen.gvCopy(this.vn(ast.target.value), this.vn(vars.result)));
				this.add(this.gen.fireConditionalAction(this.functionExecCaId));
				return;
			} else {
				throw new Error(`Function "${ast.target.value}" not found`);
			}
		}

		ast.arguments.forEach((arg, idx) => {
			this.compileAst(arg);

			this.pop();
			const param = fn.params[idx];
			this.add(this.gen.gvCopy(this.vn(vars.result), param.id));
		});

		if (fn.type == "sequence") this.add(this.gen.callSequence(fn.id));
		else this.add(this.gen.fireConditionalAction(fn.id));
	}

	private handleRandFunctionCall(ast: AST.FunctionCall) {
		const chance = ast.arguments[0];
		if (chance.type != AST.Type.Literal) throw new Error("rand() only supports number literals");
		if (typeof chance.value != "number") throw new Error("rand() only supports number literals, got " + typeof chance.value);

		const ifTrueAction = this.gen.gvSet(this.vn(vars.result), 1);
		const ifFalseAction = this.gen.gvSet(this.vn(vars.result), 0);
		const random = this.gen.chanceCond(chance.value);
		this.add(this.gen.simpleConditional("rand", random, ifTrueAction, ifFalseAction));
		this.push();
	}

	private handlePrintFunctionCall(ast: AST.FunctionCall) {
		const message = ast.arguments[0];
		if (message.type != AST.Type.Literal) throw new Error("print() only supports string literals");
		if (typeof message.value != "string") throw new Error("print() only supports string literals, got " + typeof message.value);

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
				const lower = (idRange.left as AST.Literal).value;
				if (typeof lower != "number") throw new Error(`Expected number, got ${lower} (${typeof lower})`);
				const upper = (idRange.right as AST.Literal).value;
				if (typeof upper != "number") throw new Error(`Expected number, got ${upper} (${typeof upper})`);

				for (let i = lower; i <= upper; i++) def.ids.push(i);
			} else {
				if (typeof idRange.value != "number") throw new Error(`Expected number, got ${idRange.value} (${typeof idRange.value})`);
				def.ids.push(idRange.value);
			}
		});

		this.defines.push(def);
	}

	private makeVar(name: string, forcedId?: number): GV {
		if (this.context.hasLocalGv(name)) throw new Error(`Variable "${name}" already exists`);

		const gvVar = this.context.addGV(name, forcedId);

		const gv = new VTNode<GVKeys>("gv");
		// const dataStr = `${id};${name};;0;`;
		const data = [gvVar.id, gvVar.writtenName, null, 0];
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

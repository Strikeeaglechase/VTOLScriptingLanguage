import { VTNode } from "../../vtsParser.js";
import { BaseBlockKeys, ConditionalKeys, EventKeys, GVKeys } from "../../vtTypes.js";
import { VTSGenerator } from "../vtsGenerator.js";
import { IR, IRArg, IRConditional, IRConditionalAction, IREvent, IREventList, IRSequence } from "./irGenerator.js";

class IRCompiler {
	private vts: VTNode;
	private _nextId = 20000;

	private primedIds: number[] = [];
	private nextId() {
		if (this.primedIds.length > 0) {
			return this.primedIds.pop()!;
		}

		return this._nextId++;
	}

	private prime(...ids: number[]) {
		this.primedIds.push(...ids);
	}

	private gen: VTSGenerator;
	constructor(private ir: IR, sourceVts: VTNode) {
		this.vts = sourceVts.clone();
		this.gen = new VTSGenerator(this.nextId.bind(this), this.vts);
	}

	public compile() {
		this.createGvs();
		this.gen.stackOverflowExceptionObjective();
		this.ir.sequences.forEach(sequence => this.compileSequence(sequence));
		this.ir.conditionalActions.forEach(ca => this.compileConditionalAction(ca));

		return this.vts;
	}

	private evalArg(arg: IRArg) {
		if (arg.type == "value") return arg.value;

		const args = arg.value.args.map(a => this.evalArg(a));
		return this.gen[arg.value.method](...args);
	}

	private compileEventsList(events: IREventList[], parent: VTNode) {
		events.forEach((eventList, idx) => {
			let target: VTNode;
			if (idx == 0) {
				const eventsListParent = parent.getChildrenWithName("EVENT");
				const eventInfo = eventsListParent[eventsListParent.length - 1].getNode("EventInfo");
				target = eventInfo;
			} else {
				const event = new VTNode<EventKeys>("EVENT");
				event.setValue("nodeName", "Event");
				const eventInfo = new VTNode("EventInfo");
				eventInfo.setValue("eventName", null);
				event.addChild(eventInfo);

				if (eventList.startCondition) {
					var cond = this.compileConditional(eventList.startCondition);
					event.setValue("conditional", cond.getValue("id"));
				}
				parent.addChild(event);
				target = eventInfo;
			}

			this.compileEvents(eventList.events, target);
		});
	}

	private compileEvents(events: IREvent[], parent: VTNode) {
		events.forEach(event => {
			const args = event.args.map(a => this.evalArg(a));
			const eventNode = this.gen[event.method](...args);
			parent.addChild(eventNode);
		});
	}

	private compileConditional(conditional: IRConditional): VTNode<ConditionalKeys> {
		if (!conditional.method) throw new Error(`Multimethod not implemented yet`);

		const args = conditional.args.map(a => this.evalArg(a));
		const cond = this.gen[conditional.method](...args);

		this.vts.getNode("Conditionals").addChild(cond);

		return cond;
	}

	private compileSequence(sequence: IRSequence) {
		this.prime(sequence.id);
		const seq = this.gen.sequence(sequence.name);
		if (seq.getValue("sequenceName") == "Entrypoint") {
			seq.setValue("startImmediately", true, true);
		}

		this.compileEventsList(sequence.events, seq);
	}

	private compileConditionalAction(ca: IRConditionalAction) {
		this.prime(ca.id);
		const conditional = this.gen.conditionalAction(ca.name);
		const baseBlock = conditional.findChildWithName("BASE_BLOCK");

		// If
		const ifCondition = this.compileConditional(ca.if);
		baseBlock.addChild(ifCondition);

		// Then
		const actionBlock = new VTNode<"eventName">("ACTIONS");
		actionBlock.setValue("eventName", null);
		this.compileEvents(ca.then, actionBlock);
		baseBlock.addChild(actionBlock);

		// Else Ifs
		ca.elseIfs.forEach(elseIfIr => {
			const elseIf = new VTNode<BaseBlockKeys>("ELSE_IF");
			elseIf.setValue("{blockName}", "unk");
			elseIf.setValue("blockId", this.nextId());
			const elseIfConditional = this.compileConditional(elseIfIr.conditional);

			const elseIfActionParent = new VTNode<"eventName">("ACTIONS");
			elseIfActionParent.setValue("eventName", null);
			this.compileEvents(elseIfIr.then, elseIfActionParent);
			elseIf.addChild(elseIfConditional);
			elseIf.addChild(elseIfActionParent);

			baseBlock.addChild(elseIf);
		});

		// Else
		if (ca.else.length > 0) {
			const elseBlock = new VTNode<"eventName">("ELSE_ACTIONS");
			elseBlock.setValue("eventName", null);
			this.compileEvents(ca.else, elseBlock);
			baseBlock.addChild(elseBlock);
		}
	}

	private createGvs() {
		const gvContainer = this.vts.getNode("GlobalValues");
		this.ir.gvs.forEach(gv => {
			const gvNode = new VTNode<GVKeys>("gv");
			const data = [gv.id, gv.name, null, gv.defaultValue];
			gvNode.setValue("data", data);
			gvContainer.addChild(gvNode);
		});
	}
}

export { IRCompiler };

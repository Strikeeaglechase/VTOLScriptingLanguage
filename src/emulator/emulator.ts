import { vars } from "../compiler/compiler.js";
import { VTNode } from "../vtsParser.js";
import { CompKeys, ConditionalActionKeys, ConditionalKeys, EventTargetKeys, ParamInfoKeys, SequenceKeys } from "../vtTypes.js";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
interface GV {
	name: string;
	id: number;
	value: number;
}

class Emulator {
	private gvs: GV[] = [];
	public totalExecutedEventCount = 0;
	public execLog: string = "";

	constructor(private vts: VTNode, private debug = false) {
		this.gvs = this.vts.getAllChildrenWithName("gv").map(gv => {
			const [id, name, _, value] = gv.getValue("data") as [number, string, null, number];

			return { id, name, value };
		});
	}

	private async waitForCondition(condId: number) {
		const conditionals = this.vts.getNode("Conditionals").getAllChildrenWithName("CONDITIONAL");
		const condition = conditionals.find(c => c.getValue("id") === condId);

		return new Promise<void>(res => {
			const check = () => {
				if (this.evaluateCondition(condition)) {
					res();
				} else {
					setTimeout(check, 10);
				}
			};
			check();
		});
	}

	private async executeSequence(sequence: VTNode<SequenceKeys>, depth: number) {
		const name = sequence.getValue("sequenceName");
		if (this.debug) this.log("\t".repeat(depth) + `Executing sequence: ${name}`);
		const events = sequence.getAllChildrenWithName("EVENT");

		for (const event of events) {
			const eventStartCondition = event.getValue("conditional") as number;
			if (eventStartCondition) {
				await this.waitForCondition(eventStartCondition);

				const conditionals = this.vts.getNode("Conditionals").getAllChildrenWithName("CONDITIONAL");
				const jumpFlag = conditionals
					.find(c => c.getValue("id") === eventStartCondition)
					.getNode("COMP")
					.getValue("c_value");

				let result = "\t".repeat(depth + 1);
				result += `<WAITED> ${jumpFlag}`;
				if (this.debug) this.log(result);
			}

			const eventTargets = event.getAllChildrenWithName("EventTarget");
			await this.fireEvents(eventTargets, depth + 1);
		}
	}

	private debugEvent(event: VTNode<EventTargetKeys>, depth: number) {
		if (!this.debug) return;
		let result = "\t".repeat(depth);
		switch (event.getValue("targetType")) {
			case "System":
				result += event.getValue("methodName") + " " + this.parseEventArgsToString(event).join(", ");
				break;
			case "Event_Sequences":
				result += event.getValue("methodName") + " ";
				const seq = this.vts.getAllChildrenWithName("SEQUENCE").find(s => s.getValue("id") === event.getValue("targetID"));
				result += seq.getValue("sequenceName");
				break;
		}

		this.log(result);
	}

	private fireEvent(event: VTNode<EventTargetKeys>, depth: number) {
		this.debugEvent(event, depth);
		this.totalExecutedEventCount++;
		// const key = `${event.getValue("targetType")}.${event.getValue("targetID")}.${event.getValue("methodName")}`;
		// console.log(`Firing event: ${key}`);
		switch (event.getValue("targetType")) {
			case "System":
				this.handleSystemEvent(event, depth);
				break;
			case "Event_Sequences":
				this.handleEventSequenceEvent(event, depth);
				break;
		}

		this.checkStack();
	}

	private async fireEvents(events: VTNode<EventTargetKeys>[], depth: number) {
		for (const event of events) {
			this.fireEvent(event, depth);
			await delay(0); // Simulate waitForNextFrame
		}
	}

	private parseEventArgsToString(event: VTNode<EventTargetKeys>) {
		const paramInfos = event.getAllChildrenWithName<ParamInfoKeys>("ParamInfo");
		return paramInfos.map(paramInfo => {
			switch (paramInfo.getValue("type")) {
				case "GlobalValue":
					const gv = this.getGvById(paramInfo.getValue("value"));
					return `${gv.name}(${gv.value})`;
				case "System.Single":
					return paramInfo.getValue("value");
				case "ConditionalActionReference":
					return (
						this.vts
							.getAllChildrenWithName<ConditionalActionKeys>("ConditionalAction")
							.find(ca => ca.getValue("id") === paramInfo.getValue("value"))
							.getValue("name") +
						" " +
						paramInfo.getValue("value")
					);
				default:
					throw new Error(`Unhandled param type: ${paramInfo.getValue("type")}`);
			}
		});
	}

	private parseEventArgs(event: VTNode<EventTargetKeys>) {
		const paramInfos = event.getAllChildrenWithName<ParamInfoKeys>("ParamInfo");
		return paramInfos.map(paramInfo => {
			switch (paramInfo.getValue("type")) {
				case "GlobalValue":
					return this.getGvById(paramInfo.getValue("value"));
				case "System.Single":
					return paramInfo.getValue("value");
				case "ConditionalActionReference":
					return this.vts.getAllChildrenWithName("ConditionalAction").find(ca => ca.getValue("id") === paramInfo.getValue("value"));
				default:
					throw new Error(`Unhandled param type: ${paramInfo.getValue("type")}`);
			}
		});
	}

	private handleSystemEvent(event: VTNode<EventTargetKeys>, depth: number) {
		const targetId = event.getValue("targetID");

		if (targetId == 0 && event.getValue("methodName") == "FireConditionalAction") {
			const [ca] = this.parseEventArgs(event) as [VTNode<ConditionalActionKeys>];
			this.handleConditionalAction(ca, depth + 1);
			return;
		}

		if (targetId != 2) throw new Error(`Unhandled system event target ID: ${targetId}`);

		switch (event.getValue("methodName")) {
			case "SetValue": {
				const [gv, value] = this.parseEventArgs(event) as [GV, number];
				gv.value = value;
				break;
			}
			case "IncrementValue": {
				const [gv, increment] = this.parseEventArgs(event) as [GV, number];
				gv.value += increment;
				break;
			}
			case "DecrementValue": {
				const [gv, decrement] = this.parseEventArgs(event) as [GV, number];
				gv.value -= decrement;
				break;
			}
			case "CopyValue": {
				const [source, destination] = this.parseEventArgs(event) as [GV, GV];
				destination.value = source.value;
				break;
			}
			case "AddValues": {
				const [source, destination] = this.parseEventArgs(event) as [GV, GV];
				destination.value += source.value;
				break;
			}
			case "MultiplyValues": {
				const [source, destination] = this.parseEventArgs(event) as [GV, GV];
				destination.value *= source.value;
				break;
			}

			default:
				throw new Error(`Unhandled system event method name: ${event.getValue("methodName")}`);
		}
	}

	private evaluateCondition(condition: VTNode<ConditionalKeys>) {
		const comps = condition.getAllChildrenWithName<CompKeys>("COMP");
		const root = comps.find(c => c.getValue("id") == condition.getValue("root"));

		return this.evaluateComp(root, comps);
	}

	private evaluateComp(comp: VTNode<CompKeys>, allComps: VTNode<CompKeys>[]) {
		switch (comp.getValue("type")) {
			case "SCCGlobalValue":
				const gv = this.getGvById(comp.getValue("gv"));
				switch (comp.getValue("comparison")) {
					case "Equals":
						return gv.value == comp.getValue("c_value");
					case "Less_Than":
						return gv.value < (comp.getValue("c_value") as number);
					case "Greater_Than":
						return gv.value > (comp.getValue("c_value") as number);
				}
				break;
			case "SCCGlobalValueCompare":
				const gvA = this.getGvById(comp.getValue("gvA"));
				const gvB = this.getGvById(comp.getValue("gvB"));
				switch (comp.getValue("comparison")) {
					case "Equals":
						return gvA.value == gvB.value;
					case "NotEquals":
						return gvA.value != gvB.value;
					case "Greater":
						return gvA.value > gvB.value;
					case "Greater_Or_Equal":
						return gvA.value >= gvB.value;
					case "Less":
						return gvA.value < gvB.value;
					case "Less_Or_Equal":
						return gvA.value <= gvB.value;
				}
				break;
			case "SCCOr":
				const orChildren = (comp.getValue("factors") as number[]).map(f => allComps.find(c => c.getValue("id") == f));
				return orChildren.some(c => this.evaluateComp(c, allComps));
			case "SCCAnd":
				const andChildren = (comp.getValue("factors") as number[]).map(f => allComps.find(c => c.getValue("id") == f));
				return andChildren.every(c => this.evaluateComp(c, allComps));
			default:
				throw new Error(`Unhandled conditional type: ${comp.getValue("type")}`);
		}
	}

	private handleConditionalAction(ca: VTNode<ConditionalActionKeys>, depth: number) {
		const bb = ca.getNode("BASE_BLOCK");
		const baseCondition = bb.getNode("CONDITIONAL");
		const baseIsTrue = this.evaluateCondition(baseCondition);
		if (baseIsTrue) {
			const baseAction = bb.getNode("ACTIONS");
			const events = baseAction.getAllChildrenWithName("EventTarget");
			this.fireEvents(events, depth);
		} else {
			const elseIfBlocks = bb.getAllChildrenWithName("ELSE_IF");
			for (const elseIfBlock of elseIfBlocks) {
				const condition = elseIfBlock.getNode("CONDITIONAL");
				const isTrue = this.evaluateCondition(condition);
				if (isTrue) {
					const actions = elseIfBlock.getNode("ACTIONS");
					const events = actions.getAllChildrenWithName("EventTarget");
					this.fireEvents(events, depth);
					return;
				}
			}

			const elseBlock = bb.getNode("ELSE_ACTIONS");
			if (elseBlock) {
				// const actions = elseBlock.getNode("ACTIONS");
				const events = elseBlock.getAllChildrenWithName("EventTarget");
				this.fireEvents(events, depth);
			}
		}
	}

	private handleEventSequenceEvent(event: VTNode<EventTargetKeys>, depth: number) {
		const sequence = this.vts.getAllChildrenWithName<SequenceKeys>("SEQUENCE").find(s => s.getValue("id") === event.getValue("targetID"));
		if (!sequence) throw new Error(`Could not find sequence with ID ${event.getValue("targetID")}`);

		switch (event.getValue("methodName")) {
			case "Restart":
				this.executeSequence(sequence, depth);
				break;
			default:
				throw new Error(`Unhandled event sequence method name: ${event.getValue("methodName")}`);
		}
	}

	private waitForHalt() {
		return new Promise<void>(res => {
			const check = () => {
				const jumpFlag = this.getGvByName(vars.jumpFlag);
				if (jumpFlag.value == -1) {
					if (this.debug) this.log(`Jump flag set to -1, halting`);
					res();
				} else {
					setTimeout(check, 10);
				}
			};
			check();
		});
	}

	public async execute() {
		const startImmediatelySequences = this.vts.getAllChildrenWithName<SequenceKeys>("SEQUENCE").filter(s => s.getValue("startImmediately"));
		startImmediatelySequences.forEach(sequence => this.executeSequence(sequence, 0));
		await this.waitForHalt();
	}

	private checkStack() {
		const gv = this.getGvByName(vars.stackOverflowFlag);
		if (gv.value) {
			// throw new Error("Stack overflow");
		}
	}

	public getGvByName(name: string) {
		return this.gvs.find(gv => gv.name === name);
	}

	private getGvById(id: number) {
		return this.gvs.find(gv => gv.id === id);
	}

	private log(str: string) {
		this.execLog += str + "\n";
	}
}

export { Emulator };

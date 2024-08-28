import { VTNode } from "../vtsParser.js";
import { NodeInfo } from "./vtsGenerator.js";

type IRArg = { type: "node"; value: IREvent } | { type: "value"; value: any };

interface IREvent {
	method: string;
	args: IRArg[];
}

interface IRSequence {
	name: string;
	id: number;
	events: IREvent[];
}

interface IRConditional {
	method: string;
	args: any[];
	multiMethod: { method: string; args: any[] }[];
}

interface IRConditionalAction {
	id: string;
	name: string;

	if: IRConditional;
	then: IREvent[];
	elseIfs: { conditional: IRConditional; then: IREvent[] }[];
	else: IREvent[];
}

interface IRGV {
	id: number;
	defaultValue: number;
	name: string;
}

interface IR {
	sequences: IRSequence[];
	conditionalActions: IRConditionalAction[];
	gvs: IRGV[];
}

class IRGenerator {
	constructor(private vts: VTNode, private nodeInfos: NodeInfo[]) {}

	private parseArg(arg: any): IRArg {
		const argAsNodeInfo = this.nodeInfos.find(n => n.result == arg);
		if (argAsNodeInfo) {
			const args = argAsNodeInfo.arguments.map(a => this.parseArg(a));
			return { type: "node", value: { method: argAsNodeInfo.methodName, args: args } };
		}

		return { type: "value", value: arg };
	}

	private parseEvents(events: VTNode[]): IREvent[] {
		return events.map(event => {
			const nodeInfo = this.nodeInfos.find(n => n.result == event);
			if (!nodeInfo) {
				return { method: "ERR_UNKNOWN", args: [] };
			} else {
				const args = nodeInfo.arguments.map(a => this.parseArg(a));
				return { method: nodeInfo.methodName, args: args };
			}
		});
	}

	private parseSequence(sequence: VTNode): IRSequence {
		const events = sequence.getAllChildrenWithName("EventTarget");
		return {
			name: sequence.getValue("sequenceName"),
			id: sequence.getValue("id"),
			events: this.parseEvents(events)
		};
	}

	private parseConditional(conditional: VTNode): IRConditional {
		const conditionalNodeInfo = this.nodeInfos.find(n => n.result == conditional);
		const compInfos = conditional.getChildrenWithName("COMP").map(n => this.nodeInfos.find(ni => ni.result == n));
		// let result = "";

		if (conditionalNodeInfo) {
			const args = conditionalNodeInfo.arguments.map(a => this.parseArg(a));
			return { method: conditionalNodeInfo.methodName, args: args, multiMethod: [] };
		} else {
			const methods = compInfos.map(info => {
				if (!info) {
					return { method: "ERR_UNKNOWN", args: [] };
				}
				const compArgs = info.arguments.map(a => this.parseArg(a));

				return { method: info.methodName, args: compArgs };
			});

			return { method: null, args: [], multiMethod: methods };
		}
	}

	private parseConditionalAction(action: VTNode) {
		const bb = action.getNode("BASE_BLOCK");
		const name = bb.getValue("{blockName}");
		const conditional = bb.getNode("CONDITIONAL");

		// let condActText = `${name} (${action.getValue("id")})\n\tIF` + this.describeConditional(conditional) + "\n";
		const then = bb.getNode("ACTIONS");
		const thenEvents = this.parseEvents(then.getAllChildrenWithName("EventTarget"));
		const condAct: IRConditionalAction = {
			id: action.getValue("id"),
			name: name as string,
			if: this.parseConditional(conditional),
			then: thenEvents,
			elseIfs: [],
			else: []
		};

		const elseIfBlocks = bb.getAllChildrenWithName("ELSE_IF");
		elseIfBlocks.forEach(elseIf => {
			const elseIfConditional = elseIf.getNode("CONDITIONAL");
			// condActText += `\tELSE_IF ` + this.describeConditional(elseIfConditional) + "\n";

			const elseIfEvents = this.parseEvents(elseIf.getNode("ACTIONS").getAllChildrenWithName("EventTarget"));

			condAct.elseIfs.push({
				conditional: this.parseConditional(elseIfConditional),
				then: elseIfEvents
			});
		});

		const elseEvents = bb.getNode("ELSE_ACTIONS");
		if (elseEvents) {
			const elseEventsDec = this.parseEvents(elseEvents.getAllChildrenWithName("EventTarget"));
			condAct.else = elseEventsDec;
		}

		return condAct;
	}

	private parseGv(gv: VTNode): IRGV {
		const [id, name, _, defaultValue] = gv.getValue("data") as [number, string, string, number];
		return { id, name, defaultValue };
	}

	public generateIR() {
		const sequences = this.vts.getAllChildrenWithName("SEQUENCE");
		const condActions = this.vts.getAllChildrenWithName("ConditionalAction");
		const gvs = this.vts.getAllChildrenWithName("gv");

		const ir: IR = {
			sequences: sequences.map(s => this.parseSequence(s)),
			conditionalActions: condActions.map(ca => this.parseConditionalAction(ca)),
			gvs: gvs.map(gv => this.parseGv(gv))
		};

		return ir;
	}

	private stringifyArg(arg: IRArg, ir: IR) {
		if (arg.type == "value") {
			if (typeof arg.value == "number" && arg.value >= 10000) {
				const seqRef = ir.sequences.find(s => s.id == arg.value);
				if (seqRef) {
					return `seq_${seqRef.name}_${seqRef.id}`;
				}
				const cActRef = ir.conditionalActions.find(ca => ca.id == arg.value);
				if (cActRef) {
					return `cact_${cActRef.name}_${cActRef.id}`;
				}
				const gvRef = ir.gvs.find(gv => gv.id == arg.value);
				if (gvRef) {
					return gvRef.name;
				}
			}

			return JSON.stringify(arg.value);
		}

		return this.stringifyEvent(arg.value, ir);
	}

	private stringifyEvent(event: IREvent, ir: IR) {
		const args = event.args.map(a => this.stringifyArg(a, ir));
		return `${event.method}(${args.join(", ")})`;
	}

	private stringifyConditional(cond: IRConditional, ir: IR) {
		if (cond.method) {
			const args = cond.args.map(a => this.stringifyArg(a, ir));
			return `${cond.method}(${args.join(", ")})`;
		} else {
			const multiMethods = cond.multiMethod.map(m => {
				const args = m.args.map(a => this.stringifyArg(a, ir));
				return `${m.method}(${args.join(", ")})`;
			});

			return multiMethods.join(" + ");
		}
	}

	public debug(ir: IR) {
		let result = ``;
		ir.sequences.forEach(s => {
			result += `[SEQ] ${s.name} (${s.id})\n`;
			s.events.forEach(e => {
				result += `\t${this.stringifyEvent(e, ir)}\n`;
			});
			result += "\n";
		});

		ir.conditionalActions.forEach(ca => {
			result += `[CACT] ${ca.name} (${ca.id})\n`;
			result += `\tIF ${this.stringifyConditional(ca.if, ir)}\n`;
			ca.then.forEach(e => {
				result += `\t\t${this.stringifyEvent(e, ir)}\n`;
			});

			ca.elseIfs.forEach(elseIf => {
				result += `\tELSE_IF ${this.stringifyConditional(elseIf.conditional, ir)}\n`;
				elseIf.then.forEach(e => {
					result += `\t\t${this.stringifyEvent(e, ir)}\n`;
				});
			});

			if (ca.else.length > 0) {
				result += `\tELSE\n`;
				ca.else.forEach(e => {
					result += `\t\t${this.stringifyEvent(e, ir)}\n`;
				});
			}
			result += "\n";
		});

		ir.gvs.forEach(gv => {
			result += `[GV] ${gv.name} (${gv.id}) = ${gv.defaultValue}\n`;
		});

		return result;
	}
}

export { IRGenerator, IR, IREvent, IRSequence, IRConditional, IRConditionalAction, IRArg };

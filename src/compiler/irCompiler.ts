import { VTNode } from "../vtsParser.js";
import { GVKeys } from "../vtTypes.js";
import { IR, IRArg } from "./irGenerator.js";
import { VTSGenerator } from "./vtsGenerator.js";

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
		this.createSequences();

		return this.vts;
	}

	private evalArg(arg: IRArg) {
		if (arg.type == "value") return arg.value;

		const args = arg.value.args.map(a => this.evalArg(a));
		console.log(`(arg eval) Calling ${arg.value.method} with args:`, args);
		return this.gen[arg.value.method](...args);
	}

	private createSequences() {
		this.ir.sequences.forEach(sequence => {
			this.prime(sequence.id);
			const seq = this.gen.sequence(sequence.name);

			const eventsListParent = seq.getChildrenWithName("EVENT");
			const eventInfo = eventsListParent[eventsListParent.length - 1].getNode("EventInfo");
			sequence.events.forEach(event => {
				const args = event.args.map(a => this.evalArg(a));
				// console.log(`(event) Calling ${event.method} with args:`, args);
				const eventNode = this.gen[event.method](...args);
				eventInfo.addChild(eventNode);
			});
		});
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

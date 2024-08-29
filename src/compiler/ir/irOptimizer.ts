import { vars } from "../compiler.js";
import { IR, IREvent, IRGV, IRSequence } from "./irGenerator.js";

const OPTIMIZATION_PASS_COUNT = 2;

class IROptimizer {
	private popSeq: IRSequence;
	private pushSeq: IRSequence;
	private resultGv: IRGV;

	constructor(private ir: IR) {}

	// Optimize the pointless push then instant pop sequences
	// private removePushPop(events: IREvent[]) {
	// 	const pushSeq = this.ir.sequences.find(seq => seq.name == "push");
	// 	const popSeq = this.ir.sequences.find(seq => seq.name == "pop");

	// 	const newEvents: IREvent[] = [];

	// 	for (let i = 0; i < events.length - 1; i++) {
	// 		const currentIsPush = events[i].method == "callSequence" && events[i].args[0].value == pushSeq.id;
	// 		const nextIsPop = events[i + 1].method == "callSequence" && events[i + 1].args[0].value == popSeq.id;

	// 		if (currentIsPush && nextIsPop) {
	// 			i++;
	// 			continue;
	// 		}

	// 		newEvents.push(events[i]);
	// 	}
	// 	newEvents.push(events[events.length - 1]);

	// 	return newEvents;
	// }

	// Optimize things like A = B, B = A
	private removeUselessAssignments(events: IREvent[]) {
		const newEvents: IREvent[] = [];

		for (let i = 0; i < events.length - 1; i++) {
			const current = events[i];
			const next = events[i + 1];

			newEvents.push(current);
			if (current.method != "gvCopy" || next.method != "gvCopy") continue;

			const source1 = current.args[0].value;
			const dest1 = current.args[1].value;
			const source2 = next.args[0].value;
			const dest2 = next.args[1].value;

			if (source1 == dest2 && dest1 == source2) i++;
		}

		newEvents.push(events[events.length - 1]);

		return newEvents;
	}

	// Remove unless push/pop's across longer sets
	private removeFarPushPop(events: IREvent[]) {
		const newEvents: IREvent[] = [];

		for (let i = 0; i < events.length - 1; i++) {
			const currentIsPush = events[i].method == "callSequence" && events[i].args[0].value == this.pushSeq.id;
			if (!currentIsPush) {
				newEvents.push(events[i]);
				continue;
			}

			let canSkip = true;
			let j = i + 1;
			for (; j < events.length; j++) {
				const current = events[j];
				const currentIsPop = current.method == "callSequence" && current.args[0].value == this.popSeq.id;
				if (currentIsPop) break;

				if (current.method == "callSequence" || current.method == "fireConditional") {
					canSkip = false;
				}

				switch (current.method) {
					// Incrementing or setting mutates result
					case "gvIncDec":
					case "gvSet":
						if (current.args[0].value == this.resultGv.id) canSkip = false;
						break;

					// If result is destination is mutated
					case "gvCopy":
					case "gvMath":
						if (current.args[1].value == this.resultGv.id) canSkip = false;
						break;
				}

				if (!canSkip) break;
			}

			if (canSkip) {
				events.splice(j, 1);
			} else {
				newEvents.push(events[i]);
			}
		}

		newEvents.push(events[events.length - 1]);

		return newEvents;
	}

	// Optimize things like result = N, B = result, result = _ to just be C = B
	private removeRedundantAssignments(events: IREvent[]) {
		const newEvents: IREvent[] = [];
		for (let i = 0; i < events.length; i++) {
			if (events[i].method != "gvSet" || events[i].args[0].value != this.resultGv.id) {
				newEvents.push(events[i]);
				continue;
			}

			const next = events[i + 1];

			if (!next || next.method != "gvCopy" || next.args[0].value != this.resultGv.id) {
				newEvents.push(events[i]);
				continue;
			}

			// Make sure the result is not used after this
			let isUsed = false;
			let done = false;
			for (let j = i + 2; j < events.length; j++) {
				const current = events[j];
				switch (events[j].method) {
					case "callSequence":
						if (current.args[0].value == this.popSeq.id) done = true; // Pop overwrites result
						else isUsed = true;
						break;

					// Check overwrite result
					case "gvSet":
						if (current.args[0].value == this.resultGv.id) done = true;
						break;

					// Incrementing result mutates, but requires it be set
					case "gvIncDec":
						if (current.args[0].value == this.resultGv.id) isUsed = true;
						break;

					// Used anywhere in math is a problem
					case "gvMath":
						if (current.args[0].value == this.resultGv.id || current.args[1].value == this.resultGv.id) isUsed = true;
						break;

					// Only a problem if we're copying the result out
					case "gvCopy":
						if (current.args[0].value == this.resultGv.id) isUsed = true;
						if (current.args[1].value == this.resultGv.id) done = true;

						break;
				}

				if (isUsed || done) break;
			}

			if (!isUsed) {
				// We don't need to do the extra assignment
				// Do direct assignment
				events[i].args[0].value = next.args[1].value;
				newEvents.push(events[i]);
				i++; // Skip the next event
			} else {
				newEvents.push(events[i]);
			}
		}

		return newEvents;
	}

	private optimizeEventList(events: IREvent[]) {
		if (events.length == 0) return [];

		for (let i = 0; i < OPTIMIZATION_PASS_COUNT; i++) {
			events = this.removeFarPushPop(events);
			events = this.removeUselessAssignments(events);
			events = this.removeRedundantAssignments(events);
		}

		return events;
	}

	public optimize() {
		this.pushSeq = this.ir.sequences.find(seq => seq.name == "push");
		this.popSeq = this.ir.sequences.find(seq => seq.name == "pop");
		this.resultGv = this.ir.gvs.find(gv => gv.name == vars.result);

		this.ir.sequences.forEach(seq => (seq.events = this.optimizeEventList(seq.events)));
		this.ir.conditionalActions.forEach(ca => {
			ca.then = this.optimizeEventList(ca.then);
			ca.else = this.optimizeEventList(ca.else);
			ca.elseIfs.forEach(elif => (elif.then = this.optimizeEventList(elif.then)));
		});

		return this.ir;
	}
}

export { IROptimizer };

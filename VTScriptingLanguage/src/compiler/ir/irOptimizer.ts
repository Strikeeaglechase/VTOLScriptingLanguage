import { vars } from "../compiler.js";
import { IR, IRConditionalAction, IREvent, IREventList, IRGV, IRSequence } from "./irGenerator.js";

// const OPTIMIZATION_PASS_COUNT = 1;

class IROptimizer {
	private popAction: IRConditionalAction;
	private pushAction: IRConditionalAction;
	private resultGv: IRGV;

	private ir: IR;

	constructor(ir: IR) {
		this.ir = JSON.parse(JSON.stringify(ir));
	}

	// Optimize things like A = B, B = A
	private removeUselessAssignments(eventLists: IREventList[]) {
		eventLists.forEach(el => {
			const newEvents: IREvent[] = [];
			const events = el.events;

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

			el.events = newEvents;
		});

		return eventLists;
	}

	private removeFarPushPop(eventLists: IREventList[]) {
		// Matching for a structure like [..., push], [jumpFlag=0, pop] [...]
		// Return [..., ...] where the two lists are merged

		for (let i = 0; i < eventLists.length - 2; i++) {
			const eventList = eventLists[i];
			const nextEventList = eventLists[i + 1];
			const nextNextEventList = eventLists[i + 2];

			const lastEvent = eventList.events[eventList.events.length - 1];
			const lastIsPush = lastEvent.method == "fireConditional" && lastEvent.args[0].value == this.pushAction.id;

			const secondEventInNext = nextEventList.events[1];
			const firstIsPop = secondEventInNext?.method == "fireConditional" && secondEventInNext?.args[0].value == this.popAction.id;

			if (!lastIsPush || !firstIsPop) {
				continue;
			}

			if (nextEventList.events.length != 2) {
				throw new Error(`Expected pop sequence to only have 2 events, got ${nextEventList.events.length}`);
			}

			eventList.events.pop(); // Remove the initial push
			eventLists.splice(i + 1, 1); // Delete the pop sequence
			eventList.events.push(...nextNextEventList.events.slice(1)); // Add the next events to the current list
			eventLists.splice(i + 1, 1); // Remove the next events

			i--; // Recheck the current event list
		}

		return eventLists;
	}

	private isResultUsedAfter(events: IREvent[], index: number) {
		let isUsed = false;
		let done = false;
		for (let j = index; j < events.length; j++) {
			const current = events[j];
			switch (events[j].method) {
				case "fireConditional":
					if (current.args[0].value == this.popAction.id) done = true; // Pop overwrites result
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

		return isUsed;
	}

	// Optimize things like result = N, B = result, result = _ to just B = N
	private removeRedundantAssignments(eventLists: IREventList[]) {
		eventLists.forEach(el => {
			const events = el.events;
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
				let isUsed = this.isResultUsedAfter(events, i + 2);

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

			el.events = newEvents;
		});

		return eventLists;
	}

	// Optimize things like result = B, C = result to C = B (if result is not used again)
	private removeRedundantCopies(eventLists: IREventList[]) {
		eventLists.forEach(el => {
			const events = el.events;
			const newEvents: IREvent[] = [];
			for (let i = 0; i < events.length; i++) {
				if (events[i].method != "gvCopy" || events[i].args[1].value != this.resultGv.id) {
					newEvents.push(events[i]);
					continue;
				}

				const next = events[i + 1];
				if (!next || next.method != "gvCopy" || next.args[0].value != this.resultGv.id) {
					newEvents.push(events[i]);
					continue;
				}

				const isUsed = this.isResultUsedAfter(events, i + 2);
				if (!isUsed) {
					events[i].args[1].value = next.args[1].value;
					newEvents.push(events[i]);
					i++;
				} else {
					newEvents.push(events[i]);
				}
			}

			el.events = newEvents;
		});

		return eventLists;
	}

	private optimizeEventList(events: IREventList[], passCount: number) {
		if (events.length == 0) return [];

		for (let i = 0; i < passCount; i++) {
			events = this.removeFarPushPop(events);
			events = this.removeUselessAssignments(events);
			events = this.removeRedundantAssignments(events);
			events = this.removeRedundantCopies(events);
		}

		return events;
	}

	public optimize(passCount: number) {
		this.pushAction = this.ir.conditionalActions.find(seq => seq.name == "push");
		this.popAction = this.ir.conditionalActions.find(seq => seq.name == "pop");
		this.resultGv = this.ir.gvs.find(gv => gv.name == vars.result);

		this.ir.sequences.forEach(seq => (seq.events = this.optimizeEventList(seq.events, passCount)));
		// this.ir.conditionalActions.forEach(ca => {
		// 	ca.then = this.optimizeEventList(ca.then);
		// 	ca.else = this.optimizeEventList(ca.else);
		// 	ca.elseIfs.forEach(elif => (elif.then = this.optimizeEventList(elif.then)));
		// });

		return this.ir;
	}
}

export { IROptimizer };

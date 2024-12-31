import { varIds, vars } from "../compiler.js";
import { IR, IRConditionalAction, IREvent, IREventList, IRGV, IRSequence } from "./irGenerator.js";

// const OPTIMIZATION_PASS_COUNT = 1;

class IROptimizer {
	private popAction: IRConditionalAction;
	private pushAction: IRConditionalAction;
	private resultGv: IRGV;

	private ir: IR;
	private pcn = 0;

	constructor(ir: IR) {
		this.ir = JSON.parse(JSON.stringify(ir));
	}

	// Optimize things like A = B, B = A
	private removeUselessAssignments(events: IREvent[]) {
		const newEvents: IREvent[] = [];
		if (events.length == 0) return [];

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

	private oldRemoveFarPushPop(eventLists: IREventList[]) {
		// Matching for a structure like [..., push], [jumpFlag=0, pop] [...]
		// Return [..., ...] where the two lists are merged

		for (let i = 0; i < eventLists.length - 2; i++) {
			const eventList = eventLists[i];
			const nextEventList = eventLists[i + 1];
			const nextNextEventList = eventLists[i + 2];

			const lastEvent = eventList.events[eventList.events.length - 1];
			const lastIsPush = lastEvent.method == "fireConditionalAction" && lastEvent.args[0].value == this.pushAction.id;

			const secondEventInNext = nextEventList.events[1];
			const firstIsPop = secondEventInNext?.method == "fireConditionalAction" && secondEventInNext?.args[0].value == this.popAction.id;

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

	private removeFarPushPop(events: IREvent[]) {
		if (events.length == 0) return [];
		const newEvents: IREvent[] = [];

		for (let i = 0; i < events.length - 1; i++) {
			const currentIsPush = events[i].method == "fireConditionalAction" && events[i].args[0].value == this.pushAction.id;
			if (!currentIsPush) {
				newEvents.push(events[i]);
				continue;
			}

			let canSkip = true;
			let j = i + 1;
			for (; j < events.length; j++) {
				const current = events[j];
				const currentIsPop = current.method == "fireConditionalAction" && current.args[0].value == this.popAction.id;
				if (currentIsPop) break;

				if (current.method == "fireConditionalAction" || current.method == "callSequence") canSkip = false;
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
				events.splice(j, 1); // Delete pop (and don't add push)
			} else {
				newEvents.push(events[i]);
			}
		}

		newEvents.push(events[events.length - 1]);

		return newEvents;
	}

	private isGvUsedAfter(events: IREvent[], index: number, gvId: number) {
		let isUsed = false;
		let done = false;
		for (let j = index; j < events.length; j++) {
			const current = events[j];
			switch (events[j].method) {
				case "fireConditionalAction":
					if (current.args[0].value == this.popAction.id && gvId == this.resultGv.id) done = true; // Pop overwrites result
					else isUsed = true;
					break;

				// Check overwrite result
				case "gvSet":
					if (current.args[0].value == gvId) done = true;
					break;

				// Incrementing result mutates, but requires it be set
				case "gvIncDec":
					if (current.args[0].value == gvId) isUsed = true;
					break;

				// Used anywhere in math is a problem
				case "gvMath":
					if (current.args[0].value == gvId || current.args[1].value == gvId) isUsed = true;
					break;

				// Only a problem if we're copying the result out
				case "gvCopy":
					if (current.args[0].value == gvId) isUsed = true;
					if (current.args[1].value == gvId) done = true;

					break;
			}

			if (isUsed || done) break;
		}

		return isUsed;
	}

	// Optimize things like result = N, B = result, result = _ to just B = N
	private removeRedundantAssignments(events: IREvent[]) {
		if (events.length == 0) return [];
		const newEvents: IREvent[] = [];
		for (let i = 0; i < events.length; i++) {
			if (events[i].method != "gvSet" /*|| events[i].args[0].value != this.resultGv.id*/) {
				newEvents.push(events[i]);
				continue;
			}
			const gvId = events[i].args[0].value;

			const next = events[i + 1];

			if (!next || next.method != "gvCopy" || next.args[0].value != gvId) {
				newEvents.push(events[i]);
				continue;
			}

			// Make sure the result is not used after this
			let isUsed = this.isGvUsedAfter(events, i + 2, gvId);

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

	// Optimize things like result = B, C = result to C = B (if result is not used again)
	private removeRedundantCopies(events: IREvent[]) {
		const newEvents: IREvent[] = [];
		for (let i = 0; i < events.length; i++) {
			if (events[i].method != "gvCopy") {
				newEvents.push(events[i]);
				continue;
			}

			const gvId = events[i].args[1].value;
			const next = events[i + 1];
			if (!next || next.method != "gvCopy" || next.args[0].value != gvId) {
				newEvents.push(events[i]);
				continue;
			}

			const isUsed = this.isGvUsedAfter(events, i + 2, gvId);
			if (!isUsed) {
				events[i].args[1].value = next.args[1].value;
				newEvents.push(events[i]);
				i++;
			} else {
				newEvents.push(events[i]);
			}
		}

		return newEvents;
	}

	private optimizeEvents(events: IREvent[], passCount: number) {
		for (let i = 0; i < passCount; i++) {
			this.pcn = i;
			events = this.removeFarPushPop(events);
			events = this.removeUselessAssignments(events);
			events = this.removeRedundantAssignments(events);
			events = this.removeRedundantCopies(events);
		}

		return events;
	}

	private optimizeEventLists(eventsLists: IREventList[], passCount: number) {
		if (eventsLists.length == 0) return [];

		eventsLists.forEach(el => {
			el.events = this.optimizeEvents(el.events, passCount);
		});

		return eventsLists;
	}

	public optimize(passCount: number) {
		this.pushAction = this.ir.conditionalActions.find(seq => seq.name == "push");
		this.popAction = this.ir.conditionalActions.find(seq => seq.name == "pop");
		this.resultGv = this.ir.gvs.find(gv => gv.name == vars.result);

		this.ir.sequences.forEach(seq => (seq.events = this.optimizeEventLists(seq.events, passCount)));
		this.ir.conditionalActions.forEach(ca => {
			ca.then = this.optimizeEvents(ca.then, passCount);
			ca.else = this.optimizeEvents(ca.else, passCount);
			ca.elseIfs.forEach(elif => (elif.then = this.optimizeEvents(elif.then, passCount)));
		});

		return this.ir;
	}
}

export { IROptimizer };

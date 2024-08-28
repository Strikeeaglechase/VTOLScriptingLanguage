import { VTNode } from "../vtsParser.js";
import {
	BaseBlockKeys,
	CompKeys,
	ConditionalActionKeys,
	ConditionalKeys,
	EventKeys,
	EventTargetKeys,
	ParamAttrInfoKeys,
	ParamInfoKeys,
	SequenceKeys
} from "../vtTypes.js";
import { Compiler } from "./compiler.js";

interface NodeInfo {
	methodName: string;
	arguments: any[];
	result: VTNode;
}

const nodeInfos: NodeInfo[] = [];
function Track(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
	const orgFn = descriptor.value as Function;
	descriptor.value = function (...args: any[]) {
		// console.log(propertyKey, args)
		const result = orgFn.apply(this, args);
		this["nodeInfos"].push({
			methodName: propertyKey,
			arguments: args,
			result: result
		});

		return result;
	};
}

class VTSGenerator {
	public nodeInfos: NodeInfo[] = [];
	public get context() {
		return this.compiler.context;
	}

	constructor(private compiler: Compiler, private nextId: () => number, private vts: VTNode) {}

	@Track
	public sequence(name: string, addToSeqList = true, withBaseEvent = true) {
		const node = new VTNode<SequenceKeys>("SEQUENCE");
		node.setValue("id", this.nextId());
		node.setValue("sequenceName", name);
		node.setValue("whileLoop", false);
		node.setValue("startImmediately", false);

		if (withBaseEvent) {
			const baseEvent = new VTNode<EventKeys>("EVENT");
			baseEvent.setValue("delay", 0);
			baseEvent.setValue("nodeName", "Base Event");
			node.addChild(baseEvent);

			const eventInfo = new VTNode<"eventName">("EventInfo");
			eventInfo.setValue("eventName", null);
			baseEvent.addChild(eventInfo);
		}

		if (addToSeqList) {
			const parent = this.vts.getNode("EventSequences");
			parent.addChild(node);
			// console.log(parent);
			// console.log(this.vts.getAllChildrenWithName("SEQUENCE").map(s => s.getValue("sequenceName")));
		}

		return node;
	}

	@Track
	public fireConditional(condId: number) {
		const eventTarget = new VTNode<EventTargetKeys>("EventTarget");
		eventTarget.setValue("targetType", "System");
		eventTarget.setValue("targetID", 0);
		eventTarget.setValue("eventName", "Fire Conditional Action");
		eventTarget.setValue("methodName", "FireConditionalAction");

		const paramInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		paramInfo.setValue("type", "ConditionalActionReference");
		paramInfo.setValue("value", condId);
		paramInfo.setValue("name", "Action");
		eventTarget.addChild(paramInfo);

		return eventTarget;
	}

	@Track
	public conditionalAction(name: string) {
		const condAction = new VTNode<ConditionalActionKeys>("ConditionalAction");
		condAction.setValue("id", this.nextId());
		condAction.setValue("name", null);

		const baseBlock = new VTNode<BaseBlockKeys>("BASE_BLOCK");
		baseBlock.setValue("{blockName}", name);
		baseBlock.setValue("blockId", this.nextId());
		condAction.addChild(baseBlock);

		const parent = this.vts.getNode("ConditionalActions");
		parent.addChild(condAction);

		return condAction;
	}

	@Track
	public unitComp(unitId: number, method: string, negated: boolean) {
		const comp = new VTNode<CompKeys>("COMP");
		comp.setValue("id", this.nextId());
		comp.setValue("type", "SCCUnit");
		comp.setValue("uiPos", { x: 0, y: 0, z: 0 });
		comp.setValue("unit", unitId);
		comp.setValue("methodName", method);
		comp.setValue("methodParameters", null);
		comp.setValue("isNot", negated);

		return comp;
	}

	@Track
	public conditionalWithCondition(cond: VTNode<CompKeys>) {
		const conditional = new VTNode<ConditionalKeys>("CONDITIONAL");
		conditional.setValue("id", this.nextId());
		conditional.setValue("outputNodePos", { x: 0, y: 0, z: 0 });
		conditional.setValue("root", cond.getValue("id"));
		conditional.addChild(cond);

		return conditional;
	}

	@Track
	public gvSet(gv: string, value: number) {
		const eventTarget = new VTNode<EventTargetKeys>("EventTarget");
		eventTarget.setValue("targetType", "System");
		eventTarget.setValue("targetID", 2);
		eventTarget.setValue("eventName", "Set Value");
		eventTarget.setValue("methodName", "SetValue");

		const gvParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		gvParamInfo.setValue("type", "GlobalValue");
		gvParamInfo.setValue("value", this.context.getGV(gv).id);
		gvParamInfo.setValue("name", "Global Value");
		eventTarget.addChild(gvParamInfo);

		const amountParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		amountParamInfo.setValue("type", "System.Single");
		amountParamInfo.setValue("value", value);
		amountParamInfo.setValue("name", "Value");
		eventTarget.addChild(amountParamInfo);

		const paramAttrInfo1 = new VTNode<ParamAttrInfoKeys>("ParamAttrInfo");
		paramAttrInfo1.setValue("type", "UnitSpawnAttributeRange+RangeTypes");
		paramAttrInfo1.setValue("data", "Int");
		amountParamInfo.addChild(paramAttrInfo1);

		const paramAttrInfo2 = new VTNode<ParamAttrInfoKeys>("ParamAttrInfo");
		paramAttrInfo2.setValue("type", "MinMax");
		paramAttrInfo2.setValue("data", "(-999999,999999)");
		amountParamInfo.addChild(paramAttrInfo2);

		return eventTarget;
	}

	@Track
	public gvCopy(from: string, to: string) {
		const eventTarget = new VTNode<EventTargetKeys>("EventTarget");
		eventTarget.setValue("targetType", "System");
		eventTarget.setValue("targetID", 2);
		eventTarget.setValue("eventName", "Copy Value");
		eventTarget.setValue("methodName", "CopyValue");

		const sourceParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		sourceParamInfo.setValue("type", "GlobalValue");
		sourceParamInfo.setValue("value", this.context.getGV(from).id);
		sourceParamInfo.setValue("name", "Source");
		eventTarget.addChild(sourceParamInfo);

		const destParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		destParamInfo.setValue("type", "GlobalValue");
		destParamInfo.setValue("value", this.context.getGV(to).id);
		destParamInfo.setValue("name", "Destination");
		eventTarget.addChild(destParamInfo);

		return eventTarget;
	}

	@Track
	public gvIncDec(gv: string, amount: number, type: "IncrementValue" | "DecrementValue") {
		const eventTarget = new VTNode<EventTargetKeys>("EventTarget");
		eventTarget.setValue("targetType", "System");
		eventTarget.setValue("targetID", 2);
		eventTarget.setValue("eventName", type);
		eventTarget.setValue("methodName", type);
		// eventInfo.addChild(eventTarget);

		const gvParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		gvParamInfo.setValue("type", "GlobalValue");
		gvParamInfo.setValue("value", this.context.getGV(gv).id);
		gvParamInfo.setValue("name", "Global Value");
		eventTarget.addChild(gvParamInfo);

		const amountParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		amountParamInfo.setValue("type", "System.Single");
		amountParamInfo.setValue("value", amount);
		amountParamInfo.setValue("name", "Value");
		eventTarget.addChild(amountParamInfo);

		const paramAttrInfo1 = new VTNode<ParamAttrInfoKeys>("ParamAttrInfo");
		paramAttrInfo1.setValue("type", "UnitSpawnAttributeRange+RangeTypes");
		paramAttrInfo1.setValue("data", "Int");
		amountParamInfo.addChild(paramAttrInfo1);

		const paramAttrInfo2 = new VTNode<ParamAttrInfoKeys>("ParamAttrInfo");
		paramAttrInfo2.setValue("type", "MinMax");
		paramAttrInfo2.setValue("data", "(-999999,999999)");
		amountParamInfo.addChild(paramAttrInfo2);

		return eventTarget;
	}

	@Track
	public gvMath(a: string, b: string, method: "AddValues" | "SubtractValues" | "MultiplyValues") {
		const eventTarget = new VTNode<EventTargetKeys>("EventTarget");
		eventTarget.setValue("targetType", "System");
		eventTarget.setValue("targetID", 2);
		eventTarget.setValue("eventName", method);
		eventTarget.setValue("methodName", method);

		const aParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		aParamInfo.setValue("type", "GlobalValue");
		aParamInfo.setValue("value", this.context.getGV(a).id);
		aParamInfo.setValue("name", "Source");
		eventTarget.addChild(aParamInfo);

		const bParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		bParamInfo.setValue("type", "GlobalValue");
		bParamInfo.setValue("value", this.context.getGV(b).id);
		bParamInfo.setValue("name", "Destination");
		eventTarget.addChild(bParamInfo);

		return eventTarget;
	}

	@Track
	public gvComp(gvName: string, value: number, comparison: "Equals" | "Greater_Than" | "Less_Than") {
		const comp = new VTNode<CompKeys>("COMP");
		comp.setValue("id", this.nextId());
		comp.setValue("type", "SCCGlobalValue");
		comp.setValue("uiPos", { x: 0, y: 0, z: 0 });
		comp.setValue("gv", this.context.getGV(gvName).id);
		comp.setValue("comparison", comparison);
		comp.setValue("c_value", value);

		return comp;
	}

	@Track
	public gvNotZero(gvName: string) {
		const greaterThanZero = this.gvComp(gvName, 0, "Greater_Than");
		const lessThanZero = this.gvComp(gvName, 0, "Less_Than");

		const or = new VTNode<CompKeys>("COMP");
		or.setValue("id", this.nextId());
		or.setValue("type", "SCCOr");
		or.setValue("uiPos", { x: 0, y: 0, z: 0 });
		or.setValue("factors", [greaterThanZero.getValue("id"), lessThanZero.getValue("id")]);

		const conditional = new VTNode<ConditionalKeys>("CONDITIONAL");
		conditional.setValue("id", this.nextId());
		conditional.setValue("outputNodePos", { x: 0, y: 0, z: 0 });
		conditional.setValue("root", or.getValue("id"));
		conditional.addChild(or);
		conditional.addChild(greaterThanZero);
		conditional.addChild(lessThanZero);

		return conditional;
	}

	@Track
	public gvGvComp(a: string, b: string, comparison: string) {
		const compLut = {
			"==": "Equals",
			"!=": "NotEquals",
			">": "Greater",
			">=": "Greater_Or_Equal",
			"<": "Less",
			"<=": "Less_Or_Equal"
		};

		if (!(comparison in compLut)) throw new Error(`Invalid comparison: ${comparison}`);

		const comp = new VTNode<CompKeys>("COMP");
		comp.setValue("id", this.nextId());
		comp.setValue("type", "SCCGlobalValueCompare");
		comp.setValue("uiPos", { x: 0, y: 0, z: 0 });
		comp.setValue("gvA", this.context.getGV(a).id);
		comp.setValue("gvB", this.context.getGV(b).id);
		comp.setValue("comparison", compLut[comparison]);

		return comp;
	}

	@Track
	public simpleConditional(
		name: string,
		comp: VTNode<CompKeys> | VTNode<ConditionalKeys>,
		ifTrueAction: VTNode<EventTargetKeys>,
		ifFalseAction?: VTNode<EventTargetKeys>
	) {
		const conditionalAction = this.conditionalAction(name);
		const bb = conditionalAction.getNode("BASE_BLOCK");

		if (comp.name == "COMP") {
			const conditional = this.conditionalWithCondition(comp as VTNode<CompKeys>);
			bb.addChild(conditional);
		} else {
			bb.addChild(comp);
		}

		const actionBlock = new VTNode<"eventName">("ACTIONS");
		actionBlock.setValue("eventName", null);
		actionBlock.addChild(ifTrueAction);
		bb.addChild(actionBlock);

		if (ifFalseAction) {
			const elseBlock = new VTNode<"eventName">("ELSE_ACTIONS");
			elseBlock.setValue("eventName", null);
			elseBlock.addChild(ifFalseAction);
			bb.addChild(elseBlock);
		}

		return this.fireConditional(conditionalAction.getValue("id"));
	}

	@Track
	public callSequence(id: number) {
		const eventTarget = new VTNode<EventTargetKeys>("EventTarget");
		eventTarget.setValue("targetType", "Event_Sequences");
		eventTarget.setValue("targetID", id);
		eventTarget.setValue("eventName", "Restart");
		eventTarget.setValue("methodName", "Restart");

		return eventTarget;
	}
}

export { VTSGenerator, NodeInfo };

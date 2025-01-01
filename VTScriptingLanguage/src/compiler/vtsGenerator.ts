import { VTNode, VTValue } from "../vtsParser.js";
import {
	BaseBlockKeys,
	CompKeys,
	ConditionalActionKeys,
	ConditionalKeys,
	EventKeys,
	EventTargetKeys,
	ObjectiveKeys,
	ParamAttrInfoKeys,
	ParamInfoKeys,
	SequenceKeys
} from "../vtTypes.js";
import { varIds } from "./compiler.js";
import { classTypeMap } from "./gameTypes.js";

interface NodeInfo {
	methodName: string;
	arguments: any[];
	result: VTNode;
	ids: number[];
}

function Track(target: Object, propertyKey: string, descriptor: PropertyDescriptor) {
	const orgFn = descriptor.value as Function;
	descriptor.value = function (this: VTSGenerator, ...args: any[]) {
		// console.log(propertyKey, args)
		const result = orgFn.apply(this, args);
		this.nodeInfos.push({
			methodName: propertyKey,
			arguments: args,
			result: result,
			ids: this._consumedIds
		});
		this._consumedIds = [];

		return result;
	};
}

/*
BASE_BLOCK
{
	blockName = 
	blockId = 1
	CONDITIONAL
	{
		id = 0
		outputNodePos = (165.9287, 33.08698, 0)
		root = 0
		COMP
		{
			id = 0
			type = SCCUnit
			uiPos = (-251.8561, 153.5828, 0)
			unit = 1
			methodName = SC_HealthLevel
			isNot = False
			methodParameters
			{
				value = Greater_Than
			}
			methodParameters
			{
				value = 5
			}
		}
	}
	ACTIONS
	{
		eventName = 
	}
	ELSE_ACTIONS
	{
		eventName = 
	}
}
	*/

class VTSGenerator {
	public nodeInfos: NodeInfo[] = [];
	public _consumedIds: number[] = [];
	private nextId: () => number;

	constructor(idGenerator: () => number, private vts: VTNode) {
		this.nextId = () => {
			const id = idGenerator();
			this._consumedIds.push(id);
			return id;
		};
	}

	@Track
	public sequence(name: string, forceId?: number) {
		const node = new VTNode<SequenceKeys>("SEQUENCE");
		node.setValue("id", forceId ?? this.nextId());
		node.setValue("sequenceName", name);
		node.setValue("whileLoop", false);
		node.setValue("startImmediately", false);

		const baseEvent = new VTNode<EventKeys>("EVENT");
		baseEvent.setValue("delay", 0);
		baseEvent.setValue("nodeName", "Base Event");
		node.addChild(baseEvent);

		const eventInfo = new VTNode<"eventName">("EventInfo");
		eventInfo.setValue("eventName", null);
		baseEvent.addChild(eventInfo);

		const parent = this.vts.getNode("EventSequences");
		parent.addChild(node);

		return node;
	}

	@Track
	public caSequence(name: string, forceId?: number) {
		const conditionalAction = new VTNode<ConditionalActionKeys>("ConditionalAction");
		conditionalAction.setValue("id", forceId ?? this.nextId());
		conditionalAction.setValue("name", null);

		const baseBlock = new VTNode<BaseBlockKeys>("BASE_BLOCK");
		baseBlock.setValue("blockName", name);
		baseBlock.setValue("{blockName}", name);
		baseBlock.setValue("blockId", this.nextId());
		conditionalAction.addChild(baseBlock);

		const conditional = this.chanceCond(100);
		baseBlock.addChild(conditional);

		const actionsBlock = new VTNode<"eventName">("ACTIONS");
		actionsBlock.setValue("eventName", null);
		baseBlock.addChild(actionsBlock);

		const elseActionsBlock = new VTNode<"eventName">("ELSE_ACTIONS");
		elseActionsBlock.setValue("eventName", null);
		baseBlock.addChild(elseActionsBlock);

		const parent = this.vts.getNode("ConditionalActions");
		parent.addChild(conditionalAction);

		return conditionalAction;
	}

	@Track
	public chanceCond(chance: number) {
		const condId = this.nextId();
		const cond = new VTNode<CompKeys>("COMP");
		cond.setValue("id", condId);
		cond.setValue("type", "SCCChance");
		cond.setValue("uiPos", { x: 0, y: 0, z: 0 });
		cond.setValue("chance", chance);

		const conditional = new VTNode<ConditionalKeys>("CONDITIONAL");
		conditional.setValue("id", this.nextId());
		conditional.setValue("outputNodePos", { x: 0, y: 0, z: 0 });
		conditional.setValue("root", condId);
		conditional.addChild(cond);

		return conditional;
	}

	@Track
	public fireConditionalAction(condId: number) {
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
	public conditionalAction(name: string, addToCaList = true) {
		const condAction = new VTNode<ConditionalActionKeys>("ConditionalAction");
		condAction.setValue("id", this.nextId());
		condAction.setValue("name", null);

		const baseBlock = new VTNode<BaseBlockKeys>("BASE_BLOCK");
		baseBlock.setValue("{blockName}", name);
		baseBlock.setValue("blockId", this.nextId());
		condAction.addChild(baseBlock);

		if (addToCaList) {
			const parent = this.vts.getNode("ConditionalActions");
			parent.addChild(condAction);
		}

		return condAction;
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
	public conditionalWithManyConditions(rootId: number, conds: VTNode<CompKeys>[]) {
		const conditional = new VTNode<ConditionalKeys>("CONDITIONAL");
		conditional.setValue("id", this.nextId());
		conditional.setValue("outputNodePos", { x: 0, y: 0, z: 0 });
		conditional.setValue("root", rootId);

		conds.forEach(cond => conditional.addChild(cond));

		return conditional;
	}

	@Track
	public gvSet(gv: number, value: number) {
		const eventTarget = new VTNode<EventTargetKeys>("EventTarget");
		eventTarget.setValue("targetType", "System");
		eventTarget.setValue("targetID", 2);
		eventTarget.setValue("eventName", "Set Value");
		eventTarget.setValue("methodName", "SetValue");

		const gvParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		gvParamInfo.setValue("type", "GlobalValue");
		gvParamInfo.setValue("value", gv);
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
	public gvCopy(from: number, to: number) {
		const eventTarget = new VTNode<EventTargetKeys>("EventTarget");
		eventTarget.setValue("targetType", "System");
		eventTarget.setValue("targetID", 2);
		eventTarget.setValue("eventName", "Copy Value");
		eventTarget.setValue("methodName", "CopyValue");

		const sourceParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		sourceParamInfo.setValue("type", "GlobalValue");
		sourceParamInfo.setValue("value", from);
		sourceParamInfo.setValue("name", "Source");
		eventTarget.addChild(sourceParamInfo);

		const destParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		destParamInfo.setValue("type", "GlobalValue");
		destParamInfo.setValue("value", to);
		destParamInfo.setValue("name", "Destination");
		eventTarget.addChild(destParamInfo);

		return eventTarget;
	}

	@Track
	public gvIncDec(gv: number, amount: number, type: "IncrementValue" | "DecrementValue") {
		const eventTarget = new VTNode<EventTargetKeys>("EventTarget");
		eventTarget.setValue("targetType", "System");
		eventTarget.setValue("targetID", 2);
		eventTarget.setValue("eventName", type);
		eventTarget.setValue("methodName", type);
		// eventInfo.addChild(eventTarget);

		const gvParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		gvParamInfo.setValue("type", "GlobalValue");
		gvParamInfo.setValue("value", gv);
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
	public gvMath(a: number, b: number, method: "AddValues" | "SubtractValues" | "MultiplyValues") {
		const eventTarget = new VTNode<EventTargetKeys>("EventTarget");
		eventTarget.setValue("targetType", "System");
		eventTarget.setValue("targetID", 2);
		eventTarget.setValue("eventName", method);
		eventTarget.setValue("methodName", method);

		const aParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		aParamInfo.setValue("type", "GlobalValue");
		aParamInfo.setValue("value", a);
		aParamInfo.setValue("name", "Source");
		eventTarget.addChild(aParamInfo);

		const bParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		bParamInfo.setValue("type", "GlobalValue");
		bParamInfo.setValue("value", b);
		bParamInfo.setValue("name", "Destination");
		eventTarget.addChild(bParamInfo);

		return eventTarget;
	}

	@Track
	public gvComp(gvName: number, value: number, comparison: "Equals" | "Greater_Than" | "Less_Than") {
		const comp = new VTNode<CompKeys>("COMP");
		comp.setValue("id", this.nextId());
		comp.setValue("type", "SCCGlobalValue");
		comp.setValue("uiPos", { x: 0, y: 0, z: 0 });
		comp.setValue("gv", gvName);
		comp.setValue("comparison", comparison);
		comp.setValue("c_value", value);

		return comp;
	}

	@Track
	public gvNotZero(gvName: number) {
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
	public compOr(conds: number[]) {
		const or = new VTNode<CompKeys>("COMP");
		or.setValue("id", this.nextId());
		or.setValue("type", "SCCOr");
		or.setValue("uiPos", { x: 0, y: 0, z: 0 });
		or.setValue("factors", conds);

		return or;
	}

	@Track
	public compAnd(conds: number[]) {
		const and = new VTNode<CompKeys>("COMP");
		and.setValue("id", this.nextId());
		and.setValue("type", "SCCAnd");
		and.setValue("uiPos", { x: 0, y: 0, z: 0 });
		and.setValue("factors", conds);

		return and;
	}

	@Track
	public gvGvComp(a: number, b: number, comparison: string) {
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
		comp.setValue("gvA", a);
		comp.setValue("gvB", b);
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
		if (ifTrueAction) actionBlock.addChild(ifTrueAction);
		bb.addChild(actionBlock);

		if (ifFalseAction) {
			const elseBlock = new VTNode<"eventName">("ELSE_ACTIONS");
			elseBlock.setValue("eventName", null);
			elseBlock.addChild(ifFalseAction);
			bb.addChild(elseBlock);
		}

		return this.fireConditionalAction(conditionalAction.getValue("id"));
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

	@Track
	public eventParent(condId: number) {
		const event = new VTNode<EventKeys>("EVENT");
		event.setValue("conditional", condId);
		event.setValue("delay", 0);
		event.setValue("nodeName", "Event");

		const eventInfo = new VTNode<"eventName">("EventInfo");
		eventInfo.setValue("eventName", null);
		event.addChild(eventInfo);

		return event;
	}

	@Track
	public exceptionObjective(name: string, gv: number) {
		const condition = this.conditionalWithCondition(this.gvComp(gv, 1, "Equals"));

		const objective = new VTNode<ObjectiveKeys>("Objective")
			.setValue("objectiveName", name)
			.setValue("objectiveInfo", name)
			.setValue("objectiveID", this.nextId())
			.setValue("orderID", 0)
			.setValue("required", true)
			.setValue("completionReward", 0)
			.setValue("waypoint", null)
			.setValue("autoSetWaypoint", false)
			.setValue("startMode", "Immediate")
			.setValue("objectiveType", "Conditional");

		const startEvent = new VTNode("startEvent");
		startEvent.addChild(new VTNode("EventInfo").setValue("eventName", "Start Event"));
		objective.addChild(startEvent);

		const failEvent = new VTNode("failEvent");
		failEvent.addChild(new VTNode("EventInfo").setValue("eventName", "Failed Event"));
		objective.addChild(failEvent);

		const completeEvent = new VTNode("completeEvent");
		completeEvent.addChild(new VTNode("EventInfo").setValue("eventName", "Completed Event"));
		objective.addChild(completeEvent);

		const fields = new VTNode<"successConditional" | "failConditional">("fields");
		fields.setValue("successConditional", null);
		fields.setValue("failConditional", condition.getValue("id"));
		objective.addChild(fields);

		const objectiveParent = this.vts.getNode("OBJECTIVES");
		objectiveParent.addChild(objective);

		const conditionalsParent = this.vts.getNode("Conditionals");
		conditionalsParent.addChild(condition);
	}

	@Track
	public displayMessage(message: string) {
		const eventTarget = new VTNode<EventTargetKeys>("EventTarget");
		eventTarget.setValue("targetType", "System");
		eventTarget.setValue("targetID", 1);
		eventTarget.setValue("eventName", "Display Message");
		eventTarget.setValue("methodName", "DisplayMessage");

		const messageParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		messageParamInfo.setValue("type", "System.String");
		messageParamInfo.setValue("value", message);
		messageParamInfo.setValue("name", "Text");
		eventTarget.addChild(messageParamInfo);

		const paramAtterInfo1 = new VTNode<ParamAttrInfoKeys>("ParamAttrInfo");
		paramAtterInfo1.setValue("type", "TextInputModes");
		paramAtterInfo1.setValue("data", "MultiLine");
		messageParamInfo.addChild(paramAtterInfo1);

		const paramAtterInfo2 = new VTNode<ParamAttrInfoKeys>("ParamAttrInfo");
		paramAtterInfo2.setValue("type", "System.Int32");
		paramAtterInfo2.setValue("data", message.length);
		messageParamInfo.addChild(paramAtterInfo2);

		const durationParamInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		durationParamInfo.setValue("type", "System.Single");
		durationParamInfo.setValue("value", 1);
		durationParamInfo.setValue("name", "Duration");
		eventTarget.addChild(durationParamInfo);

		const paramAtterInfo3 = new VTNode<ParamAttrInfoKeys>("ParamAttrInfo");
		paramAtterInfo3.setValue("type", "MinMax");
		paramAtterInfo3.setValue("data", "(0,9999)");
		durationParamInfo.addChild(paramAtterInfo3);

		return eventTarget;
	}

	@Track
	public unitMethod(klass: string, method: string, unitId: number, params: { name: string; type: string; value: VTValue }[]) {
		if (!(klass in classTypeMap)) throw new Error(`Class "${klass}" is not defined`);
		const eventTarget = new VTNode<EventTargetKeys | "altTargetIdx">("EventTarget");
		eventTarget.setValue("targetType", classTypeMap[klass]);
		eventTarget.setValue("targetID", unitId);
		eventTarget.setValue("eventName", method);
		eventTarget.setValue("methodName", method);
		eventTarget.setValue("altTargetIdx", -2);

		params.forEach(param => {
			const paramInfo = new VTNode<ParamInfoKeys>("ParamInfo");
			paramInfo.setValue("type", param.type);
			paramInfo.setValue("value", param.value);
			paramInfo.setValue("name", param.name);
			eventTarget.addChild(paramInfo);
		});

		return eventTarget;
	}

	@Track
	public unitComp(method: string, unitId: number, negated: boolean, params: VTValue[]) {
		const comp = new VTNode<CompKeys>("COMP");
		comp.setValue("id", this.nextId());
		comp.setValue("type", "SCCUnit");
		comp.setValue("uiPos", { x: 0, y: 0, z: 0 });
		comp.setValue("unit", unitId);
		comp.setValue("methodName", method);
		comp.setValue("methodParameters", null);
		comp.setValue("isNot", negated);

		params.forEach(param => {
			const methodParam = new VTNode("methodParameters");
			methodParam.setValue("value", param);
			comp.addChild(methodParam);
		});

		return comp;
	}

	@Track
	public paramInfo(type: string, value: VTValue, name: string) {
		const paramInfo = new VTNode<ParamInfoKeys>("ParamInfo");
		paramInfo.setValue("type", type);
		paramInfo.setValue("value", value);
		paramInfo.setValue("name", name);

		return paramInfo;
	}

	@Track
	public methodParameters(param: VTValue) {
		const methodParameters = new VTNode<"value">("methodParameters");
		methodParameters.setValue("value", param);

		return methodParameters;
	}
}

export { VTSGenerator, NodeInfo };

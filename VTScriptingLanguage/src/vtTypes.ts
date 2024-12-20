export type SequenceKeys = "id" | "sequenceName" | "whileLoop" | "startImmediately";
export type EventKeys = "delay" | "nodeName" | "conditional";
export type EventTargetKeys = "targetType" | "targetID" | "eventName" | "methodName";
export type ParamInfoKeys = "type" | "value" | "name";
export type ConditionalActionKeys = "id" | "name";
export type BaseBlockKeys = "{blockName}" | "blockId";
export type ConditionalKeys = "id" | "outputNodePos" | "root";
export type CompKeys =
	| "id"
	| "type"
	| "uiPos"
	| "gv"
	| "comparison"
	| "c_value"
	| "factors"
	| "unit"
	| "methodName"
	| "methodParameters"
	| "isNot"
	| "gvA"
	| "gvB";
export type GVKeys = "data";
export type ParamAttrInfoKeys = "type" | "data";
export type ObjectiveKeys =
	| "objectiveName"
	| "objectiveInfo"
	| "objectiveID"
	| "orderID"
	| "required"
	| "completionReward"
	| "waypoint"
	| "autoSetWaypoint"
	| "startMode"
	| "objectiveType";

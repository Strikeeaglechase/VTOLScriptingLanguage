import { VTNode } from "../vtsParser.js";
import { varIds } from "./compiler.js";

interface CompilerOwnedNodeList {
	objectives: number[];
	conditionals: number[];
	sequences: number[];
	conditionalActions: number[];
	gvs: number[];
}

function diffNodes(orgVts: VTNode, resultVts: VTNode, nodeName: string, idProp: string): number[] {
	const orgNodes = orgVts.getAllChildrenWithName(nodeName);
	const resultNodes = resultVts.getAllChildrenWithName(nodeName);

	const orgNodeIds = orgNodes.map(n => n.getValue<string, number>(idProp));
	const resultNodeIds = resultNodes.map(n => n.getValue<string, number>(idProp));

	const nodes = resultNodeIds.filter(id => !orgNodeIds.includes(id));
	return nodes;
}

function diffGvs(orgVts: VTNode, resultVts: VTNode): number[] {
	const orgGvs = orgVts.getAllChildrenWithName("gv");
	const resultGvs = resultVts.getAllChildrenWithName("gv");

	const orgGvIds = orgGvs.map(n => n.getValue("data")[0]);
	const resultGvIds = resultGvs.map(n => n.getValue("data")[0]);

	const gvs = resultGvIds.filter(id => !orgGvIds.includes(id));
	return gvs;
}

function generateCompilerOwnedNodeList(orgVts: VTNode, resultVts: VTNode): CompilerOwnedNodeList {
	const objectives = diffNodes(orgVts, resultVts, "Objective", "objectiveID");
	const conditionals = diffNodes(orgVts, resultVts, "CONDITIONAL", "id");
	const sequences = diffNodes(orgVts, resultVts, "SEQUENCE", "id");
	const conditionalActions = diffNodes(orgVts, resultVts, "ConditionalAction", "id");
	const gvs = diffGvs(orgVts, resultVts);

	return { objectives, conditionals, sequences, conditionalActions, gvs };
}

export function encodeCompilerOwnedInformation(orgVts: VTNode, resultVts: VTNode) {
	const info = generateCompilerOwnedNodeList(orgVts, resultVts);
	const gvs = resultVts.getAllChildrenWithName("gv");
	const resultGv = gvs.find(gv => gv.getValue("data")[0] == varIds.result);

	const data = resultGv.getValue("data");
	const b64Info = Buffer.from(JSON.stringify(info)).toString("base64");
	data[2] = b64Info;
	resultGv.setValue("data", data, true);
}

function deleteNodes(vts: VTNode, nodeName: string, idProp: string, ids: number[]) {
	const parent = vts.getNode(nodeName);
	// console.log(nodeName, ids);
	parent.children = parent.children.filter(child => !ids.includes(child.getValue<string, number>(idProp)));
	// console.log(parent.children.map(child => child.getValue<string, number>(idProp)));
}

function deleteGvs(vts: VTNode, ids: number[]) {
	const gvContainer = vts.getNode("GlobalValues");
	gvContainer.children = gvContainer.children.filter(child => !ids.includes(child.getValue("data")[0]));
}

export function deleteCompilerNodes(vts: VTNode) {
	const gvs = vts.getAllChildrenWithName("gv");
	const resultGv = gvs.find(gv => gv.getValue("data")[0] == varIds.result);
	if (!resultGv) return;

	try {
		const b64Info = resultGv.getValue("data")[2];
		const info: CompilerOwnedNodeList = JSON.parse(Buffer.from(b64Info, "base64").toString("utf-8"));
		deleteNodes(vts, "OBJECTIVES", "objectiveID", info.objectives);
		deleteNodes(vts, "OBJECTIVES_OPFOR", "objectiveID", info.objectives);
		deleteNodes(vts, "Conditionals", "id", info.conditionals);
		deleteNodes(vts, "EventSequences", "id", info.sequences);
		deleteNodes(vts, "ConditionalActions", "id", info.conditionalActions);
		deleteGvs(vts, info.gvs);
	} catch (e) {
		console.log(`Unable to delete old compiler nodes because: ${e.message}`);
	}
}

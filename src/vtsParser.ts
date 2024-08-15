import fs from "fs";

interface Vector3 {
	x: number;
	y: number;
	z: number;
}
type VTValue = string | number | boolean | Vector3 | VTValue[];

class VTNode<T extends string = string> {
	public name: string;
	public values: Record<T, VTValue> = {} as Record<T, VTValue>;
	public children: VTNode[] = [];

	constructor(name: string) {
		this.name = name;
	}

	public getValue<K extends T, Res extends VTValue>(key: K) {
		return this.values[key] as Res;
	}

	public setValue<K extends T>(key: K, value: VTValue) {
		this.values[key] = value;
	}

	public getNode<T extends string>(name: string): VTNode<T> {
		return this.children.find(child => child.name === name);
	}

	public addChild(child: VTNode) {
		this.children.push(child);
	}

	public getChildrenWithName(name: string) {
		return this.children.filter(child => child.name === name);
	}

	public getAllChildren(): VTNode[] {
		const children = this.children.map(child => {
			let result = child.getAllChildren();
			result.push(child);
			return result;
		});

		return children.flat();
	}

	public getAllChildrenWithName<T extends string>(name: string): VTNode<T>[] {
		return this.getAllChildren().filter(child => child.name === name) as VTNode<T>[];
	}

	public findChildWithName(name: string) {
		return this.getAllChildren().find(child => child.name === name);
	}
}

function parseVTValue(value: string): VTValue {
	if (value.length == 0) return null;
	if (value == "null") return null;
	if (value == "True") return true;
	if (value == "False") return false;
	if (/^[-\d.E]+$/.test(value)) return parseFloat(value);
	if (/^\([-\d.E]+, [-\d.E]+, [-\d.E]+\)$/g.test(value)) {
		const [x, y, z] = value.replace("(", "").replace(")", "").split(", ").map(parseFloat);
		return { x, y, z };
	}
	if (value.includes(";")) {
		return value.split(";").map(parseVTValue).slice(0, -1);
	}
	return value;
}

function processValueLine(line: string) {
	// const [key, value] = line.split("=");
	const eqIdx = line.indexOf("=");
	const key = line.slice(0, eqIdx);
	const value = line.slice(eqIdx + 1);
	return {
		key: key.trim(),
		value: parseVTValue(value.trim())
	};
}

function readVtsFile(content: string) {
	const cleaned = content
		.split("\n")
		.map(l => l.trim())
		.filter(l => l.length > 0);

	let idx = 0;

	const readLine = () => cleaned[idx++];
	const peakLine = () => cleaned[idx];
	const eof = () => idx >= cleaned.length;

	function readNode() {
		const node = new VTNode(readLine());
		readLine();
		while (!eof() && peakLine().includes("=")) {
			const { key, value } = processValueLine(readLine());
			node.values[key] = value;
		}

		while (!eof() && !peakLine().startsWith("}")) {
			node.addChild(readNode());
		}

		const r = readLine();
		return node;
	}

	return readNode();
}

function _writeVtsFile(node: VTNode) {
	const content = [node.name, "{"];
	for (const [key, value] of Object.entries(node.values)) {
		let result = value;
		if (Array.isArray(value)) result = value.join(";") + ";";
		else if (value && typeof value === "object") result = `(${value.x}, ${value.y}, ${value.z})`;

		if (result === true) result = "True";
		if (result === false) result = "False";

		content.push(`\t${key} = ${result}`);
	}

	for (const child of node.children) {
		const childContent = _writeVtsFile(child).map(l => `\t${l}`);
		content.push(...childContent);
	}

	content.push("}");

	return content;
}

function writeVtsFile(node: VTNode) {
	return _writeVtsFile(node).join("\n");
}

export { readVtsFile, writeVtsFile, VTNode, VTValue };

if (false) {
	const file = fs.readFileSync(
		"C:/Program Files (x86)/Steam/steamapps/common/VTOL VR/CustomScenarios/Campaigns/chaseFeetPics/snippet1_2024-08-05/snippet1_2024-08-05.vts",
		"utf-8"
	);
	const node = readVtsFile(file);
	const result = writeVtsFile(node);

	fs.writeFileSync("../vts.json", JSON.stringify(node, null, 3));
	fs.writeFileSync("../vts.vts", result);
}

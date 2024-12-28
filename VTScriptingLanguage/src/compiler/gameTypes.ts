import fs from "fs";

export interface Method {
	name: string;
	decorator: string;
	returnType: string;
	args: { name: string; type: string }[];
}

export interface ClassInfo {
	name: string;
	methods: Method[];
}

export interface EnumInfo {
	name: string;
	values: { key: string; value: string }[];
}

let types: { classes: ClassInfo[]; enums: EnumInfo[] };

export function loadGameTypes() {
	if (!types) {
		const gTypes = fs.readFileSync("../../classInfo.json", "utf-8");
		types = JSON.parse(gTypes) as { classes: ClassInfo[]; enums: EnumInfo[] };
	}

	return types;
}

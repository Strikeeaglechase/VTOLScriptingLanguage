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

export function loadGameTypes() {
	const types = fs.readFileSync("../../classInfo.json", "utf-8");
	return JSON.parse(types) as { classes: ClassInfo[]; enums: EnumInfo[] };
}

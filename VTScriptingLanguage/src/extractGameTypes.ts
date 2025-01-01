import fs from "fs";
import { EnumInfo, Method, ClassInfo } from "./compiler/gameTypes.js";
const source = fs.readFileSync("../../GameSource.cs", "utf-8").replaceAll("\r", ""); //.split("\r\n").join("\n");

function processMethod(match: RegExpMatchArray): Method {
	const [_, fullDecorator, returnType, name, argList] = match;

	const args: { name: string; type: string }[] = [];
	if (argList.trim().length > 0) {
		const argsMatch = [...argList.matchAll(/(?:\[.+?\] )?(\w+) (\w+)/g)];

		argsMatch.forEach(m => {
			const [_, type, name] = m;
			args.push({ name, type });
		});
	}

	const decorator = fullDecorator ? fullDecorator.trim().match(/\[(\w+)\(/)[1] : null;

	return { name, decorator, returnType, args };
}

function countInstances(str: string, char: string) {
	let count = 0;
	for (let i = 0; i < str.length; i++) {
		if (str[i] === char) count++;
	}

	return count;
}

function extractClasses() {
	const classInfos: ClassInfo[] = [];

	function resolveInheritanceChain(klass: string): string {
		const inheres = classes
			.find(c => c.name === klass)
			?.inheres?.trim()
			?.split(", ");

		if (!inheres) return klass;
		const rest = resolveInheritanceChain(inheres[0]);
		return `${klass} <- ${rest}`;
	}

	function processClass(className: string) {
		const existing = classInfos.find(r => r.name == className);
		if (existing) return existing;
		const klass = classes.find(c => c.name == className);

		const rawMethods = [...klass.body.matchAll(/(\[(?:VTEvent|SCCUnitProperty)\(.+\)\]\s*)?public (\w+) ([\w\d]+)\(((?:(?:\[.+\])?[\w\d ,])*)\)/g)];
		const methods = rawMethods.map(c => processMethod(c));

		const info: ClassInfo = { name: klass.name, methods };

		const inheritanceChain = resolveInheritanceChain(klass.name).split(" <- ").slice(1, -1);
		inheritanceChain.forEach(parentClass => {
			const parentInfo = processClass(parentClass);
			parentInfo.methods.forEach(m => {
				if (!info.methods.some(im => im.name === m.name)) info.methods.push(m);
			});
		});

		classInfos.push(info);

		return info;
	}

	function extractRawClasses() {
		const lines = source.split("\n");
		// const resolvedClasses: { depth: number; content: string; resolvedLines: string[] }[] = [];
		const classHeaders = [...source.matchAll(/public class [\w\d]+/g)].map(c => c[0]);
		const classes: string[] = [];
		classHeaders.forEach(c => {
			const startLine = lines.findIndex(l => l.includes(c));
			let curDepth = 0;
			let currentLine = startLine + 1;
			const resolvedLines: string[] = [];
			do {
				const line = lines[currentLine];
				curDepth += countInstances(line, "{");
				curDepth -= countInstances(line, "}");
				if (curDepth == 1) resolvedLines.push(line);
				currentLine++;
			} while (curDepth > 0);

			classes.push(lines[startLine] + "\n" + resolvedLines.join("\n"));
		});

		return classes;
	}

	const rawClasses = extractRawClasses();

	// const rawClasses = [...source.matchAll(/(?:public|private) class ([\w\d]+)(?: :((?: [\w\d]+,?)+))?\n{([\w\d\s\W\D\S]+?)\n}/g)];
	const classes = rawClasses.map(c => {
		const [_, name, inheres] = c.match(/(?:public|private) class ([\w\d]+)(?: :((?: [\w\d]+,?)+))?/);
		const body = c.split("\n").slice(1).join("\n");
		return { name, inheres, body };
	});
	const condClasses = classes.filter(c => c.body.includes("[SCCUnitProperty") || c.body.includes("[VTEvent"));
	console.log(`Found ${condClasses.length} classes with SCCUnitProperty`);

	condClasses.forEach(c => processClass(c.name));

	return classInfos;
}

function extractEnums() {
	const enumMatch = [...source.matchAll(/public enum ([\w\d]+)\n\s*{([\w\d\s\W\D\S]+?)}/g)];
	const enums = enumMatch.map(e => {
		const [_, name, body] = e;
		const values = [...body.matchAll(/([\d\w]+)(?: = ([\w\d]+))?/g)].map((v, idx) => {
			let [_, key, value] = v;
			if (!value) value = idx.toString();
			return { key, value };
		});
		return { name, values };
	});

	return enums;
}

const classInfos = extractClasses();
const enumsInfos = extractEnums();
const relevantEnumInfos: EnumInfo[] = [];

const argTypes: Set<string> = new Set();
const sOfficialArgTypes: Set<string> = new Set();
classInfos.forEach(c => {
	c.methods.forEach(methodInfo => {
		// if (methodInfo.decorator) console.log(methodInfo.decorator);
		methodInfo.args.forEach(arg => {
			argTypes.add(arg.type);
			if (methodInfo.decorator) sOfficialArgTypes.add(arg.type);
		});
	});
});

const officialArgTypes = [...sOfficialArgTypes];
officialArgTypes.forEach(t => {
	const enumInfo = enumsInfos.find(e => e.name === t);
	if (enumInfo) {
		relevantEnumInfos.push(enumInfo);
		// console.log(`Enum ${t}: ${enumInfo.values.map(v => `${v.key} = ${v.value}`).join(", ")}`);
	}
});

console.log(classInfos.map(e => e.name));

// Argument types: int, Actor,  UnitSpawner, ConfigNode, GameObject Vector3D, PhoneticLetters, string
// Official argument types: CardinalDirections, FollowPath, InOrOut, bool, UnitReferenceListOtherSubs, Teams, UnitReferenceList, PlayerCommandsModes, FormationDistances, Waypoint, float, FlightStartModes, TargetingMethods, SCCPlayerSensors, FixedPoint
fs.writeFileSync("../../classInfo.json", JSON.stringify({ classes: classInfos, enums: relevantEnumInfos }, null, 2));

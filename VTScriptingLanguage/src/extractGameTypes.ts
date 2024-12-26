import fs from "fs";
const source = fs.readFileSync("../../GameSource.cs", "utf-8").replaceAll("\r", ""); //.split("\r\n").join("\n");
const rawClasses = [...source.matchAll(/(?:public|private) class ([\w\d]+)(?: :((?: [\w\d]+,?)+))?\n{([\w\d\s\W\D\S]+?)\n}/g)];
const classes = rawClasses.map(c => {
	const [_, name, inheres, body] = c;
	return { name, inheres, body };
});
const condClasses = classes.filter(c => c.body.includes("[SCCUnitProperty"));
console.log(`Found ${condClasses.length} classes with SCCUnitProperty`);

const enumMatch = [...source.matchAll(/public enum [\w\d]+\n{[\w\d\s\W\D\S]+}/g)];
const enums = enumMatch.map(e => {
	const [_, body] = e;
	if (!body) console.log(e);
	const name = body.match(/public enum ([\w\d]+)/)[1];
	const values = [...body.matchAll(/\t([\w]+),?/g)].map(v => v[1]);
	return { name, values };
});

console.log(`Found ${enums.length} enums`);

function resolveInheritanceChain(klass: string): string {
	const inheres = classes
		.find(c => c.name === klass)
		?.inheres?.trim()
		?.split(", ");

	if (!inheres) return klass;
	const rest = resolveInheritanceChain(inheres[0]);
	return `${klass} <- ${rest}`;
}

interface Method {
	name: string;
	decorator: string;
	returnType: string;
	args: { name: string; type: string }[];
}

interface ClassInfo {
	name: string;
	methods: Method[];
}

const result: ClassInfo[] = [];

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

function processClass(className: string) {
	const existing = result.find(r => r.name == className);
	if (existing) return existing;
	const klass = classes.find(c => c.name == className);

	const rawMethods = [...klass.body.matchAll(/(\[(?:VTEvent|SCCUnitProperty)\(.+\)\]\s*)?public (\w+) ([\w\d]+)\(((?:(?:\[.+\])?[\w\d ,])*)\)/g)];
	const methods = rawMethods.map(c => processMethod(c));

	const info: ClassInfo = { name: klass.name, methods };

	const inheritanceChain = resolveInheritanceChain(klass.name).split(" <- ").slice(1, -1);
	inheritanceChain.forEach(parentClass => {
		const parentInfo = processClass(parentClass);
		info.methods.push(...parentInfo.methods);
	});

	result.push(info);

	return info;
}

condClasses.forEach(c => processClass(c.name));
fs.writeFileSync("../debug/classInfo.json", JSON.stringify(result, null, 2));

const argTypes: Set<string> = new Set();
const officialArgTypes: Set<string> = new Set();
result.forEach(c => {
	c.methods.forEach(methodInfo => {
		// if (methodInfo.decorator) console.log(methodInfo.decorator);
		methodInfo.args.forEach(arg => {
			argTypes.add(arg.type);
			if (methodInfo.decorator) officialArgTypes.add(arg.type);
		});
	});
});

// console.log(`Argument types: ${[...argTypes].join(", ")}`);
console.log(`Official argument types: ${[...officialArgTypes].join(", ")}`);
const unofficialArgTypes = [...argTypes].filter(t => !officialArgTypes.has(t));
console.log(`Unofficial argument types: ${unofficialArgTypes.join(", ")}`);

// Argument types: int, Actor,  UnitSpawner, ConfigNode, GameObject Vector3D, PhoneticLetters, string
// Official argument types: CardinalDirections, FollowPath, InOrOut, bool, UnitReferenceListOtherSubs, Teams, UnitReferenceList, PlayerCommandsModes, FormationDistances, Waypoint, float, FlightStartModes, TargetingMethods, SCCPlayerSensors, FixedPoint

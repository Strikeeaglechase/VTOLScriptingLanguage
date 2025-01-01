import { AST } from "../parser/ast.js";
import { VTNode, VTValue } from "../vtsParser.js";
import { Context } from "./context.js";
import { loadGameTypes } from "./gameTypes.js";
import { VTSGenerator } from "./vtsGenerator.js";

export function convertAstToMethodParameters(ast: AST.AnyAST): VTValue {
	let value: VTValue;
	switch (ast.type) {
		case AST.Type.Literal:
		case AST.Type.VectorLiteral:
			value = ast.value;
			break;

		default:
			throw new Error(`Unhandled AST type "${ast.type}" for convertAstToMethodParameters`);
	}

	return value;
}

function guardEnum(name: string, ast: AST.AnyAST): ast is AST.PropertyAccess {
	if (ast.type != AST.Type.PropertyAccess) throw new Error(`Expected enum "${name}", got "${ast.type}"`);
	if (ast.target.value != name) throw new Error(`Expected "${name}", got "${ast.target.value}"`);
	const gameEnum = loadGameTypes().enums.find(e => e.name == name);
	if (!gameEnum.values.some(v => v.key == ast.property.value))
		throw new Error(`Invalid ${name} value "${ast.property.value}", expected one of ${gameEnum.values.map(v => v.key).join(", ")}`);

	return true;
}

const enumTypes: { methodType: string; gameType?: string }[] = [
	{ methodType: "MoveSpeeds", gameType: "GroundUnitSpawn+MoveSpeeds" },
	{ methodType: "CardinalDirections" },
	{ methodType: "Teams" },
	{ methodType: "InOrOut", gameType: "UnitSpawn+InOrOut" },
	{ methodType: "PlayerCommandsModes", gameType: "AIAircraftSpawn+PlayerCommandModes" },
	{ methodType: "FormationDistances", gameType: "AIAircraftSpawn+FormationDistances" },
	{ methodType: "FlightStartModes", gameType: "PlayerSpawn+FlightStartModes" },
	{ methodType: "TargetingMethods", gameType: "PlayerSpawn+TargetingMethods" },
	{ methodType: "SCCPlayerSensors", gameType: "PlayerSpawn+SCCPlayerSensors" }
];
// Official argument types: CardinalDirections, FollowPath, InOrOut, bool, UnitReferenceListOtherSubs, Teams, UnitReferenceList, PlayerCommandsModes, FormationDistances, Waypoint, float, FlightStartModes, TargetingMethods, SCCPlayerSensors, FixedPoint
// Unimplemented: FollowPath, UnitReferenceListOtherSubs, UnitReferenceList, Waypoint
export function convertAstToParamInfo(context: Context, ast: AST.AnyAST, paramInfo: { type: string; name: string }) {
	let value: VTValue;
	let type: string;
	switch (paramInfo.type) {
		case "float":
			if (ast.type != AST.Type.Literal || typeof ast.value != "number") throw new Error(`Expected number, got ${ast.type}`);
			value = ast.value;
			type = "System.Single";
			break;

		case "int":
			if (ast.type != AST.Type.Literal || typeof ast.value != "number") throw new Error(`Expected number, got ${ast.type}`);
			value = ast.value;
			type = "System.Int32";
			break;

		case "bool":
			if (ast.type != AST.Type.Literal || typeof ast.value != "boolean") throw new Error(`Expected boolean, got ${ast.type}`);
			value = ast.value;
			type = "System.Boolean";
			break;

		case "string":
			if (ast.type != AST.Type.Literal || typeof ast.value != "string") throw new Error(`Expected string, got ${ast.type}`);
			value = ast.value;
			type = "System.String";
			break;

		case "FixedPoint":
			if (ast.type != AST.Type.VectorLiteral) throw new Error(`Expected vector literal, got ${ast.type}`);
			value = ast.value;
			type = "FixedPoint";
			break;

		case "GlobalValue":
			if (ast.type != AST.Type.VariableReference) throw new Error(`Expected global variable reference, got ${ast.type}`);
			const gv = context.getGV(ast.name.value);
			value = gv.id;
			type = "GlobalValue";
			break;

		default:
			const enumType = enumTypes.find(e => e.methodType == paramInfo.type);
			if (enumType) {
				if (!guardEnum(enumType.methodType, ast)) return;
				value = ast.property.value;
				type = enumType.gameType ?? enumType.methodType;
				break;
			}

			throw new Error(`Unhandled targetType "${paramInfo.type}" for convertAstToParamInfo`);
	}

	return {
		type,
		value,
		name: paramInfo.name
	};
}

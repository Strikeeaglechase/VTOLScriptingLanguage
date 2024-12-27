import { AST } from "../parser/ast.js";
import { VTSGenerator } from "./vtsGenerator.js";
// If method has return time must use conditional action with COND and return
// If no return type just call typically
// Conditional actions use methodParameters not ParamInfo
function convertIntArg(gen: VTSGenerator, arg: AST.AnyAST) {
	if (arg.type != AST.Type.LiteralNumber) {
		throw new Error(`Expected number, got ${AST.Type[arg.type]}`);
	}

	// return gen.paramInfo("System.Single", arg.value.toString());
}

//System.Boolean
/*
type = FixedPoint
value = (13912.427619934082, 51.90863037109375, 10158.455413818359)
*/
/*
			COMP
			{
				id = 0
				type = SCCUnit
				uiPos = (-344.6971, 93.82874, 0)
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
			*/

/* 
			EventTarget
					{
						targetType = Unit
						targetID = 1
						eventName = Set Movement Speed
						methodName = SetMovementSpeed
						altTargetIdx = -2
						ParamInfo
						{
							type = GroundUnitSpawn+MoveSpeeds
							value = Fast_30
							name = Speed
						}
					}*/

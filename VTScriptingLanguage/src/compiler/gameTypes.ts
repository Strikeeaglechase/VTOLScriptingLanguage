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

// let types: { classes: ClassInfo[]; enums: EnumInfo[] };

export function loadGameTypes() {
	// if (!types) {
	// 	const gTypes = fs.readFileSync("../../classInfo.json", "utf-8");
	// 	types = JSON.parse(gTypes) as { classes: ClassInfo[]; enums: EnumInfo[] };
	// }

	return types;
}

const types = {
	classes: [
		{
			name: "UnitSpawn",
			methods: [
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "AIUnitSpawn",
			methods: [
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "AIUnitSpawnEquippable",
			methods: [
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "AIAircraftSpawn",
			methods: [
				{
					name: "PassesFilter",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "uSpawner",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "IsWingmanVoice",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SetPlayerCommands",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "mode",
							type: "PlayerCommandsModes"
						}
					]
				},
				{
					name: "US_HasRadar",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "US_HasEwar",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SetPath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "TaxiPath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "TaxiPathSpeed",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						},
						{
							name: "speed",
							type: "float"
						}
					]
				},
				{
					name: "SetOrbitNow",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						},
						{
							name: "alt",
							type: "float"
						}
					]
				},
				{
					name: "SetNavSpeed",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "speed",
							type: "float"
						}
					]
				},
				{
					name: "SetAltitude",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "alt",
							type: "float"
						}
					]
				},
				{
					name: "FormOnPilot",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						}
					]
				},
				{
					name: "RefuelWithUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "fuelerUnit",
							type: "UnitReference"
						}
					]
				},
				{
					name: "TakeOff",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetFormationDistance",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "dist",
							type: "FormationDistances"
						}
					]
				},
				{
					name: "Land",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "airport",
							type: "AirportReference"
						}
					]
				},
				{
					name: "LandAtWpt",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						}
					]
				},
				{
					name: "LandAtWptHdg",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "inHeading",
							type: "float"
						}
					]
				},
				{
					name: "LandAtWptHdgFcg",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "inHeading",
							type: "float"
						},
						{
							name: "landFacing",
							type: "float"
						}
					]
				},
				{
					name: "RearmAt",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "airport",
							type: "AirportReference"
						}
					]
				},
				{
					name: "AttackTarget",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "tgt",
							type: "UnitReference"
						}
					]
				},
				{
					name: "CancelAttackTarget",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetRadioComms",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "radioEnabled",
							type: "bool"
						}
					]
				},
				{
					name: "AddDesignatedTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "SetDesignatedTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearDesignatedTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "RemoveDesignatedTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "SetToLasingMode",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "laserCode",
							type: "float"
						}
					]
				},
				{
					name: "LaseTarget",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						},
						{
							name: "laserCode",
							type: "float"
						}
					]
				},
				{
					name: "LaseTargetOrbit",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						},
						{
							name: "laserCode",
							type: "float"
						},
						{
							name: "orbitWp",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						},
						{
							name: "alt",
							type: "float"
						}
					]
				},
				{
					name: "CountermeasureProgram",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "flares",
							type: "bool"
						},
						{
							name: "chaff",
							type: "bool"
						},
						{
							name: "count",
							type: "float"
						},
						{
							name: "interval",
							type: "float"
						}
					]
				},
				{
					name: "HasPassengerBay",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "BombWaypoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "hdg",
							type: "float"
						},
						{
							name: "count",
							type: "float"
						},
						{
							name: "altitude",
							type: "float"
						}
					]
				},
				{
					name: "SetRadar",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "radarOn",
							type: "bool"
						}
					]
				},
				{
					name: "SetJammingAtWill",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "j",
							type: "bool"
						}
					]
				},
				{
					name: "CommandRTB",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "UnloadAllPassengers",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "rallyWp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "LoadPassengers",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListSame"
						}
					]
				},
				{
					name: "SC_FuelPercent",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SC_IsLanded",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "GetMaximumPassengers",
					decorator: null,
					returnType: "int",
					args: []
				},
				{
					name: "GetSeatTransform",
					decorator: null,
					returnType: "Transform",
					args: [
						{
							name: "seatIdx",
							type: "int"
						}
					]
				},
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "AISeaUnitSpawn",
			methods: [
				{
					name: "HasHullNumber",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MovePath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "Stop",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "AICarrierSpawn",
			methods: [
				{
					name: "RegisterVTOLTakeoffUnit",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "UnregisterVTOLTakeoffUnit",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsVTOLTakeoffAuthorized",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "DetachUnit",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "spawner",
							type: "UnitSpawner"
						},
						{
							name: "altIdx",
							type: "int"
						}
					]
				},
				{
					name: "GetAirport",
					decorator: null,
					returnType: "AirportManager",
					args: []
				},
				{
					name: "GetRTBWaypoint",
					decorator: null,
					returnType: "Transform",
					args: []
				},
				{
					name: "GetRefuelWaypoint",
					decorator: null,
					returnType: "Transform",
					args: []
				},
				{
					name: "LaunchAllAircraft",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsAuthorizedForTakeoff",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "RegisterAITakeoffRequest",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "s",
							type: "AIAircraftSpawn"
						}
					]
				},
				{
					name: "CancelPlayerTakeOff",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "RegisterPlayerTakeoffRequest",
					decorator: null,
					returnType: "CarrierCatapult",
					args: []
				},
				{
					name: "EditorGetCatsFromPathsEditor",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "BeginLandingMode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "pilot",
							type: "AIPilot"
						}
					]
				},
				{
					name: "FinishLanding",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "pilot",
							type: "AIPilot"
						}
					]
				},
				{
					name: "HasHullNumber",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MovePath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "Stop",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "AIDroneCarrierSpawn",
			methods: [
				{
					name: "LaunchDrones",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "HasHullNumber",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MovePath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "Stop",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "GroundUnitSpawn",
			methods: [
				{
					name: "PassesFilter",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "uSpawner",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "UnitCanMove",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "GroundUnitIsVehicle",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "IsOptionalStopToEngage",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SetMovementSpeed",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "MoveSpeeds"
						}
					]
				},
				{
					name: "SetPath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "ParkNow",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MoveToPoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						}
					]
				},
				{
					name: "BoardAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						}
					]
				},
				{
					name: "DismountAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "CanLoadPassengerBay",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "AIFixedSAMSpawn",
			methods: [
				{
					name: "PassesFilter",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "spawner",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "ReloadNow",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetAllowReload",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "allowed",
							type: "bool"
						}
					]
				},
				{
					name: "SetReloadTime",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "time",
							type: "float"
						}
					]
				},
				{
					name: "HasHOJ",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "UnitCanMove",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "GroundUnitIsVehicle",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "IsOptionalStopToEngage",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SetMovementSpeed",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "MoveSpeeds"
						}
					]
				},
				{
					name: "SetPath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "ParkNow",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MoveToPoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						}
					]
				},
				{
					name: "BoardAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						}
					]
				},
				{
					name: "DismountAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "CanLoadPassengerBay",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "AIGroundECMSpawn",
			methods: [
				{
					name: "VT_AutoMode",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "VT_AutoTargetBand",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "band",
							type: "EMBandOptions"
						}
					]
				},
				{
					name: "VT_ManualTarget",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						},
						{
							name: "band",
							type: "EMBandOptions"
						}
					]
				},
				{
					name: "VT_ManualDirection",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "bearing",
							type: "float"
						},
						{
							name: "elevation",
							type: "float"
						},
						{
							name: "band",
							type: "EMBandOptions"
						}
					]
				},
				{
					name: "PassesFilter",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "uSpawner",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "UnitCanMove",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "GroundUnitIsVehicle",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "IsOptionalStopToEngage",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SetMovementSpeed",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "MoveSpeeds"
						}
					]
				},
				{
					name: "SetPath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "ParkNow",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MoveToPoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						}
					]
				},
				{
					name: "BoardAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						}
					]
				},
				{
					name: "DismountAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "CanLoadPassengerBay",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "AIJTACSpawn",
			methods: [
				{
					name: "JTACLasePosition",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "laserCode",
							type: "float"
						},
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "marker",
							type: "bool"
						}
					]
				},
				{
					name: "JTACLaseWaypoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "laserCode",
							type: "float"
						},
						{
							name: "wp",
							type: "Waypoint"
						},
						{
							name: "marker",
							type: "bool"
						}
					]
				},
				{
					name: "JTACLaseUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "laserCode",
							type: "float"
						},
						{
							name: "unit",
							type: "UnitReference"
						},
						{
							name: "marker",
							type: "bool"
						}
					]
				},
				{
					name: "JTACLaseUnits",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "laserCode",
							type: "float"
						},
						{
							name: "targets",
							type: "UnitReferenceListSubs"
						},
						{
							name: "marker",
							type: "bool"
						}
					]
				},
				{
					name: "StopJTACLaser",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "PassesFilter",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "uSpawner",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "UnitCanMove",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "GroundUnitIsVehicle",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "IsOptionalStopToEngage",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SetMovementSpeed",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "MoveSpeeds"
						}
					]
				},
				{
					name: "SetPath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "ParkNow",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MoveToPoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						}
					]
				},
				{
					name: "BoardAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						}
					]
				},
				{
					name: "DismountAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "CanLoadPassengerBay",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "AIMissileSilo",
			methods: [
				{
					name: "VT_BeginLaunch",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "countdownTime",
							type: "float"
						},
						{
							name: "turnDir",
							type: "float"
						}
					]
				},
				{
					name: "SC_CountdownStarted",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_MissileLaunched",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_MissileDestroyed",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_MissileEscaped",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "OnQuicksave",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "qsNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "OnQuickload",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "qsNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "RemoteResume",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "countdownTime",
							type: "float"
						},
						{
							name: "countdownCurrT",
							type: "float"
						},
						{
							name: "prepareT",
							type: "float"
						}
					]
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "AITestUnitSpawn",
			methods: [
				{
					name: "RunTest",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "APCUnitSpawn",
			methods: [
				{
					name: "PassesFilter",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "uSpawner",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "HasPassengerBay",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "UnloadAllPassengers",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "rallyWp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "LoadPassengers",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListSame"
						}
					]
				},
				{
					name: "GetMaximumPassengers",
					decorator: null,
					returnType: "int",
					args: []
				},
				{
					name: "GetSeatTransform",
					decorator: null,
					returnType: "Transform",
					args: [
						{
							name: "seatIdx",
							type: "int"
						}
					]
				},
				{
					name: "UnitCanMove",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "GroundUnitIsVehicle",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "IsOptionalStopToEngage",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SetMovementSpeed",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "MoveSpeeds"
						}
					]
				},
				{
					name: "SetPath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "ParkNow",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MoveToPoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						}
					]
				},
				{
					name: "BoardAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						}
					]
				},
				{
					name: "DismountAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "CanLoadPassengerBay",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "ArtilleryUnitSpawn",
			methods: [
				{
					name: "PassesFilter",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "uSpawner",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "FireOnWaypoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "count",
							type: "float"
						}
					]
				},
				{
					name: "FireMultiOnWaypoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "shotsPerSalvo",
							type: "float"
						},
						{
							name: "salvos",
							type: "float"
						}
					]
				},
				{
					name: "FireMultiOnWaypointRadius",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						},
						{
							name: "shotsPerSalvo",
							type: "float"
						},
						{
							name: "salvos",
							type: "float"
						}
					]
				},
				{
					name: "FireOnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						},
						{
							name: "shotsPerSalvo",
							type: "float"
						},
						{
							name: "salvos",
							type: "float"
						}
					]
				},
				{
					name: "ClearFireOrders",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "UnitCanMove",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "GroundUnitIsVehicle",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "IsOptionalStopToEngage",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SetMovementSpeed",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "MoveSpeeds"
						}
					]
				},
				{
					name: "SetPath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "ParkNow",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MoveToPoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						}
					]
				},
				{
					name: "BoardAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						}
					]
				},
				{
					name: "DismountAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "CanLoadPassengerBay",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "IFVSpawn",
			methods: [
				{
					name: "SetAllowReload",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "r",
							type: "bool"
						}
					]
				},
				{
					name: "PassesFilter",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "uSpawner",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "HasPassengerBay",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "UnloadAllPassengers",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "rallyWp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "LoadPassengers",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListSame"
						}
					]
				},
				{
					name: "GetMaximumPassengers",
					decorator: null,
					returnType: "int",
					args: []
				},
				{
					name: "GetSeatTransform",
					decorator: null,
					returnType: "Transform",
					args: [
						{
							name: "seatIdx",
							type: "int"
						}
					]
				},
				{
					name: "UnitCanMove",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "GroundUnitIsVehicle",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "IsOptionalStopToEngage",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SetMovementSpeed",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "MoveSpeeds"
						}
					]
				},
				{
					name: "SetPath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "ParkNow",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MoveToPoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						}
					]
				},
				{
					name: "BoardAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						}
					]
				},
				{
					name: "DismountAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "CanLoadPassengerBay",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "J4MothershipSpawn",
			methods: [
				{
					name: "Enter",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "FireBeam",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DisengageFighters",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "radius",
							type: "float"
						},
						{
							name: "alt",
							type: "float"
						}
					]
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "MultiplayerSpawn",
			methods: [
				{
					name: "VehicleName",
					decorator: null,
					returnType: "string",
					args: []
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "SetupSpawnedVehicle",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "vehicleObj",
							type: "GameObject"
						}
					]
				},
				{
					name: "SCC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_Spawns",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "Host_ReportPlayerSpawned",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SCC_IsUsingAltNumber",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "number",
							type: "float"
						}
					]
				},
				{
					name: "SCC_GetsDetected",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_Landed",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_LandedAtWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_FuelLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "FloatComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_EnginesOn",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_Altitude",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "FloatComparisons"
						},
						{
							name: "altitude",
							type: "float"
						}
					]
				},
				{
					name: "SCC_AltitudeRadar",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "FloatComparisons"
						},
						{
							name: "altitude",
							type: "float"
						}
					]
				},
				{
					name: "SCC_Airspeed",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "FloatComparisons"
						},
						{
							name: "airspeed",
							type: "float"
						}
					]
				},
				{
					name: "SCC_SurfaceSpeed",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "FloatComparisons"
						},
						{
							name: "surfaceSpeed",
							type: "float"
						}
					]
				},
				{
					name: "SCC_LivesRemaining",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comp",
							type: "IntComparisons"
						},
						{
							name: "amount",
							type: "int"
						}
					]
				},
				{
					name: "SCC_BudgetComparison",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comp",
							type: "IntComparisons"
						},
						{
							name: "amount",
							type: "int"
						}
					]
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "AddLives",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "lives",
							type: "float"
						}
					]
				},
				{
					name: "SetLives",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "lives",
							type: "float"
						}
					]
				},
				{
					name: "DestroyVehicle",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "AddFunds",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "amount",
							type: "float"
						}
					]
				},
				{
					name: "RemoveFunds",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "amount",
							type: "float"
						}
					]
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "PlayerSpawn",
			methods: [
				{
					name: "PassesFilter",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "uSpawner",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "SetWaypoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						}
					]
				},
				{
					name: "KillPilot",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroyVehicle",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "RepairVehicle",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ResetVehicle",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wp",
							type: "Waypoint"
						},
						{
							name: "heading",
							type: "float"
						},
						{
							name: "speed",
							type: "float"
						},
						{
							name: "mode",
							type: "FlightStartModes"
						},
						{
							name: "fadeTime",
							type: "float"
						}
					]
				},
				{
					name: "CloseAllDoors",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SCC_Landed",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_FuelLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "FloatComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_EnginesOn",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_Altitude",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "FloatComparisons"
						},
						{
							name: "altitude",
							type: "float"
						}
					]
				},
				{
					name: "SCC_AltitudeRadar",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "FloatComparisons"
						},
						{
							name: "altitude",
							type: "float"
						}
					]
				},
				{
					name: "SCC_Airspeed",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "FloatComparisons"
						},
						{
							name: "airspeed",
							type: "float"
						}
					]
				},
				{
					name: "SCC_SurfaceSpeed",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "FloatComparisons"
						},
						{
							name: "surfaceSpeed",
							type: "float"
						}
					]
				},
				{
					name: "SCC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDetected",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_IsLockingTgtList",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "list",
							type: "UnitReferenceList"
						},
						{
							name: "method",
							type: "TargetingMethods"
						}
					]
				},
				{
					name: "SCC_IsLockingTarget",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "target",
							type: "UnitReference"
						},
						{
							name: "method",
							type: "TargetingMethods"
						}
					]
				},
				{
					name: "SCC_PitchComparison",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "c",
							type: "FloatComparisons"
						},
						{
							name: "pitch",
							type: "float"
						}
					]
				},
				{
					name: "SCC_RollComparison",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "c",
							type: "FloatComparisons"
						},
						{
							name: "roll",
							type: "float"
						}
					]
				},
				{
					name: "SCC_ConnectedToTanker",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "tankerUnit",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_UsingWeaponStr",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "shortName",
							type: "string"
						}
					]
				},
				{
					name: "SCC_WeaponCount",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "shortName",
							type: "string"
						},
						{
							name: "comparison",
							type: "IntComparisons"
						},
						{
							name: "compareCount",
							type: "float"
						}
					]
				},
				{
					name: "SCC_IsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_HasSensorEnabled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "sensor",
							type: "SCCPlayerSensors"
						}
					]
				},
				{
					name: "IsEditor",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "HasPassengerBay",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "GetMaximumPassengers",
					decorator: null,
					returnType: "int",
					args: []
				},
				{
					name: "GetSeatTransform",
					decorator: null,
					returnType: "Transform",
					args: [
						{
							name: "seatIdx",
							type: "int"
						}
					]
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "RearmingUnitSpawn",
			methods: [
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetEnabled",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "e",
							type: "bool"
						}
					]
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "RocketArtilleryUnitSpawn",
			methods: [
				{
					name: "SetShotsPerSalvo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "shots",
							type: "float"
						}
					]
				},
				{
					name: "SetRippleRate",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "rpm",
							type: "float"
						}
					]
				},
				{
					name: "SetAllowReload",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "allow",
							type: "bool"
						}
					]
				},
				{
					name: "SetReloadTime",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "time",
							type: "float"
						}
					]
				},
				{
					name: "PassesFilter",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "uSpawner",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "FireOnWaypoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "count",
							type: "float"
						}
					]
				},
				{
					name: "FireMultiOnWaypoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "shotsPerSalvo",
							type: "float"
						},
						{
							name: "salvos",
							type: "float"
						}
					]
				},
				{
					name: "FireMultiOnWaypointRadius",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						},
						{
							name: "shotsPerSalvo",
							type: "float"
						},
						{
							name: "salvos",
							type: "float"
						}
					]
				},
				{
					name: "FireOnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						},
						{
							name: "shotsPerSalvo",
							type: "float"
						},
						{
							name: "salvos",
							type: "float"
						}
					]
				},
				{
					name: "ClearFireOrders",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "UnitCanMove",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "GroundUnitIsVehicle",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "IsOptionalStopToEngage",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SetMovementSpeed",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "MoveSpeeds"
						}
					]
				},
				{
					name: "SetPath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "ParkNow",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MoveToPoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						}
					]
				},
				{
					name: "BoardAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						}
					]
				},
				{
					name: "DismountAIBay",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "CanLoadPassengerBay",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "EquipLoadout",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsRoleNonTarget",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SpawnUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "DestroySelf",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "IsNonTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsPriorityTarget",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "a",
							type: "Actor"
						}
					]
				},
				{
					name: "IsNonAirTargetPreferences",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SC_IsAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SC_HealthLevel",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "HealthComparisons"
						},
						{
							name: "percent",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NearPosition",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SC_DetectedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "d_team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_GetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_WasDamagedByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_GetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_GetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killer",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SCC_GetsKilledByAny",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "InvokeSpawnedUnitEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetUnitInstanceID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "IsUnitXOfPath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "dir",
							type: "CardinalDirections"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "IsUnitInsidePath",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "ioro",
							type: "InOrOut"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				}
			]
		},
		{
			name: "SCCUnitList",
			methods: [
				{
					name: "SCC_AllAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_NumAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "IntComparisons"
						},
						{
							name: "count",
							type: "float"
						}
					]
				},
				{
					name: "SCC_NumNearWP",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "waypoint",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						},
						{
							name: "comparison",
							type: "IntComparisons"
						},
						{
							name: "count",
							type: "float"
						}
					]
				},
				{
					name: "SCC_AnyNearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_AnyNearPoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "fp",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						},
						{
							name: "spherical",
							type: "bool"
						}
					]
				},
				{
					name: "SCC_AnyUnitDetected",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_AllUnitDetected",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_AnyGetsDamaged",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_AnyGetsDamagedBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "damagers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_AnyGetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_AnyGetsKilledBy",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "killers",
							type: "UnitReferenceList"
						}
					]
				},
				{
					name: "SCC_BudgetComparison",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comp",
							type: "IntComparisons"
						},
						{
							name: "amount",
							type: "int"
						}
					]
				}
			]
		},
		{
			name: "ScenarioTriggerEvents",
			methods: [
				{
					name: "Enable",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "Disable",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "Trigger",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "RemoteTrigger",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "GetEvent",
					decorator: null,
					returnType: "TriggerEvent",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "AddNewEvent",
					decorator: null,
					returnType: "TriggerEvent",
					args: []
				},
				{
					name: "DeleteEvent",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "int"
						}
					]
				},
				{
					name: "DestroyAll",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "ReportEventFired",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "eventID",
							type: "int"
						}
					]
				},
				{
					name: "BeginScenario",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "LoadFromScenarioNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "scenarioNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "SaveToScenarioNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "scenarioNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "QuicksaveToNode",
					decorator: null,
					returnType: "ConfigNode",
					args: [
						{
							name: "nodeName",
							type: "string"
						}
					]
				},
				{
					name: "QuickloadFromNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "stNode",
							type: "ConfigNode"
						}
					]
				}
			]
		},
		{
			name: "VTMapEdPrefab",
			methods: [
				{
					name: "SaveToConfigNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "parentNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "LoadFromConfigNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "objNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "GetLocalPlacementBounds",
					decorator: null,
					returnType: "Bounds",
					args: []
				}
			]
		},
		{
			name: "VTMapEdStructurePrefab",
			methods: [
				{
					name: "SaveToConfigNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "parentNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "LoadFromConfigNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "objNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "GetLocalPlacementBounds",
					decorator: null,
					returnType: "Bounds",
					args: []
				}
			]
		},
		{
			name: "VTMapEdScenarioBasePrefab",
			methods: [
				{
					name: "Editor_GetRearmPoints",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetTeam",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "team",
							type: "Teams"
						}
					]
				},
				{
					name: "BeginScenario",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "GetAirport",
					decorator: null,
					returnType: "AirportManager",
					args: []
				},
				{
					name: "SaveToConfigNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "parentNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "LoadFromConfigNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "objNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "GetLocalPlacementBounds",
					decorator: null,
					returnType: "Bounds",
					args: []
				}
			]
		},
		{
			name: "VTObjective",
			methods: [
				{
					name: "SaveToParentNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "node",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "LoadFromNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "oNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "BeginScenario",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "Dispose",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetObjectiveType",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "t",
							type: "ObjectiveTypes"
						}
					]
				},
				{
					name: "BeginObjective",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "CompleteObjective",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "FailObjective",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "CancelObjective",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ResetObjective",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				}
			]
		},
		{
			name: "VTScenario",
			methods: [
				{
					name: "Dispose",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "Rewind",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetTime",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "seconds",
							type: "float"
						}
					]
				},
				{
					name: "PassesFilter",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "uSpawner",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "PassesFilter",
					decorator: null,
					returnType: "bool",
					args: [
						{
							name: "uSpawner",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "RadioMessage",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "audio",
							type: "VTSAudioReference"
						}
					]
				},
				{
					name: "PlayPriorityMessage",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "audio",
							type: "VTSAudioReference"
						}
					]
				},
				{
					name: "StopCommRadio",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "RadioMessageTeam",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "audio",
							type: "VTSAudioReference"
						},
						{
							name: "team",
							type: "MPUITeams"
						}
					]
				},
				{
					name: "PlayCopilotRadioMessageLowPriority",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "audio",
							type: "VTSAudioReference"
						}
					]
				},
				{
					name: "PlayCopilotRadioMessage",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "audio",
							type: "VTSAudioReference"
						}
					]
				},
				{
					name: "FireConditionalAction",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "action",
							type: "ConditionalActionReference"
						}
					]
				},
				{
					name: "FireRandomEvent",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "rEvent",
							type: "RandomEventReference"
						}
					]
				},
				{
					name: "PlayBGM",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "audio",
							type: "VTSAudioReference"
						},
						{
							name: "loop",
							type: "bool"
						}
					]
				},
				{
					name: "ResumeBGM",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "id",
							type: "string"
						},
						{
							name: "loop",
							type: "bool"
						},
						{
							name: "time",
							type: "float"
						}
					]
				},
				{
					name: "StopBGM",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SendWaypointToGPS",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "index",
							type: "float"
						},
						{
							name: "wpt",
							type: "Waypoint"
						}
					]
				},
				{
					name: "SendPathToGPS",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "index",
							type: "float"
						},
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "ForceQuicksave",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceQuickload",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "TransitionWind",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "direction",
							type: "float"
						},
						{
							name: "speed",
							type: "float"
						},
						{
							name: "variation",
							type: "float"
						},
						{
							name: "gusts",
							type: "float"
						},
						{
							name: "time",
							type: "float"
						}
					]
				},
				{
					name: "TransitionWeather",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "weather",
							type: "WeatherPresetReference"
						},
						{
							name: "time",
							type: "float"
						}
					]
				},
				{
					name: "TransitionTime",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "time",
							type: "float"
						},
						{
							name: "duration",
							type: "float"
						}
					]
				},
				{
					name: "TransitionTimeImmediate",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "time",
							type: "float"
						}
					]
				},
				{
					name: "SetTimeSpeed",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "timeMult",
							type: "float"
						}
					]
				},
				{
					name: "IsEditor",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "AddTeamScore",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "team",
							type: "Teams"
						},
						{
							name: "score",
							type: "float"
						}
					]
				},
				{
					name: "IsMP",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "IsSP",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "MP_SetRTB",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "team",
							type: "Teams"
						},
						{
							name: "wp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MP_SetRTBUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "team",
							type: "Teams"
						},
						{
							name: "unit",
							type: "UnitReference"
						}
					]
				},
				{
					name: "MP_SetRTBSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "team",
							type: "Teams"
						}
					]
				},
				{
					name: "SP_SetRTB",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "SP_SetRTBUnit",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "unit",
							type: "UnitReference"
						}
					]
				},
				{
					name: "MP_SetFuelWP",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "team",
							type: "Teams"
						},
						{
							name: "wp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MP_SetFuelUnitWP",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "team",
							type: "Teams"
						},
						{
							name: "unit",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SP_SetFuelWP",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wp",
							type: "Waypoint"
						}
					]
				},
				{
					name: "SP_SetFuelUnitWP",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "unit",
							type: "UnitReference"
						}
					]
				},
				{
					name: "AddFundsToTeam",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "team",
							type: "Teams"
						},
						{
							name: "amount",
							type: "float"
						}
					]
				},
				{
					name: "RemoveFundsFrom",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "team",
							type: "Teams"
						},
						{
							name: "amount",
							type: "float"
						}
					]
				},
				{
					name: "DisplayMessage",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "string"
						},
						{
							name: "duration",
							type: "float"
						}
					]
				},
				{
					name: "DisplayMessageTeam",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "string"
						},
						{
							name: "duration",
							type: "float"
						},
						{
							name: "team",
							type: "Teams"
						}
					]
				},
				{
					name: "DisplayControlMessage",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "string"
						},
						{
							name: "duration",
							type: "float"
						},
						{
							name: "control",
							type: "VehicleControlReference"
						}
					]
				},
				{
					name: "DisplayMessageWithVideo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "string"
						},
						{
							name: "duration",
							type: "float"
						},
						{
							name: "video",
							type: "VTSVideoReference"
						}
					]
				},
				{
					name: "DisplayControlMessageVideo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "s",
							type: "string"
						},
						{
							name: "duration",
							type: "float"
						},
						{
							name: "control",
							type: "VehicleControlReference"
						},
						{
							name: "video",
							type: "VTSVideoReference"
						}
					]
				},
				{
					name: "IsEditor",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "HideMessage",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetMFD",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "mfdType",
							type: "MFDTypes"
						},
						{
							name: "mfdIdx",
							type: "float"
						},
						{
							name: "page",
							type: "string"
						}
					]
				},
				{
					name: "HasStandardMFDs",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "IsMP",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "IsSP",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "SetValue",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "gv",
							type: "GlobalValue"
						},
						{
							name: "val",
							type: "float"
						}
					]
				},
				{
					name: "IncrementValue",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "gv",
							type: "GlobalValue"
						},
						{
							name: "val",
							type: "float"
						}
					]
				},
				{
					name: "DecrementValue",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "gv",
							type: "GlobalValue"
						},
						{
							name: "val",
							type: "float"
						}
					]
				},
				{
					name: "ResetValue",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "gv",
							type: "GlobalValue"
						}
					]
				},
				{
					name: "MultiplyValue",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "gv",
							type: "GlobalValue"
						},
						{
							name: "val",
							type: "float"
						}
					]
				},
				{
					name: "CopyValue",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "source",
							type: "GlobalValue"
						},
						{
							name: "dest",
							type: "GlobalValue"
						}
					]
				},
				{
					name: "AddValues",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "source",
							type: "GlobalValue"
						},
						{
							name: "dest",
							type: "GlobalValue"
						}
					]
				},
				{
					name: "SubtractValues",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "source",
							type: "GlobalValue"
						},
						{
							name: "dest",
							type: "GlobalValue"
						}
					]
				},
				{
					name: "MultiplyValues",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "source",
							type: "GlobalValue"
						},
						{
							name: "dest",
							type: "GlobalValue"
						}
					]
				},
				{
					name: "SpawnUnits",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "unitList",
							type: "UnitReferenceListAI"
						}
					]
				},
				{
					name: "KillUnits",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "unitList",
							type: "UnitReferenceListAI"
						}
					]
				},
				{
					name: "SetEngage",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "unitList",
							type: "UnitReferenceListAI"
						},
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "VerifyTeamSlots",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "int",
							type: "out"
						},
						{
							name: "int",
							type: "out"
						}
					]
				},
				{
					name: "AddResourceUser",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "user",
							type: "IScenarioResourceUser"
						}
					]
				},
				{
					name: "RemoveResourceUser",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "user",
							type: "IScenarioResourceUser"
						}
					]
				},
				{
					name: "DestroyAllScenarioObjects",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "LoadFromInfo",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "info",
							type: "VTScenarioInfo"
						}
					]
				},
				{
					name: "LoadFromNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "saveNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "SaveToConfigNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "node",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "GetMPSeatCounts",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "int",
							type: "out"
						},
						{
							name: "int",
							type: "out"
						}
					]
				},
				{
					name: "GetAirport",
					decorator: null,
					returnType: "AirportManager",
					args: [
						{
							name: "id",
							type: "string"
						}
					]
				},
				{
					name: "GetAirport",
					decorator: null,
					returnType: "AirportManager",
					args: [
						{
							name: "airportID",
							type: "int"
						}
					]
				},
				{
					name: "GetAirportID",
					decorator: null,
					returnType: "int",
					args: [
						{
							name: "ap",
							type: "AirportManager"
						}
					]
				},
				{
					name: "SetRTBWaypoint",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "wptObj",
							type: "object"
						}
					]
				},
				{
					name: "SetRefuelWaypoint",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "wptObj",
							type: "object"
						}
					]
				},
				{
					name: "GetUnitOrWaypointID",
					decorator: null,
					returnType: "string",
					args: [
						{
							name: "wptObj",
							type: "object"
						}
					]
				},
				{
					name: "GetUnitOrWaypoint",
					decorator: null,
					returnType: "object",
					args: [
						{
							name: "unitOrWptID",
							type: "string"
						}
					]
				},
				{
					name: "GetUnitOrWaypointTransform",
					decorator: null,
					returnType: "Transform",
					args: [
						{
							name: "unitOrWptID",
							type: "string"
						}
					]
				},
				{
					name: "UpdateResources",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "GetResourceManifestIndex",
					decorator: null,
					returnType: "int",
					args: [
						{
							name: "path",
							type: "string"
						}
					]
				},
				{
					name: "GetResourcePath",
					decorator: null,
					returnType: "string",
					args: [
						{
							name: "manifestIdx",
							type: "int"
						}
					]
				},
				{
					name: "QuicksaveScenario",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "qsNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "QuickloadScenario",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "qsNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "FinalQuicksaveResume",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "RemoteFireTriggerEvent",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "triggerName",
							type: "string"
						}
					]
				},
				{
					name: "RemotePlayCustomBGM",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "audioPath",
							type: "string"
						},
						{
							name: "time",
							type: "float"
						},
						{
							name: "loop",
							type: "bool"
						}
					]
				}
			]
		},
		{
			name: "VTSequencedEvent",
			methods: [
				{
					name: "Restart",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "Stop",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "QuicksaveToNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "parentNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "QuickloadFromNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "sequenceNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "QS_ResumeEvent",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "BeginEvent",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "Stop",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "Restart",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "Dispose",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SaveToConfigNode",
					decorator: null,
					returnType: "ConfigNode",
					args: []
				},
				{
					name: "LoadFromConfigNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "sNode",
							type: "ConfigNode"
						}
					]
				}
			]
		},
		{
			name: "VTStaticObject",
			methods: [
				{
					name: "MoveInEditor",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "Spawn",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetNewID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "newID",
							type: "int"
						}
					]
				},
				{
					name: "SetGlobalPosition",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "gp",
							type: "Vector3D"
						}
					]
				},
				{
					name: "GetUIDisplayName",
					decorator: null,
					returnType: "string",
					args: []
				},
				{
					name: "SaveToConfigNode",
					decorator: null,
					returnType: "ConfigNode",
					args: []
				}
			]
		},
		{
			name: "VTSODestructible",
			methods: [
				{
					name: "VTE_Destroy",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SCC_IsDestroyed",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "MoveInEditor",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "Spawn",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetNewID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "newID",
							type: "int"
						}
					]
				},
				{
					name: "SetGlobalPosition",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "gp",
							type: "Vector3D"
						}
					]
				},
				{
					name: "GetUIDisplayName",
					decorator: null,
					returnType: "string",
					args: []
				},
				{
					name: "SaveToConfigNode",
					decorator: null,
					returnType: "ConfigNode",
					args: []
				}
			]
		},
		{
			name: "VTSOTutorial",
			methods: [
				{
					name: "FireCustomAction",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "idx",
							type: "float"
						}
					]
				},
				{
					name: "MoveInEditor",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "Spawn",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SetNewID",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "newID",
							type: "int"
						}
					]
				},
				{
					name: "SetGlobalPosition",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "gp",
							type: "Vector3D"
						}
					]
				},
				{
					name: "GetUIDisplayName",
					decorator: null,
					returnType: "string",
					args: []
				},
				{
					name: "SaveToConfigNode",
					decorator: null,
					returnType: "ConfigNode",
					args: []
				}
			]
		},
		{
			name: "VTTimedEventGroup",
			methods: [
				{
					name: "DestroyObjects",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "SaveToNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "node",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "LoadFromNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "groupNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "Begin",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "Stop",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "BeginScenario",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "RemoteFireEvent",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "eventIdx",
							type: "int"
						}
					]
				},
				{
					name: "HasBegun",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "HasFinished",
					decorator: null,
					returnType: "bool",
					args: []
				}
			]
		},
		{
			name: "VTUnitGroup",
			methods: [
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "SpawnAll",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetInvincible",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "i",
							type: "bool"
						}
					]
				},
				{
					name: "KillAll",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "ForceAltSpawn",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "altSpawnNumber",
							type: "int"
						}
					]
				},
				{
					name: "RandomizeAltSpawns",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SCC_AllAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_NumAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "IntComparisons"
						},
						{
							name: "count",
							type: "float"
						}
					]
				},
				{
					name: "SCC_AnyNearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "SCC_AnyNearPoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "fp",
							type: "FixedPoint"
						},
						{
							name: "radius",
							type: "float"
						},
						{
							name: "spherical",
							type: "bool"
						}
					]
				},
				{
					name: "SCC_AnyUnitDetected",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_AllUnitDetected",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "team",
							type: "Teams"
						}
					]
				},
				{
					name: "SCC_AnyGetsKilled",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemoveNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "nonTargets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "RemovePriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "waypoint",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MovePath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "IsAllied",
					decorator: null,
					returnType: "bool",
					args: []
				},
				{
					name: "TakeOff",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "Land",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "airport",
							type: "AirportReference"
						}
					]
				},
				{
					name: "RearmAt",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "airport",
							type: "AirportReference"
						}
					]
				},
				{
					name: "FormOnLeader",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "FormOnPilot",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "target",
							type: "UnitReference"
						}
					]
				},
				{
					name: "SetNavSpeed",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "speed",
							type: "float"
						}
					]
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "SetToLasingMode",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "laserCode",
							type: "float"
						}
					]
				},
				{
					name: "FlyNavPath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "FlyOrbit",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						},
						{
							name: "alt",
							type: "float"
						}
					]
				},
				{
					name: "SetAltitude",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "alt",
							type: "float"
						}
					]
				},
				{
					name: "AttackTarget",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "tgt",
							type: "UnitReference"
						}
					]
				},
				{
					name: "CancelAttackTarget",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetRadioComms",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "radioEnabled",
							type: "bool"
						}
					]
				},
				{
					name: "SetRadar",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "radarOn",
							type: "bool"
						}
					]
				},
				{
					name: "AddPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "SetPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearPriorityTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "AddNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "SetNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearNonTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "AddDesignatedTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "SetDesignatedTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "ClearDesignatedTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "RemoveDesignatedTargets",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "targets",
							type: "UnitReferenceListOtherSubs"
						}
					]
				},
				{
					name: "SetMaxMissilesPerTarget",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "t",
							type: "float"
						}
					]
				},
				{
					name: "AllAirborne",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "NumAirborne",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "IntComparisons"
						},
						{
							name: "count",
							type: "float"
						}
					]
				},
				{
					name: "NumLanded",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "comparison",
							type: "IntComparisons"
						},
						{
							name: "count",
							type: "float"
						}
					]
				},
				{
					name: "AllLanded",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "SCC_AnyLandedNearWaypoint",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						}
					]
				},
				{
					name: "LivePlayersPresentNearWP",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: [
						{
							name: "wp",
							type: "Waypoint"
						},
						{
							name: "radius",
							type: "float"
						},
						{
							name: "spherical",
							type: "bool"
						}
					]
				},
				{
					name: "AllPlayersAlive",
					decorator: "SCCUnitProperty",
					returnType: "bool",
					args: []
				},
				{
					name: "MoveTo",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "wpt",
							type: "Waypoint"
						}
					]
				},
				{
					name: "MoveToPoint",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "point",
							type: "FixedPoint"
						}
					]
				},
				{
					name: "MovePath",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "path",
							type: "FollowPath"
						}
					]
				},
				{
					name: "Stop",
					decorator: "VTEvent",
					returnType: "void",
					args: []
				},
				{
					name: "SetEngageEnemies",
					decorator: "VTEvent",
					returnType: "void",
					args: [
						{
							name: "engage",
							type: "bool"
						}
					]
				},
				{
					name: "DestroyObjects",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "GetTeam",
					decorator: null,
					returnType: "Teams",
					args: []
				},
				{
					name: "GetEventTargetID",
					decorator: null,
					returnType: "int",
					args: []
				},
				{
					name: "BeginScenario",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "AddUnitToGroup",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "unit",
							type: "UnitSpawner"
						},
						{
							name: "groupID",
							type: "PhoneticLetters"
						}
					]
				},
				{
					name: "GetUnitGroup",
					decorator: null,
					returnType: "UnitGroup",
					args: [
						{
							name: "team",
							type: "Teams"
						},
						{
							name: "groupID",
							type: "PhoneticLetters"
						}
					]
				},
				{
					name: "GetUnitGroup",
					decorator: null,
					returnType: "UnitGroup",
					args: [
						{
							name: "eventTargetID",
							type: "int"
						}
					]
				},
				{
					name: "RemoveUnitFromGroups",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "unit",
							type: "UnitSpawner"
						}
					]
				},
				{
					name: "LoadFromScenarioNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "scenarioNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "SaveToScenarioNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "scenarioNode",
							type: "ConfigNode"
						}
					]
				},
				{
					name: "BeginScenario",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "DestroyAll",
					decorator: null,
					returnType: "void",
					args: []
				},
				{
					name: "QuicksaveToNode",
					decorator: null,
					returnType: "ConfigNode",
					args: [
						{
							name: "nodeName",
							type: "string"
						}
					]
				},
				{
					name: "QuickloadFromNode",
					decorator: null,
					returnType: "void",
					args: [
						{
							name: "node",
							type: "ConfigNode"
						}
					]
				}
			]
		}
	],
	enums: [
		{
			name: "CardinalDirections",
			values: [
				{
					key: "North",
					value: "0"
				},
				{
					key: "East",
					value: "1"
				},
				{
					key: "South",
					value: "2"
				},
				{
					key: "West",
					value: "3"
				}
			]
		},
		{
			name: "InOrOut",
			values: [
				{
					key: "Inside",
					value: "0"
				},
				{
					key: "Outside",
					value: "1"
				}
			]
		},
		{
			name: "HealthComparisons",
			values: [
				{
					key: "Greater_Than",
					value: "0"
				},
				{
					key: "Less_Than",
					value: "1"
				}
			]
		},
		{
			name: "Teams",
			values: [
				{
					key: "Allied",
					value: "0"
				},
				{
					key: "Enemy",
					value: "1"
				}
			]
		},
		{
			name: "PlayerCommandsModes",
			values: [
				{
					key: "Unit_Group_Only",
					value: "0"
				},
				{
					key: "Force_Allow",
					value: "1"
				},
				{
					key: "Force_Disallow",
					value: "2"
				}
			]
		},
		{
			name: "FormationDistances",
			values: [
				{
					key: "Close",
					value: "0"
				},
				{
					key: "Medium",
					value: "1"
				},
				{
					key: "Far",
					value: "2"
				},
				{
					key: "Airshow",
					value: "3"
				}
			]
		},
		{
			name: "MoveSpeeds",
			values: [
				{
					key: "Slow_10",
					value: "0"
				},
				{
					key: "Medium_20",
					value: "1"
				},
				{
					key: "Fast_30",
					value: "2"
				}
			]
		},
		{
			name: "EMBandOptions",
			values: [
				{
					key: "Low",
					value: "0"
				},
				{
					key: "Mid",
					value: "1"
				},
				{
					key: "High",
					value: "2"
				}
			]
		},
		{
			name: "FloatComparisons",
			values: [
				{
					key: "Greater_Than",
					value: "0"
				},
				{
					key: "Less_Than",
					value: "1"
				}
			]
		},
		{
			name: "IntComparisons",
			values: [
				{
					key: "Equals",
					value: "0"
				},
				{
					key: "Greater_Than",
					value: "1"
				},
				{
					key: "Less_Than",
					value: "2"
				}
			]
		},
		{
			name: "FlightStartModes",
			values: [
				{
					key: "Cold",
					value: "0"
				},
				{
					key: "FlightReady",
					value: "1"
				},
				{
					key: "FlightAP",
					value: "2"
				}
			]
		},
		{
			name: "TargetingMethods",
			values: [
				{
					key: "Radar",
					value: "0"
				},
				{
					key: "TGP",
					value: "1"
				},
				{
					key: "TSD",
					value: "2"
				},
				{
					key: "ARAD",
					value: "3"
				}
			]
		},
		{
			name: "SCCPlayerSensors",
			values: [
				{
					key: "Radar",
					value: "0"
				},
				{
					key: "TGP",
					value: "1"
				}
			]
		},
		{
			name: "MPUITeams",
			values: [
				{
					key: "Team_A",
					value: "0"
				},
				{
					key: "Team_B",
					value: "1"
				}
			]
		},
		{
			name: "MFDTypes",
			values: [
				{
					key: "Main",
					value: "0"
				},
				{
					key: "Mini",
					value: "1"
				}
			]
		}
	]
};

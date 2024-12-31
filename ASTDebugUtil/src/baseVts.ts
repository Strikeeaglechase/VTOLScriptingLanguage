export const baseVts = `CustomScenario
{
	gameVersion = 1.12.0p4
	campaignID = chaseFeetPics
	campaignOrderIdx = 0
	scenarioName = TestMission2
	scenarioID = TestMission2
	scenarioDescription = Another map for HS testing and development
	mapID = test
	vehicle = F-45A
	multiplayer = True
	allowedEquips = f45_gun;f45_sidewinderx2;f45_aim9x1;f45_amraamInternal;f45_amraamRail;f45_mk82x1;f45_mk82Internal;f45_mk82x4Internal;f45_gbu12x2Internal;f45_gbu12x1;f45-gbu39;f45_agm161;f45_agm161Internal;f45_droptank;f45_gbu38x1;f45_gbu38x2Internal;f45_gbu38x4Internal;f45_mk83x1;f45_mk83x1Internal;f45-agm145I;f45-agm145ISide;f45-agm145x3;f45-gbu53;
	forceEquips = False
	normForcedFuel = 1
	equipsConfigurable = True
	baseBudget = 100000
	isTraining = False
	rtbWptID = wpt:0
	refuelWptID = wpt:0
	mpPlayerCount = 1
	autoPlayerCount = True
	overrideAlliedPlayerCount = 0
	overrideEnemyPlayerCount = 0
	scorePerDeath_A = 0
	scorePerDeath_B = 0
	scorePerKill_A = 0
	scorePerKill_B = 0
	mpBudgetMode = Life
	rtbWptID_B = wpt:0
	refuelWptID_B = wpt:0
	separateBriefings = False
	baseBudgetB = 100000
	infiniteAmmo = False
	infAmmoReloadDelay = 5
	fuelDrainMult = 1
	envName = day
	selectableEnv = True
	windDir = 0
	windSpeed = 0
	windVariation = 0
	windGusts = 0
	defaultWeather = 0
	customTimeOfDay = 11
	overrideLocation = True
	overrideLatitude = 0
	overrideLongitude = 0
	month = 1
	day = 1
	year = 2024
	timeOfDaySpeed = 1
	qsMode = Anywhere
	qsLimit = -1
	WEATHER_PRESETS
	{
	}
	UNITS
	{
		UnitSpawner
		{
			unitName = MP Spawn
			globalPosition = (13916.068771362305, 51.908599853515625, 10013.2548828125)
			unitInstanceID = 0
			unitID = MultiplayerSpawn
			rotation = (-2.418682E-05, 6.052423, -7.0364E-07)
			lastValidPlacement = (13916.068771362305, 51.908599853515625, 10013.2548828125)
			editorPlacementMode = Ground
			onCarrier = False
			mpSelectEnabled = True
			UnitFields
			{
				vehicle = F-45A
				slotLabel = 
				unitGroup = Allied:Alpha
				startMode = FlightReady
				equipment = 
				initialSpeed = 0
				rtbIsSpawn = False
				limitedLives = False
				lifeCount = 1
				b_eqAssignmentMode = False
				costToSpawn = 0
				liveryRef = 0;
				receiveFriendlyDamage = True
				selectableAltSpawn = False
			}
		}
		UnitSpawner
		{
			unitName = M1 Tank
			globalPosition = (13907.451644897461, 52.478622436523438, 10084.5146484375)
			unitInstanceID = 1
			unitID = alliedMBT1
			rotation = (0, 0, 0)
			lastValidPlacement = (13907.451644897461, 52.478622436523438, 10084.5146484375)
			editorPlacementMode = Ground
			onCarrier = False
			mpSelectEnabled = True
			UnitFields
			{
				unitGroup = Allied:Bravo
				moveSpeed = Slow_10
				behavior = Parked
				defaultPath = null
				waypoint = null
				stopToEngage = True
				engageEnemies = True
				detectionMode = Default
				spawnOnStart = True
				invincible = False
				respawnable = False
				receiveFriendlyDamage = True
			}
		}
		UnitSpawner
		{
			unitName = M1 Tank
			globalPosition = (13912.739501953125, 52.478622436523438, 10084.5146484375)
			unitInstanceID = 2
			unitID = alliedMBT1
			rotation = (0, 0, 0)
			lastValidPlacement = (13912.739501953125, 52.478622436523438, 10083.848876953125)
			editorPlacementMode = Ground
			onCarrier = False
			mpSelectEnabled = True
			UnitFields
			{
				unitGroup = null
				moveSpeed = Slow_10
				behavior = Parked
				defaultPath = null
				waypoint = null
				stopToEngage = True
				engageEnemies = True
				detectionMode = Default
				spawnOnStart = True
				invincible = False
				respawnable = False
				receiveFriendlyDamage = True
			}
		}
		UnitSpawner
		{
			unitName = M1 Tank
			globalPosition = (13907.451644897461, 52.478622436523438, 10093.633666992188)
			unitInstanceID = 5
			unitID = alliedMBT1
			rotation = (0, 0, 0)
			lastValidPlacement = (13908.288299560547, 52.478622436523438, 10093.633666992188)
			editorPlacementMode = Ground
			onCarrier = False
			mpSelectEnabled = True
			UnitFields
			{
				unitGroup = null
				moveSpeed = Slow_10
				behavior = Parked
				defaultPath = null
				waypoint = null
				stopToEngage = True
				engageEnemies = True
				detectionMode = Default
				spawnOnStart = True
				invincible = False
				respawnable = False
				receiveFriendlyDamage = True
			}
		}
	}
	PATHS
	{
	}
	WAYPOINTS
	{
		bullseyeID = 0
		bullseyeID_B = 0
		WAYPOINT
		{
			id = 0
			name = RTB
			globalPoint = (14118.90283203125, 0, 0)
		}
		WAYPOINT
		{
			id = 1
			name = spawncamp_B
			globalPoint = (14064.606338500977, 51.90887451171875, 11194.535430908203)
		}
	}
	UNITGROUPS
	{
		ALLIED
		{
			Alpha = 2;0;
			Bravo = 0;1;
			Alpha_SETTINGS
			{
				syncAltSpawns = False
			}
			Bravo_SETTINGS
			{
				syncAltSpawns = False
			}
		}
	}
	TimedEventGroups
	{
	}
	TRIGGER_EVENTS
	{
	}
	OBJECTIVES
	{
		Objective
		{
			objectiveName = New Objective
			objectiveInfo = null
			objectiveID = 0
			orderID = 0
			required = True
			completionReward = 0
			waypoint = null
			autoSetWaypoint = False
			startMode = Immediate
			objectiveType = Conditional
			startEvent
			{
				EventInfo
				{
					eventName = Start Event
				}
			}
			failEvent
			{
				EventInfo
				{
					eventName = Failed Event
				}
			}
			completeEvent
			{
				EventInfo
				{
					eventName = Completed Event
				}
			}
			fields
			{
				successConditional = null
				failConditional = null
			}
		}
	}
	OBJECTIVES_OPFOR
	{
		Objective
		{
			objectiveName = New Objective
			objectiveInfo = null
			objectiveID = 1
			orderID = 0
			required = True
			completionReward = 0
			waypoint = null
			autoSetWaypoint = False
			startMode = Immediate
			objectiveType = Conditional
			startEvent
			{
				EventInfo
				{
					eventName = Start Event
				}
			}
			failEvent
			{
				EventInfo
				{
					eventName = Failed Event
				}
			}
			completeEvent
			{
				EventInfo
				{
					eventName = Completed Event
				}
			}
			fields
			{
				successConditional = null
				failConditional = null
			}
		}
	}
	StaticObjects
	{
	}
	Conditionals
	{
	}
	ConditionalActions
	{
		ConditionalAction
		{
			id = 0
			name = 
			BASE_BLOCK
			{
				blockName = 
				blockId = 1
				CONDITIONAL
				{
					id = 0
					outputNodePos = (0, 0, 0)
					root = 0
					COMP
					{
						id = 0
						type = SCCChance
						uiPos = (-350.1293, 43.95135, 0)
						chance = 100
					}
				}
				ACTIONS
				{
					eventName = 
				}
				ELSE_ACTIONS
				{
					eventName = 
				}
			}
		}
	}
	RandomEvents
	{
	}
	EventSequences
	{
		SEQUENCE
		{
			id = 0
			sequenceName = New Event Sequence
			startImmediately = False
			whileLoop = False
			EVENT
			{
				delay = 0
				nodeName = New Node
				EventInfo
				{
					eventName = 
					EventTarget
					{
						targetType = System
						targetID = 0
						eventName = Fire Conditional Action
						methodName = FireConditionalAction
						altTargetIdx = -1
						ParamInfo
						{
							type = ConditionalActionReference
							value = 0
							name = Action
						}
					}
				}
			}
		}
	}
	BASES
	{
		BaseInfo
		{
			id = 1
			overrideBaseName = null
			baseTeam = Allied
			CUSTOM_DATA
			{
			}
		}
	}
	GlobalValues
	{
	}
	Briefing
	{
	}
	Briefing_B
	{
	}
}`;

import fs from "fs";
import { readVtsFile, Vector3, VTNode, writeVtsFile } from "./vtsParser.js";

const vts = readVtsFile(
	fs.readFileSync("C:/Program Files (x86)/Steam/steamapps/common/VTOL VR/CustomScenarios/Campaigns/chaseFeetPics/TestMission2/TestMission2ed.vts", "utf-8")
);

const units = vts.getNode("UNITS");
const spawners = units.getChildrenWithName("UnitSpawner");
const tanks = spawners.filter(s => s.getValue("unitName") == "M1 Tank");

const pex = (u: VTNode) => u.getValue("globalPosition") as Vector3;

const orgX = pex(tanks[0]).x;
const orgY = pex(tanks[0]).y;
const orgZ = pex(tanks[0]).z;

const dx = pex(tanks[1]).x - orgX;
const dz = pex(tanks[2]).z - orgZ;

const width = 10;
const height = 10;

let id = 10;
for (let yIdx = 0; yIdx < height; yIdx++) {
	for (let xIdx = 0; xIdx < width; xIdx++) {
		if (yIdx == 0 && xIdx < 2) continue;
		if (yIdx == 1 && xIdx == 0) continue;

		const x = orgX + dx * xIdx;
		const y = orgY;
		const z = orgZ + dz * yIdx;

		const tank = tanks[0].clone();
		tank.setValue("globalPosition", { x, y, z }, true);
		tank.setValue("unitInstanceID", id++, true);

		units.addChild(tank);
	}
}

fs.writeFileSync(
	"C:/Program Files (x86)/Steam/steamapps/common/VTOL VR/CustomScenarios/Campaigns/chaseFeetPics/TestMission2/TestMission2.vts",
	writeVtsFile(vts)
);

import fs from "fs";

import { Emulator } from "./emulator/emulator.js";
import { UnitTester } from "./unitTests.js";
import { writeVtsFile } from "./vtsParser.js";
import { Linker } from "./linker.js";

let sourceVtsPath = "C:/Program Files (x86)/Steam/steamapps/common/VTOL VR/CustomScenarios/Campaigns/chaseFeetPics/TestMission2/TestMission2.vts";
let sourceCodePath: string;
if (fs.existsSync("./source/code.vtsl")) sourceCodePath = "./source/code.vtsl";
else sourceCodePath = "../source/code.vtsl";

const source = fs.readFileSync(sourceCodePath, "utf8");
const sourceVts = fs.readFileSync(sourceVtsPath, "utf8");
const debugSymbolsMatch = source.match(/\/\/ ?Debug:(.+)/);
const debugSymbols = debugSymbolsMatch ? debugSymbolsMatch[1].split(",").map(s => s.trim()) : [];

const linker = new Linker();
linker.enableDebugIn("../debug/");
const { irCompiledVts } = linker.compile(source, sourceVts);

irCompiledVts.setValue("scenarioID", "output", true);
irCompiledVts.setValue("campaignOrderIdx", 1, true);
fs.writeFileSync(
	"C:/Program Files (x86)/Steam/steamapps/common/VTOL VR/CustomScenarios/Campaigns/chaseFeetPics/output/output.vts",
	writeVtsFile(irCompiledVts)
);

const emulateLog = fs.createWriteStream("../debug/elog.txt");
const emulator = new Emulator(irCompiledVts, true, emulateLog);
const t = Date.now();
emulator.execute().then(() => {
	debugSymbols.forEach(s => {
		console.log(emulator.getGvByName(s));
	});
	console.log(`Executed ${emulator.totalExecutedEventCount} events (${Date.now() - t}ms)`);
	fs.writeFileSync("../debug/emulator.txt", emulator.execLog);
});

const unitTests = new UnitTester();
// unitTests.runTests();

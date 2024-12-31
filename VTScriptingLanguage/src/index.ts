import fs from "fs";

// Setup non-unit events
// "Loop" function
import { Emulator } from "./emulator/emulator.js";
import { UnitTester } from "./unitTests.js";
import { writeVtsFile } from "./vtsParser.js";
import { Linker } from "./linker.js";
import chalk from "chalk";

let sourceVtsPath = "C:/Program Files (x86)/Steam/steamapps/common/VTOL VR/CustomScenarios/Campaigns/chaseFeetPics/TestMission2/TestMission2.vts";
let sourceCodePath: string;
let debugPath: string;
if (fs.existsSync("./source/code.vtsl")) {
	sourceCodePath = "./source/code.vtsl";
	debugPath = "./debug/";
} else {
	sourceCodePath = "../source/code.vtsl";
	debugPath = "../debug/";
}

const source = fs.readFileSync(sourceCodePath, "utf8");
const sourceVts = fs.readFileSync(sourceVtsPath, "utf8");
const debugSymbolsMatch = source.match(/\/\/ ?Debug:(.+)/i);
const debugSymbols = debugSymbolsMatch ? debugSymbolsMatch[1].split(",").map(s => s.trim()) : [];

const compileStart = Date.now();
const linker = new Linker();
linker.enableDebugIn(debugPath);
const { irCompiledVts } = linker.compile(source, sourceVts);
if (linker.hasErrors) {
	console.log(chalk.red(`Compilation failed with ${linker.parserErrors.length} parse errors and ${linker.compilerErrors.length} compiler errors`));
	process.exit(1);
}

console.log(`Compilation successful in ${Date.now() - compileStart}ms`);

irCompiledVts.setValue("scenarioID", "output", true);
irCompiledVts.setValue("campaignOrderIdx", 1, true);
fs.writeFileSync(
	"C:/Program Files (x86)/Steam/steamapps/common/VTOL VR/CustomScenarios/Campaigns/chaseFeetPics/output/output.vts",
	writeVtsFile(irCompiledVts)
);

async function run() {
	const emulateLog = fs.createWriteStream(debugPath + "elog.txt");
	const emulator = new Emulator(irCompiledVts, true, emulateLog);
	const t = Date.now();
	await emulator.execute();

	debugSymbols.forEach(s => {
		console.log(emulator.getGvByName(s));
	});
	console.log(`Executed ${emulator.totalExecutedEventCount} events (${Date.now() - t}ms)`);
	fs.writeFileSync("../debug/emulator.txt", emulator.execLog);

	const unitTests = new UnitTester();
	// unitTests.runTests();
}

run();

import fs from "fs";

import { Compiler } from "./compiler/compiler.js";
import { IRCompiler } from "./compiler/ir/irCompiler.js";
import { IRGenerator } from "./compiler/ir/irGenerator.js";
import { IROptimizer } from "./compiler/ir/irOptimizer.js";
import { Emulator } from "./emulator/emulator.js";
import { Parser } from "./parser/parser.js";
import { Preprocessor } from "./parser/preprocessor.js";
import { Tokenizer } from "./parser/tokenizer.js";
import { UnitTester } from "./unitTests.js";
import { readVtsFile, writeVtsFile } from "./vtsParser.js";

let sourceVtsPath = "C:/Program Files (x86)/Steam/steamapps/common/VTOL VR/CustomScenarios/Campaigns/chaseFeetPics/snippet1_2024-08-05/snippet1_2024-08-05.vts";
let sourceCodePath: string;
if (fs.existsSync("./source/code.vtsl")) sourceCodePath = "./source/code.vtsl";
else sourceCodePath = "../source/code.vtsl";

const source = fs.readFileSync(sourceCodePath, "utf8");

const preprocessor = new Preprocessor(source);
const posCharStream = preprocessor.preprocess();

const tokenizer = new Tokenizer(posCharStream);
const tokenStream = tokenizer.parse();
fs.writeFileSync("../debug/tokens.txt", tokenizer.debug(tokenStream));
const parser = new Parser(tokenStream);
const ast = parser.parse();
fs.writeFileSync("../debug/ast.json", JSON.stringify(ast, null, 2));

const orgVts = readVtsFile(fs.readFileSync(sourceVtsPath, "utf-8"));
const compiler = new Compiler(ast, orgVts);
const compiledVts = compiler.compile();
fs.writeFileSync("../debug/output.vts", writeVtsFile(compiledVts));
// fs.writeFileSync("../debug/nodeInfos.json", JSON.stringify(compiler.gen.nodeInfos));
const irGenerator = new IRGenerator(compiledVts, compiler.gen.nodeInfos);
const ir = irGenerator.generateIR();
fs.writeFileSync("../debug/ir.json", JSON.stringify(ir, null, 2));
fs.writeFileSync("../debug/ir.txt", IRGenerator.debug(ir));
const irOptimizer = new IROptimizer(ir);
const optimizedIR = irOptimizer.optimize();
fs.writeFileSync("../debug/optimizedIR.txt", IRGenerator.debug(optimizedIR));
const irCompiler = new IRCompiler(optimizedIR, orgVts);
const irCompiledVts = irCompiler.compile();
fs.writeFileSync("../debug/irresult.vts", writeVtsFile(irCompiledVts));

irCompiledVts.setValue("scenarioID", "output", true);
irCompiledVts.setValue("campaignOrderIdx", 1, true);
fs.writeFileSync(
	"C:/Program Files (x86)/Steam/steamapps/common/VTOL VR/CustomScenarios/Campaigns/chaseFeetPics/output/output.vts",
	writeVtsFile(irCompiledVts)
);

const emulator = new Emulator(irCompiledVts, true);
emulator.execute().then(() => {
	console.log(emulator.getGvByName("n"));
	console.log(`Executed ${emulator.totalExecutedEventCount} events`);
	fs.writeFileSync("../debug/emulator.txt", emulator.execLog);
});

const unitTests = new UnitTester();
// unitTests.runTests();

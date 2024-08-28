import fs from "fs";

import { Compiler } from "./compiler/compiler.js";
import { IRGenerator } from "./compiler/irGenerator.js";
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
const sourceVts = fs.readFileSync(sourceVtsPath, "utf-8");

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
const result = compiler.compile();
fs.writeFileSync("../debug/output.vts", writeVtsFile(result));
// fs.writeFileSync("../debug/nodeInfos.json", JSON.stringify(compiler.gen.nodeInfos));
const irGenerator = new IRGenerator(result, compiler.gen.nodeInfos);
const ir = irGenerator.generateIR();
fs.writeFileSync("../debug/ir.json", JSON.stringify(ir, null, 2));
fs.writeFileSync("../debug/ir.txt", irGenerator.debug(ir));

result.setValue("scenarioID", "output", true);
fs.writeFileSync("C:/Program Files (x86)/Steam/steamapps/common/VTOL VR/CustomScenarios/Campaigns/chaseFeetPics/output/output.vts", writeVtsFile(result));

const emulator = new Emulator(result, false);
emulator.execute();

console.log(emulator.getGvByName("v"));
// console.log(emulator.getGvByName("z"));

const unitTests = new UnitTester();
unitTests.runTests();

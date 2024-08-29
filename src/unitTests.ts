import chalk from "chalk";
import fs from "fs";

import { Compiler } from "./compiler/compiler.js";
import { IRCompiler } from "./compiler/ir/irCompiler.js";
import { IRGenerator } from "./compiler/ir/irGenerator.js";
import { IROptimizer } from "./compiler/ir/irOptimizer.js";
import { Emulator } from "./emulator/emulator.js";
import { Parser } from "./parser/parser.js";
import { Preprocessor } from "./parser/preprocessor.js";
import { Tokenizer } from "./parser/tokenizer.js";
import { readVtsFile, VTNode } from "./vtsParser.js";

class UnitTester {
	private testFiles: string[] = [];
	private totalPassed = 0;
	private totalTests = 0;
	private totalLinesUnopt = 0;
	private totalLinesOpt = 0;

	private execTime = 0;

	constructor() {
		fs.readdirSync("../unitTests")
			.filter(f => f.endsWith(".txt") || f.endsWith(".vtsl"))
			.forEach(f => this.testFiles.push(f));
	}

	public runTests() {
		const start = Date.now();
		this.testFiles.forEach(f => {
			try {
				this.runTest(f);
			} catch (e) {
				console.log(`Test ${f} failed with error ${e}`);
			}
		});
		const end = Date.now();
		let rStr = `${this.totalPassed}/${this.totalTests}`;
		if (this.totalPassed == this.totalTests) rStr = chalk.green(rStr);
		else rStr = chalk.red(rStr);

		const compileTime = end - start - this.execTime;

		console.log(
			rStr +
				chalk.blue(
					` tests passed in ${end - start}ms (${compileTime}ms compile, ${this.execTime}ms execute). Unoptimized instructions: ${
						this.totalLinesUnopt
					}, optimized instructions: ${this.totalLinesOpt}`
				)
		);
	}

	private runTest(testFile: string) {
		const sourcePath = `../unitTests/${testFile}`;
		const sourceVts = fs.readFileSync("../unitTests/base.vts", "utf-8");
		const sourceVtsNode = readVtsFile(sourceVts);
		const file = fs.readFileSync(sourcePath, "utf-8");
		const expectedMatch = file.matchAll(/\/\/ ?EXPECT (.+)=(.+)/gi);
		const expected = [...expectedMatch].map(m => ({ varName: m[1], value: m[2] }));
		if (expected.length == 0) return;

		let resultVtsUnopt: VTNode;
		let resultVtsOpt: VTNode;
		try {
			const preprocessor = new Preprocessor(file);
			const posCharStream = preprocessor.preprocess();
			const tokenizer = new Tokenizer(posCharStream);
			const tokenStream = tokenizer.parse();
			const parser = new Parser(tokenStream);
			const ast = parser.parse();
			const compiler = new Compiler(ast, sourceVtsNode);
			resultVtsUnopt = compiler.compile();
			const irGenerator = new IRGenerator(resultVtsUnopt, compiler.gen.nodeInfos);
			const ir = irGenerator.generateIR();
			const irOptimizer = new IROptimizer(ir);
			const optimizedIR = irOptimizer.optimize();
			const irCompiler = new IRCompiler(optimizedIR, sourceVtsNode);
			resultVtsOpt = irCompiler.compile();
		} catch (e) {
			console.log(chalk.red(`Test ${testFile} failed to compile because ${e.message}`));
			this.totalTests += expected.length;
			return;
		}

		const execStart = Date.now();
		const emulatorUnopt = new Emulator(resultVtsUnopt);
		emulatorUnopt.execute();
		const emulatorOpt = new Emulator(resultVtsOpt);
		emulatorOpt.execute();
		const execEnd = Date.now();
		this.execTime += execEnd - execStart;

		this.totalLinesUnopt += emulatorUnopt.totalExecutedEventCount;
		this.totalLinesOpt += emulatorOpt.totalExecutedEventCount;

		let allPass = true;
		expected.forEach((e, i) => {
			this.totalTests++;
			const gvUnopt = emulatorUnopt.getGvByName(e.varName);
			const gvOpt = emulatorOpt.getGvByName(e.varName);
			const passesUnopt = gvUnopt.value == parseInt(e.value);
			const passesOpt = gvOpt.value == parseInt(e.value);
			if (!passesUnopt) console.log(chalk.red(`Unoptimized Test ${testFile} failed on case ${i}, expected ${e.value} but got ${gvOpt.value}`));
			if (!passesOpt) console.log(chalk.red(`Optimized Test ${testFile} failed on case ${i}, expected ${e.value} but got ${gvOpt.value}`));

			if (!passesUnopt || !passesOpt) allPass = false;
			else this.totalPassed++;
		});

		if (allPass) console.log(chalk.blueBright(`Test ${testFile} passed (${emulatorOpt.totalExecutedEventCount}/${emulatorUnopt.totalExecutedEventCount})`));
	}
}

export { UnitTester };

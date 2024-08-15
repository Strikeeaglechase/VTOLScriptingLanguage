import chalk from "chalk";
import fs from "fs";
import { Preprocessor } from "./parser/preprocessor.js";
import { Tokenizer } from "./parser/tokenizer.js";
import { Parser } from "./parser/parser.js";
import { Compiler } from "./compiler/compiler.js";
import { VTNode } from "./vtsParser.js";
import { Emulator } from "./emulator/emulator.js";

class UnitTester {
	private testFiles: string[] = [];
	private totalPassed = 0;
	private totalTests = 0;
	private totalLines = 0;

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

		console.log(rStr + chalk.blue(` tests passed in ${end - start}ms. ${this.totalLines} total instructions`));
	}

	private runTest(testFile: string) {
		const sourcePath = `../unitTests/${testFile}`;
		const sourceVts = fs.readFileSync("../unitTests/base.vts", "utf-8");
		const file = fs.readFileSync(sourcePath, "utf-8");
		const expectedMatch = file.matchAll(/\/\/ ?EXPECT (.+)=(.+)/gi);
		const expected = [...expectedMatch].map(m => ({ varName: m[1], value: m[2] }));
		if (expected.length == 0) return;

		let resultVts: VTNode;
		try {
			const preprocessor = new Preprocessor(file);
			const posCharStream = preprocessor.preprocess();
			const tokenizer = new Tokenizer(posCharStream);
			const tokenStream = tokenizer.parse();
			const parser = new Parser(tokenStream);
			const ast = parser.parse();
			const compiler = new Compiler(ast, sourceVts);
			resultVts = compiler.compile();
		} catch (e) {
			console.log(chalk.red(`Test ${testFile} failed to compile because ${e.message}`));
			this.totalTests += expected.length;
			return;
		}

		const emulator = new Emulator(resultVts);
		emulator.execute();

		this.totalLines += emulator.totalExecutedEventCount;

		let allPass = true;
		expected.forEach((e, i) => {
			this.totalTests++;
			const gv = emulator.getGvByName(e.varName);
			if (gv.value != parseInt(e.value)) {
				console.log(chalk.red(`Test ${testFile} failed on case ${i}, expected ${e} but got ${gv.value}`));
				allPass = false;
			} else {
				this.totalPassed++;
			}
		});

		if (allPass) console.log(chalk.blueBright(`Test ${testFile} passed`));
	}
}

export { UnitTester };

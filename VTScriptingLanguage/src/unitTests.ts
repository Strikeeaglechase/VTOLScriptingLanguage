import chalk from "chalk";
import fs from "fs";

import { Emulator } from "./emulator/emulator.js";
import { VTNode } from "./vtsParser.js";
import { Linker } from "./linker.js";

class UnitTester {
	private testFiles: string[] = [];
	private totalPassed = 0;
	private totalTests = 0;
	private totalLinesUnopt = 0;
	private totalLinesOpt = 0;

	private execTime = 0;
	private compileTime = 0;

	constructor() {
		if (!fs.existsSync("../unitTests")) {
			console.log(`Unit tests folder does not exist`);
			return;
		}

		fs.readdirSync("../unitTests")
			.filter(f => f.endsWith(".txt") || f.endsWith(".vtsl"))
			.forEach(f => this.testFiles.push(f));
	}

	public async runTests() {
		const start = Date.now();
		const proms = this.testFiles.map(async f => {
			try {
				await this.runTest(f);
			} catch (e) {
				console.log(`Test ${f} failed with error ${e}`);
				// console.log(e.stack);
			}
		});
		await Promise.all(proms);
		const end = Date.now();
		let rStr = `${this.totalPassed}/${this.totalTests}`;
		if (this.totalPassed == this.totalTests) rStr = chalk.green(rStr);
		else rStr = chalk.red(rStr);

		console.log(
			rStr +
				chalk.blue(
					` tests passed in ${end - start}ms (${this.compileTime}ms compile, ${this.execTime}ms execute). Unoptimized instructions: ${
						this.totalLinesUnopt
					}, optimized instructions: ${this.totalLinesOpt}`
				)
		);
	}

	private async runTest(testFile: string) {
		const sourcePath = `../unitTests/${testFile}`;
		const source = fs.readFileSync(sourcePath, "utf-8");
		const sourceVts = fs.readFileSync("../unitTests/base.vts", "utf-8");
		const expectedMatch = source.matchAll(/\/\/ ?EXPECT (.+)=(.+)/gi);
		const expectedEventsMatch = source.matchAll(/\/\/EXPECT-EVENT (\d+)\.(.+)/gi);
		const expected = [...expectedMatch].map(m => ({ varName: m[1], value: m[2] }));
		const expectedEvents = [...expectedEventsMatch].map(m => ({ unitId: parseInt(m[1]), method: m[2] }));
		if (expected.length == 0 && expectedEvents.length == 0) return;

		const testFileName = testFile.split(".")[0];
		if (!fs.existsSync(`../debug/unitTests/${testFileName}/`)) fs.mkdirSync(`../debug/unitTests/${testFileName}/`);

		let resultVtsUnopt: VTNode;
		let resultVtsOpt: VTNode;
		try {
			const compileStart = Date.now();
			const linker = new Linker();
			linker.enableDebugIn(`../debug/unitTests/${testFileName}/`);
			const { irCompiledVts, compiledVts } = linker.compile(source, sourceVts);
			resultVtsOpt = irCompiledVts;
			resultVtsUnopt = compiledVts;

			const compileEnd = Date.now();
			this.compileTime += compileEnd - compileStart;

			linker.compilerErrors.forEach(e => console.log(chalk.red(e.message)));
			linker.parserErrors.forEach(e => console.log(chalk.red(e.message)));
			linker.compilerErrors.forEach(e => {
				throw e.message;
			});
			linker.parserErrors.forEach(e => {
				throw e.message;
			});
		} catch (e) {
			console.log(chalk.red(`Test ${testFile} failed to compile because ${e}`));
			this.totalTests += expected.length + expectedEvents.length;
			return;
		}

		const timeout = setTimeout(() => {
			console.log(`Test ${testFile} is taking excessively long to complete`);
		}, 1000 * 60);

		const execStart = Date.now();
		const emulatorUnopt = new Emulator(resultVtsUnopt);
		const errUnopt = await emulatorUnopt.execute().catch((e: Error) => e);
		const emulatorOpt = new Emulator(resultVtsOpt);
		const errOpt = await emulatorOpt.execute().catch((e: Error) => e);
		const execEnd = Date.now();
		clearTimeout(timeout);
		this.execTime += execEnd - execStart;

		if (errUnopt) throw errUnopt;
		if (errOpt) throw errOpt;

		this.totalLinesUnopt += emulatorUnopt.totalExecutedEventCount;
		this.totalLinesOpt += emulatorOpt.totalExecutedEventCount;

		let allPass = true;
		expected.forEach((e, i) => {
			this.totalTests++;
			const gvUnopt = emulatorUnopt.getGvByName(e.varName);
			const gvOpt = emulatorOpt.getGvByName(e.varName);
			const passesUnopt = gvUnopt.value == parseInt(e.value);
			const passesOpt = gvOpt.value == parseInt(e.value);
			if (!passesUnopt) console.log(chalk.red(`Unoptimized Test ${testFile} failed on case ${i}, expected ${e.value} but got ${gvUnopt.value}`));
			if (!passesOpt) console.log(chalk.red(`Optimized Test ${testFile} failed on case ${i}, expected ${e.value} but got ${gvOpt.value}`));

			if (!passesUnopt || !passesOpt) allPass = false;
			else this.totalPassed++;
		});

		expectedEvents.forEach((e, i) => {
			this.totalTests++;
			const passesUnopt = emulatorUnopt.executedEvents.some(ev => ev.unitId == e.unitId && ev.method == e.method);
			const passesOpt = emulatorOpt.executedEvents.some(ev => ev.unitId == e.unitId && ev.method == e.method);
			if (!passesUnopt) console.log(chalk.red(`Unoptimized Test ${testFile} failed on event case ${i}, expected ${e.unitId}.${e.method}`));
			if (!passesOpt) console.log(chalk.red(`Optimized Test ${testFile} failed on event case ${i}, expected ${e.unitId}.${e.method}`));

			if (!passesUnopt || !passesOpt) allPass = false;
			else this.totalPassed++;
		});

		if (allPass) console.log(chalk.blueBright(`Test ${testFile} passed (${emulatorOpt.totalExecutedEventCount}/${emulatorUnopt.totalExecutedEventCount})`));
	}
}

export { UnitTester };

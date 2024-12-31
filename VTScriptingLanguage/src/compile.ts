import commandLineArgs, { OptionDefinition } from "command-line-args";
import commandLineUsage, { Section } from "command-line-usage";
import fs from "fs";
import path from "path";
import { Linker } from "./linker.js";
import chalk from "chalk";
import { readVtsFile, writeVtsFile } from "./vtsParser.js";
import { deleteCompilerNodes } from "./compiler/vtsCleaner.js";
import { vars } from "./compiler/compiler.js";

const options: (OptionDefinition & { description: string })[] = [
	{ name: "input", alias: "i", type: String, description: `Input VTSL file` },
	{ name: "output", alias: "o", type: String, description: `Output VTS file` },
	{ name: "vts", type: String, description: `Source VTS to compile into` },
	{ name: "strip", type: String, description: "Deletes all VTSL code from the VTS file, leaving the original VTS" },
	{ name: "debug", alias: "d", type: Boolean, defaultValue: false, description: `Enable debug files` },
	{ name: "opt", type: Number, defaultValue: 2, description: `Sets optimization level (default=2)` },
	{
		name: "no-ir",
		type: Boolean,
		defaultValue: false,
		description: `Skip IR compilation (effectively same as --opt 0, but entirely disables IR logic)`
	},
	{ name: "stack-size", type: Number, defaultValue: 16, description: `Set the stack size for the compiler` },
	{ name: "no-except", type: Boolean, defaultValue: false, description: `Disable stack overflow and OOB objective's from being included in the VTS file` },
	{ name: "help", alias: "h", type: Boolean, defaultValue: false, description: `Print this help message` }
];

// commandLineUsage()
const usage: Section[] = [
	{
		header: "VT Scripting Language",
		content: "Compiler for VTSL files, written in TypeScript."
	},
	{
		header: "Options",
		optionList: options
	}
];

const args = commandLineArgs(options);
const errExit = (msg: string) => {
	console.error(msg);
	process.exit(1);
};

if (args.help || process.argv.length == 2) {
	console.log(commandLineUsage(usage));
	process.exit(0);
}

if (args.strip) {
	if (args.input) errExit("Cannot specify both --strip and --input, --input is for compiling VTSL into VTS, --strip is for removing VTSL from VTS");

	const vtsPath = path.resolve(args.strip);
	if (!fs.existsSync(vtsPath)) errExit(`VTS file does not exist: ${vtsPath}`);

	const vts = readVtsFile(fs.readFileSync(vtsPath, "utf-8"));
	deleteCompilerNodes(vts);

	if (!args.output) console.log(`No output file specified, stripping VTSL from VTS in-place`);
	const outputPath = path.resolve(args.output ?? args.strip);
	fs.writeFileSync(outputPath, writeVtsFile(vts));
	console.log(chalk.green(`Stripping successful, writing to ${outputPath}`));
	process.exit(0);
}

if (!args.input) errExit("No input file specified (--input).");
if (!args.vts) errExit("No VTS file specified (--vts).");
if (!args.output) console.log(`No output file specified, compiling in-place to VTS`);

const inputPath = path.resolve(args.input);
const vtsPath = path.resolve(args.vts);
const outputPath = path.resolve(args.output ?? args.vts);
if (!fs.existsSync(inputPath)) errExit(`Input file does not exist: ${inputPath}`);
if (!fs.existsSync(vtsPath)) errExit(`VTS file does not exist: ${vtsPath}`);

const debug: boolean = args.debug;
const optimize: number = args["opt"];
const skipIR: boolean = args["no-ir"];
const stackSize: number = args["stack-size"];
const noExcept: boolean = args["no-except"];

if (noExcept)
	console.log(
		chalk.yellow(
			`Stack overflow and OOB exceptions disabled, they may silently occur and cause broken behavior. It is encouraged for your mission monitor the GVs "${vars.stackOverflowFlag}" and "${vars.indexOutOfBoundsFlag}".`
		)
	);
if (stackSize < 8) console.log(chalk.yellow(`Very small stack not encouraged, math ops or control logic may overflow`));

const debugPath = path.join(path.dirname(outputPath), "debug");
if (debug) {
	if (!fs.existsSync(debugPath)) fs.mkdirSync(debugPath);
	console.log(`Debugging enabled, outputting debug files to ${debugPath}`);
}

const linker = new Linker();
if (debug) linker.enableDebugIn(debugPath + "/");
const source = fs.readFileSync(inputPath, "utf-8");
const sourceVts = fs.readFileSync(vtsPath, "utf-8");
const { compiledVts, irCompiledVts } = linker.compile(source, sourceVts, {
	continueParseOnError: false,
	optimizationPassCount: optimize,
	skipIR: skipIR,
	onlyAnalyze: false,
	stackSize: stackSize,
	generateExceptionObjectives: !noExcept
});

if (linker.hasErrors) {
	let errors = "Parser errors:\n";
	errors += linker.parserErrors.map(e => `\tError ${e.message} at ${e.line}:${e.column}`).join("\n");
	errors += "\n\nCompiler errors:\n";
	errors += linker.compilerErrors.map(e => `\tError ${e.message} at ${e.node?.line ?? 0}:${e.node?.column ?? 0}`).join("\n");

	console.log(chalk.red(`Compilation failed, ${linker.parserErrors.length + linker.compilerErrors.length} errors found.`));
	console.log(errors);
	process.exit(1);
}

if (!irCompiledVts) {
	console.log(chalk.yellow(`No optimized VTS was generated, using unoptimized`));
}

const resultVts = irCompiledVts ?? compiledVts;
if (!resultVts) {
	errExit(chalk.red("No VTS was generated."));
}

console.log(chalk.green(`Compilation successful, writing to ${outputPath}`));
fs.writeFileSync(outputPath, writeVtsFile(resultVts));

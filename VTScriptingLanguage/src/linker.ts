import { Analyzer } from "./analyzer.js";
import { Parser, ParserError } from "./parser/parser.js";
import fs from "fs";
import { readVtsFile, writeVtsFile } from "./vtsParser.js";
import { Tokenizer } from "./parser/tokenizer.js";
import { Preprocessor } from "./parser/preprocessor.js";
import { Compiler, CompilerError } from "./compiler/compiler.js";
import { IRGenerator } from "./compiler/ir/irGenerator.js";
import { IROptimizer } from "./compiler/ir/irOptimizer.js";
import { IRCompiler } from "./compiler/ir/irCompiler.js";

class Linker {
	public analyzer: Analyzer;
	public parserErrors: ParserError[] = [];
	public compilerErrors: CompilerError[] = [];

	public get hasErrors() {
		return this.parserErrors.length > 0 || this.compilerErrors.length > 0;
	}

	private debugEnabled = false;
	private debugPath = "";

	public compile(source: string, vts: string, onlyAnalyze = false, continueParseOnError = true) {
		const preprocessor = new Preprocessor(source);
		const posCharStream = preprocessor.preprocess();

		const tokenizer = new Tokenizer(posCharStream);
		const tokenStream = tokenizer.parse();
		this.debug("tokens.txt", () => Tokenizer.debug(tokenStream));
		const parser = new Parser(tokenStream, continueParseOnError);
		const ast = parser.parse();
		this.parserErrors = parser.errors;
		this.debug("ast.json", () => JSON.stringify(ast, null, 2));

		const orgVts = readVtsFile(vts);
		this.analyzer = new Analyzer(ast, tokenStream._all(), orgVts);
		this.analyzer.analyze();

		if (onlyAnalyze) return;

		const compiler = new Compiler(ast, orgVts);
		const compiledVts = compiler.compile();
		this.compilerErrors = compiler.errors;
		this.debug("output.vts", () => writeVtsFile(compiledVts));

		if (this.hasErrors) return { compiledVts, irCompiledVts: null };

		const irGenerator = new IRGenerator(compiledVts, compiler.gen.nodeInfos);
		const ir = irGenerator.generateIR();
		this.debug("ir.json", () => JSON.stringify(ir, null, 2));
		this.debug("ir.txt", () => IRGenerator.debug(ir));
		const irOptimizer = new IROptimizer(ir);
		const optimizedIR = irOptimizer.optimize();
		this.debug("optimizedIR.txt", () => IRGenerator.debug(optimizedIR));
		const irCompiler = new IRCompiler(optimizedIR, orgVts);
		const irCompiledVts = irCompiler.compile();
		this.debug("irresult.vts", () => writeVtsFile(irCompiledVts));

		return { irCompiledVts, compiledVts };
	}

	private debug(fname: string, data: string | (() => string)) {
		if (this.debugEnabled) {
			if (typeof data === "function") {
				data = data();
			}

			fs.writeFileSync(this.debugPath + fname, data);
		}
	}

	public enableDebugIn(path: string) {
		this.debugEnabled = true;
		this.debugPath = path;
	}
}

export { Linker };

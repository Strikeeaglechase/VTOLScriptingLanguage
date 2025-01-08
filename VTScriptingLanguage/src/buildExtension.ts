import fs from "fs";
import path from "path";

const lspPath = path.resolve(`../../VTSLLSP/`);
const outputPath = path.resolve(`../../VTSLLanguageExtension/server`);
const compilerPath = path.resolve(`../../VTScriptingLanguage`);

function recursiveDelete(path: string, tl = true) {
	if (!fs.existsSync(path)) return;
	fs.readdirSync(path).forEach(file => {
		const curPath = path + "/" + file;
		if (fs.lstatSync(curPath).isDirectory()) {
			recursiveDelete(curPath, false);
			fs.rmdirSync(curPath);
		} else {
			fs.unlinkSync(curPath);
		}
	});

	if (tl) fs.rmdirSync(path);
}

function recursivelyCopy(src: string, dest: string) {
	if (!fs.existsSync(dest)) fs.mkdirSync(dest);
	const entries = fs.readdirSync(src);
	for (const entry of entries) {
		const srcPath = path.join(src, entry);
		const destPath = path.join(dest, entry);
		if (fs.lstatSync(srcPath).isDirectory()) {
			fs.mkdirSync(destPath);
			recursivelyCopy(srcPath, destPath);
		} else {
			fs.copyFileSync(srcPath, destPath);
		}
	}
}

recursiveDelete(outputPath);
fs.mkdirSync(outputPath);
recursivelyCopy(`${lspPath}/dist`, `${outputPath}/dist`);
recursivelyCopy(`${lspPath}/node_modules`, `${outputPath}/node_modules`);
fs.copyFileSync(`${lspPath}/package.json`, `${outputPath}/package.json`);
fs.copyFileSync(`${lspPath}/package-lock.json`, `${outputPath}/package-lock.json`);

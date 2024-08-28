import { VTNode } from "../vtsParser.js";
import { IR } from "./irGenerator.js";

class IRCompiler {
	constructor(private ir: IR, private vts: VTNode) {}
}

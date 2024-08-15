interface GV {
	name: string;
	id: number;
}

let contextId = 0;
class Context {
	private ctxId = contextId++;
	private gvs: GV[] = [];

	constructor(public parent: Context | null, private idGen: () => number) {}

	public rewriteName(name: string) {
		return `${this.ctxId}_${name}`;
	}

	public hasGV(name: string) {
		const hasLocal = this.gvs.some(gv => gv.name === name);
		if (hasLocal) return true;
		if (this.parent) return this.parent.hasGV(name);
		return false;
	}

	public getGV(name: string): GV {
		const v = this.gvs.find(v => v.name == name);
		if (!v) {
			if (!this.parent) throw new Error(`Variable "${name}" not found`);
			return this.parent.getGV(name);
		}
		return v;
	}

	public addGV(name: string) {
		this.gvs.push({ name: name, id: this.idGen() });
		return this.getGV(name);
	}
}

export { Context, GV };

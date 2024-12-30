interface GV {
	name: string;
	writtenName: string;
	id: number;
}

interface Iterator {
	unitList: string;
	backingGv: GV;
	name: string;
}

// let contextId = 0;
class Context {
	// private ctxId = contextId++;
	private gvs: GV[] = [];
	private iterators: Iterator[] = [];

	constructor(public parent: Context | null, private idGen: () => number, private ctxPrefix: string) {}

	public rewriteName(name: string) {
		return this.ctxPrefix ? `${this.ctxPrefix}_${name}` : name;
	}

	public hasLocalGv(name: string) {
		return this.gvs.some(gv => gv.name === name);
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

	public getGVId(name: string) {
		return this.getGV(name).id;
	}

	public addGV(name: string, forcedId?: number) {
		const localName = this.rewriteName(name);
		if (this.hasLocalGv(name)) throw new Error(`Variable "${name}" already exists`);
		this.gvs.push({ name: name, writtenName: localName, id: forcedId ?? this.idGen() });
		return this.getGV(name);
	}

	public addIterator(unitList: string, name: string, backingGv: GV) {
		if (this.hasIterator(name)) throw new Error(`Iterator "${name}" already exists`);
		// const backingGv = this.addGV(`_iter_${name}`);
		const iter: Iterator = { unitList, backingGv, name };
		this.iterators.push(iter);
		return iter;
	}

	public getIterator(name: string) {
		const it = this.iterators.find(it => it.name === name);
		// We don't check parent iterators as iters are always local
		if (!it) throw new Error(`Iterator "${name}" not found`);
		return it;
	}

	public hasIterator(name: string) {
		return this.iterators.some(it => it.name === name);
	}

	public removeIterator(name: string) {
		const idx = this.iterators.findIndex(it => it.name === name);
		if (idx === -1) throw new Error(`Iterator "${name}" not found`);
		this.iterators.splice(idx, 1);
	}
}

export { Context, GV, Iterator };

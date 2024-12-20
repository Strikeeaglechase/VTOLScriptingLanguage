function isPredicate<T>(value: T | ((arg: T) => boolean)): value is (arg: T) => boolean {
	return typeof value == "function";
}

class Stream<T> {
	private index: number = 0;
	constructor(private items: T[]) {}

	next(): T {
		return this.items[this.index++];
	}

	peek(): T {
		return this.items[this.index];
	}

	// This being required feels bad
	peekOver(): T {
		return this.items[this.index + 1];
	}

	readUntil(value: (arg: T) => boolean): T[];
	readUntil(value: T): T[];
	readUntil(value: T | ((arg: T) => boolean)): T[] {
		const result: T[] = [];
		if (isPredicate(value)) while (!this.eof() && !value(this.peek())) result.push(this.next());
		else while (!this.eof() && this.peek() != value) result.push(this.next());

		return result;
	}

	skipUntil(value: (arg: T) => boolean): void;
	skipUntil(value: T): void;
	skipUntil(value: T | ((arg: T) => boolean)): void {
		if (isPredicate(value)) while (!this.eof() && !value(this.next())) {}
		else while (!this.eof() && this.next() != value) {}
	}

	eof(): boolean {
		return this.index >= this.items.length;
	}

	reset(): void {
		this.index = 0;
	}

	_all(): T[] {
		return this.items;
	}
}

export { Stream };

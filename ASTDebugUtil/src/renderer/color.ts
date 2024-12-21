type ColorValue =
	| number
	| string
	| Color
	| [number, number, number]
	| [number, number, number, number]
	| { r: number; b: number; g: number }
	| { r: number; b: number; g: number; a: number }
	| null
	| undefined;

const numToHex = (value: number): string => {
	const r = Math.floor(value).toString(16);
	return r.length == 2 ? r : "0" + r;
};

class Color {
	r = 0;
	g = 0;
	b = 0;
	a = 255;

	constructor(value?: ColorValue | null) {
		if (value == undefined || value == null) value = 0;
		switch (typeof value) {
			case "number":
				this.r = value;
				this.g = value;
				this.b = value;
				break;
			case "string":
				this.fromHex(value);
				break;
			case "object":
				if (Array.isArray(value)) {
					this.fromArr(value);
				} else {
					this.fromObject(value);
				}
				break;
		}
	}

	get rgb(): string {
		return `rgb(${this.r},${this.g},${this.b})`;
	}

	get rgba(): string {
		return `rgba(${this.r},${this.g},${this.b},${this.a})`;
	}

	get hex(): string {
		return `#${this.arr.map(numToHex).join("")}`;
	}

	get arr(): [number, number, number, number] {
		return [this.r, this.g, this.b, this.a];
	}

	fromHex(hex: string): void {
		this.r = parseInt(hex[1] + hex[2], 16);
		this.g = parseInt(hex[3] + hex[4], 16);
		this.b = parseInt(hex[5] + hex[6], 16);
		if (hex.length == 9) this.a = parseInt(hex[7] + hex[8], 16);
	}

	fromArr(arr: number[]): void {
		this.r = arr[0];
		this.g = arr[1];
		this.b = arr[2];
		if (arr[3] != undefined) this.a = arr[3];
	}

	fromObject(obj: { r: number; g: number; b: number; a?: number }): void {
		this.r = obj.r;
		this.g = obj.g;
		this.b = obj.b;
		if (obj.a != undefined) this.a = obj.a;
	}

	static random(): Color {
		return new Color([Math.random() * 255, Math.random() * 255, Math.random() * 255]);
	}

	static hsl(h: number, s: number, l: number): Color {
		const rgb = Color.hslToRgb(h, s, l);
		return new Color([rgb[0], rgb[1], rgb[2]]);
	}

	static randomHsl(): Color {
		return Color.hsl(Math.random(), 1, 0.5);
	}

	static hslToRgb(h: number, s: number, l: number) {
		let r: number, g: number, b: number;

		if (s === 0) {
			r = g = b = l; // achromatic
		} else {
			const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			const p = 2 * l - q;
			r = Color.hueToRgb(p, q, h + 1 / 3);
			g = Color.hueToRgb(p, q, h);
			b = Color.hueToRgb(p, q, h - 1 / 3);
		}

		return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
	}

	static hueToRgb(p: number, q: number, t: number) {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	}
}
export { Color, ColorValue };

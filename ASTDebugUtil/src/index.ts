import { Linker } from "./compiler/linker.js";
import { AST, getLastPos } from "./compiler/parser/ast.js";
import { Color, ColorValue } from "./renderer/color.js";
import { Renderer } from "./renderer/renderer.js";
let renderer: Renderer;
const code = `define targets: GroundUnitSpawn = (1, 2, 10..17, 5, 18..106);
let a = 1;
let b = 1;
let c = 0;

fn destroyAndAdd(a1, b1, c1) {
	targets[c1].DestroySelf();

	return a1 + b1;

	
}

targets[0].SetMovementSpeed

while (c < 100) {
	
	c = destroyAndAdd(a, b, c);
	a = b;
	b = c;


}`;

let mouseX = 0;
let mouseY = 0;
let mouseDown = false;

function init() {
	renderer = new Renderer("main");
	resize();

	window.addEventListener("resize", resize);
	window.addEventListener("mousemove", e => {
		mouseX = e.clientX;
		mouseY = e.clientY;
	});
	window.addEventListener("mousedown", () => (mouseDown = true));
	window.addEventListener("mouseup", () => (mouseDown = false));

	loop();
}

const x = 15;
const y = 35;
const fontBuff = 5;
const fontSize = 24;
let fontWidth = 0;

const boxXOffset = 0;
const boxYOffset = 3;

function strokeSection(line: number, column: number, lineEnd: number, columnEnd: number, color: ColorValue) {
	const x1 = boxXOffset + x + column * fontWidth;
	const y1 = boxYOffset + y + (line - 1) * (fontSize + fontBuff);
	const x2 = boxXOffset + x + columnEnd * fontWidth;
	const y2 = boxYOffset + y + lineEnd * (fontSize + fontBuff);

	renderer.strokeRect(x1, y1, x2 - x1, y2 - y1, color);
}

function getMouseTextPos() {
	const line = Math.floor((mouseY - y) / (fontSize + fontBuff)) + 1;
	const column = Math.floor((mouseX - x) / fontWidth);
	return { line, column };
}

const nodeTypeColors: Partial<Record<AST.Type, ColorValue>> = {};
let widestType = 0;
let hoveredType: AST.Type = null;

function loop() {
	requestAnimationFrame(loop);
	fontWidth = renderer.textWidth(`W`, fontSize);
	renderer.clear(0);

	const lines = code.split("\n");

	for (let i = 0; i < lines.length; i++) {
		// renderer.drawText(0, i * fontSize, lines[i], fontSize);
		renderer.text(lines[i], x, y + i * (fontSize + fontBuff), 255, fontSize);
	}

	const linker = new Linker();
	linker.compile(code, "", true);

	const mPos = getMouseTextPos();
	strokeSection(mPos.line, mPos.column, mPos.line, mPos.column + 1, Color.hsl(0, 0, 0.5));
	linker.analyzer.flatAst.forEach(ast => {
		const end = getLastPos(ast);
		if (!nodeTypeColors[ast.type]) nodeTypeColors[ast.type] = Color.randomHsl();
		if (hoveredType && ast.type != hoveredType) return;
		if (mouseDown) {
			if (ast.line == end.line) {
				// One line ast node
				if (mPos.line != ast.line - 1) return; // Cursor not on this line
				if (mPos.column < ast.column - 1 || mPos.column >= end.column - 1) return; // Cursor not within node
			} else {
				// Multi line ast node
				if (mPos.line < ast.line - 1 || mPos.line > end.line - 1) return; // Cursor not within node
			}
		}

		strokeSection(ast.line - 1, ast.column - 1, end.line - 1, end.column - 1, nodeTypeColors[ast.type]);
	});

	let curY = 25;
	let newHoveredType = null;
	for (const type in nodeTypeColors) {
		const color = hoveredType == null || hoveredType == type ? nodeTypeColors[type as AST.Type] : Color.hsl(0, 0, 0.5);
		renderer.text(type, renderer.ctx.canvas.width - widestType, curY, color);

		const x1 = renderer.ctx.canvas.width - widestType;
		const y1 = curY - fontSize + fontBuff;
		const x2 = renderer.ctx.canvas.width;
		const y2 = curY + fontBuff + 5;
		// renderer.strokeRect(x1, y1, x2 - x1, y2 - y1, color);
		if (mouseX > x1 && mouseX < x2 && mouseY > y1 && mouseY < y2) {
			newHoveredType = type as AST.Type;
		}

		curY += fontSize + fontBuff;
		widestType = Math.max(widestType, renderer.textWidth(type, fontSize));
	}

	hoveredType = newHoveredType;
}

function resize() {
	renderer.resize(document.body.clientWidth, document.body.clientHeight);
}

window.addEventListener("load", init);

# VT Scripting Language

A programming language that targets VTS, VTOL VR's mission format. More than anything this project exists as an experiment of what is possible, I don't really encourage anyone to rely on it to create missions. Performance testing has not been done at all, I have no idea the impact of very-large VTS files on the game.

-  [Installation](#installation--usage)
-  [Options](#options)
-  [Language Overview](#language)
   -  [Basic Structure](#basic-structure)
   -  [Units](#units)
   -  [Looping](#looping)
   -  [Externals](#externals)

## Installation & Usage

The compiler is within the VTScriptingLanguage folder, to build first make sure you have [NodeJS](https://nodejs.org/en) installed, then run

```bash
npm run build
```

And run the compiler via

```bash
node ./dist/compile.js --input [SOURCE] --vts [SOURCE_VTS]
```

## Options

    -i, --input string    Input VTSL file
    -o, --output string   Output VTS file
    -v, --vts string      Source VTS to compile into
    --strip string        Deletes all VTSL code from the VTS file, leaving the
    							original VTS
    -d, --debug           Enable debug files
    --no-optimize         Disable optimization
    --no-ir               Skip IR compilation (effectively same as --no-optimize,
    							but entirely disables IR logic)
    --stack-size number   Set the stack size for the compiler
    --no-except           Disable stack overflow and OOB objective's from being
    							included in the VTS file
    -h, --help            Print this help message

# Language

VTSL uses C-like syntax, so typical curly braces and semicolons. Generally speaking the only datatype available is a `number` as variables rely on GlobalValue's within VTOL. Other data types are supported only as literals passed directly to methods. Code execution begins at the top of the file and runs downward, there is no `main`

## Basic Structure

Below is the code to kill tanks in order of the fibonacci sequence

```ts
define targets: AIUnitSpawn = (1, 2, 10..17, 5, 18..106);
let a = 1;
let b = 1;
let c = 0;

fn doPartialFib(a2, b2, c2) {
	targets[c2].DestroySelf();

	return a2 + b2;
}

while (c < 100) {
	//c = doPartialFib(a, b, c);
	targets[c].DestroySelf();
	c = a + b;
	a = b;
	b = c;
}
```

All variables are `number`'s and thus don't need a type. Functions are defined with `fn` and likewise do not require a type.

## Functions

Functions are declared via the `fn` keyword, and are created in VTOL as Sequences

```ts
fn myFunction(a, b) {
	return a + b;
}

let result = myFunction(1, 2)
```

You may define a constant id for the generated sequence for cases where you intend to trigger VTSL yourself from custom logic defined in VTOL.

```ts
fn myFunction(a, b) = 42 {
	return a + b;
}
```

The sequence here will have the ID 42

By default the compiler will wait for each function to complete before continuing as you would expect from a synchronous program, however it must introduce extra logic to do this as vtol natively runs sequences asynchronously. If you wish you may disable this safeguard, however this has a **high likelihood of unexpected results**, there still is only one shared stack, asynchronous execution can easily cause bugs.

```ts
fn noWait myFunction(a, b) {

}
```

## Units

Referencing VTOL units is via a "Unit List", which effectively acts like an array of units.

```ts
define targets: AIUnitSpawn = (1, 2, 10..17, 5, 18..106);
```

The above defines a unit list `targets`, units must be typed so that methods can be called on them, in this case `AIUnitSpawn`. After the = you can have a single value, or a comma separated list of values (parentheses only required if you have multiple values). The spread operator defines a range of IDs, so `1..5` would have all the IDs from 1 to 5 inclusive. These IDs should map to the UnitInstanceID in VTOL.

Units can be indexed as expected, however if an index is not provided the method will be called on every unit, so `targets.DestroySelf();` would destroy all units in that list.

For conditional methods (methods that return a bool) if an index is not provided the return ias the logical and of calling the method on every unit.

Many methods require an enum value as an argument, in such cases (for instance `SetMovementSpeed`), simply use the enum like `MoveSpeeds.Slow_10`.

It is important to note that **method arguments must be constant**, this is a limitation of VTOL.

## Looping

`while(cond)`, `for(init, cond, iter)` loops both work as expected. **Recursion does not work**, having a function call itself will (probably) lead to issues.
Iterating over a unit list can be done with the following syntax:

```ts
define targets: AIUnitSpawn = (1, 2, 10..17, 5, 18..106);
forEach(targets as t) {
	// Do something with `t`
}
```

In the above `t` will be set to each unit one by one. In practice this nearly desugars to a plain for loop, however it is somewhat more efficient, but if you want to call the same method on every unity directly calling on the list will be far more efficient.

## Externals

It is possible to interact with GVs and Sequences that you have defined in the VTOL editor with the following:

```js
declare x: GV = 42;
```

In the above `x` will now be accessible as a variable, and it will reference the GV with an ID of 42.

A simple sequence is defined the same way:

```js
declare someAction: Sequence = 42;
```

The above would let you now call the sequence with id 42 via a function call like `someAction()`.

Sequences in vtol execute in an asynchronous order, so by default calling `someAction` would not provide any guarantees about execution order and lead to the program continuing on while the events in someAction are ran. If this is problematic you may declare a "jump flag value" for the program to wait for:

```js
declare someAction: Sequence = (42, 123);
```

Now when `someAction` is called the program will wait until you set the GV `c_jumpFlag` to 123, you must set this or program execution will not resume.

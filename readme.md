# VT Scripting Language

A programming language that targets VTS, VTOL VR's mission format. More than anything this project exists as an experiment of what is possible, I don't really encourage anyone to rely on it to create missions. Performance testing has not been done at all, I have no idea the impact of very-large VTS files on the game.

-  [Installation](#installation--usage)
-  [Options](#options)
-  [Language Overview](#language)
   -  [Basic Structure](#basic-structure)
   -  [Functions](#functions)
   -  [Builtins](#built-in-functions)
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
    --vts string          Source VTS to compile into
    --strip string        Deletes all VTSL code from the VTS file, leaving the
    								original VTS
    -d, --debug           Enable debug files
    --opt number          Sets optimization level (default=2)
    --no-ir               Skip IR compilation (effectively same as --opt 0, but
    								entirely disables IR logic)
    --stack-size number   Set the stack size for the compiler (default=16)
    --no-except           Disable stack overflow and OOB objective's from being
    								included in the VTS file
    -h, --help            Print this help message

# Language

VTSL uses C-like syntax, so typical curly braces and semicolons. Generally speaking the only datatype available is a `number` as variables rely on GlobalValue's within VTOL. Other data types are supported only as literals passed directly to methods. Code execution begins at the top of the file and runs downward, there is no `main`

## Basic Structure

Below is the code to kill tanks in order of the fibonacci sequence

```rust
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

Functions are declared via the `fn` keyword, and are created in VTOL as ConditionalActions

```rust
fn myFunction(a, b) {
	return a + b;
}

let result = myFunction(1, 2)
```

If you would like to reference a function externally (ie to setup a trigger/custom VTOL logic that VTSL doesn't support) you may define a static ID for a function, and a EventSequence will be created for it

```rust
fn myFunction(a, b) = 42 {
	return a + b;
}
```

The sequence here will have the ID 42

Functions can be stored/called via GVs, under the hood this stores the function ID and uses lookup when you call it.

```rust
fn add(a, b) {
	return a + b;
}

let x = add;
let result = x(1, 2);
```

If you set a static sequence ID for the function the function id that's stored in GVs will match that, which may be useful if you want to do arbitrary indexing, ie:

```rust
fn add(a, b) = 12 { return a + b; }
fn sub(a, b) = 13 { return a - b; }

let x = add; // 'x' gets the value '12'
let result = x(1, 2); // result = 3
x += 1; // Increment 'x' to '13'
let result2 = x(1, 2); // result2 = -1
```

## Built in Functions

There are currently two built in functions

`print("message")` will create a display message popup, useful for debugging

`rand(num)` returns true, where `num` is a number 0-100 being the % chance

```rust
if (rand(50)) print("Hello world");
```

The above would have a 50% chance of printing "Hello world"

## Units

Referencing VTOL units is via a "Unit List", which effectively acts like an array of units.

```ts
define targets: AIUnitSpawn = (1, 2, 10..17, 5, 18..106);
```

The above defines a unit list `targets`, units must be typed so that methods can be called on them, in this case `AIUnitSpawn`. After the = you can have a single value, or a comma separated list of values (parentheses only required if you have multiple values). The spread operator defines a range of IDs, so `1..5` would have all the IDs from 1 to 5 inclusive. These IDs should map to the `UnitInstanceID` in VTOL.

Units can be indexed as expected, however if an index is not provided the method will be called on every unit, so `targets.DestroySelf();` would destroy all units in that list.

If you do not provide an index for a conditional method (a method that returns a bool) the default is to return `true` when every unit passes the condition, however the following syntax may be used:

```ts
if (targets.any.SC_IsAlive()) print("Something is alive!");
if (targets.all.SC_IsAlive()) print("Everything is alive!"); // Default behavior
```

Many methods require an enum value as an argument, in such cases (for instance `SetMovementSpeed`), simply use the enum like `MoveSpeeds.Slow_10`.

> [!IMPORTANT]
> It is important to note that **method arguments must be constant**, this is a limitation of VTOL.

## Looping

In order to execute code once per frame create a function named `loop`:

```rust
fn loop() {
	print("Hello World");
}
```

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
declare x: GV = 42; // Reference by id
declare x: GV = "my_gv_x"; // Reference by name
```

In the above `x` will now be accessible as a variable.

A simple sequence is defined the same way:

```js
declare someAction: Sequence = 42; // Reference by id
declare someAction: Sequence = "custom_action"; // Reference by name
```

The above would let you now call the sequence via a function call like `someAction()`.

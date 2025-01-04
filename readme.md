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
    --vts string          Source VTS file to compile into (use "dummy" to compile
    								into a blank vts file)
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

## Arrays

Basic number array's are supported, however come with some limitations. They must be statically sized, and cannot be directly copied or passed as function arguments.

```ts
#define len 10
// Using preprocessor directive to define the length of the array
arr myArray: len;
// or without the macro:
arr myArray: len;

myArray[2] = 42;

for(let i = 0; i < len; i+=1) {
	// Can use variables or expressions as indexes
	x[i] = i;
}
```

> [!NOTE]
> VTOL has no support for array-like structures, instead arrays get generated as a sequence of GVs, and reading/writing to them is done via large if-else statements, this can mean that large arrays generate very-large VTS files and may be bad for game performance.

## Functions

Functions are declared via the `fn` keyword, and are created in VTOL as ConditionalActions

```rust
fn myFunction(a, b) {
	return a + b;
}

let result = myFunction(1, 2)
```

> [!IMPORTANT]
> The `return` keyword does not act as control flow, rather it is only for setting the result of a function, there is no way to "early exit" from a function

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

Most built in functions exist to enable comparisons not typically accessible

```rust
print(message: string): void
rand(chance: number): bool
SCCChance(chance: int): bool
SCCGlobalValue(gv: GlobalValue, comparison: IntComparisons, c_value: int): bool
SCCGlobalValueCompare(gvA: GlobalValue, gvB: GlobalValue, comparison: IntComparisons2): bool
SCCMPTeamStats(team: Teams, statType: StatTypes, comparison: IntComparisons, count: int): bool
SCCStaticObject(objectReference: StaticObjectReference, methodName: string, isNot: bool): bool
SCCUnit(unit: UnitReference, methodName: string, isNot: bool): bool
SCCUnitAlive(unitRef: UnitReference): bool
SCCUnitGroup(methodName: string, isNot: bool): bool
SCCUnitList(unitList: UnitReferenceList, methodName: string, isNot: bool): bool
SCCVehicleControl(vehicleControl: VehicleControlReference, controlCondition: ControlConditions, controlValue: float, isNot: bool): bool
```

Additionally, while not built in the `System` event actions are accessible via the following:

```rust
define systemActions: ScenarioSystemActions = 0;
define tutorialActions: ScenarioTutorialActions = 1;
define globalValueActions: ScenarioGlobalValueActions = 2;
define globalUnitActions: ScenarioGlobalUnitActions = 3;
```

> [!NOTE]
> Arguments to VTOL methods must be literals, this is a restriction of VTOL. This applies to the above built in functions, and all unit methods. Your own custom functions can use variables/expressions as arguments as expected.

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

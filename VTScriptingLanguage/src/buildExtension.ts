import fs from "fs";
import path from "path";

const result = fs.lstatSync(`../../VTSLLSP/src/compiler`);
// const result = fs.opendirSync(`../../VTSLLSP/src/compiler`).readSync();
console.log(path.resolve(`../../VTSLLSP/src/compiler`));
console.log(result.isSymbolicLink());

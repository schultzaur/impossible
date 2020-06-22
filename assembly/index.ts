// The entry file of your WebAssembly module.
import { toString, parseInt } from "./utils"
import { Board } from "./board";
export { Board } from "./board";

export function xor(aStr: string, bStr: string): string {
  return toString((parseInt(aStr) ^ parseInt(bStr)));
}

export function lsh(a: string, b: i32): string {
  return toString(parseInt(a) << b);
}

export function rsh(a: string, b: i32): string {
  return toString(parseInt(a) >> b);
}

export function dateTest(): i32 {
  var a: i64 = Date.now();
  var c: u64 = 0;

  var i: i32 = 0;
  for(i = 0; i < 1000000000; i += 1)
  {
    c += i;

    if (Date.now() - a >= 1000) {
      break;
    }
  }
  
  return i;
}

export function boardFromString(a: string): Board {
  return Board.fromString(a);
}
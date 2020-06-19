// The entry file of your WebAssembly module.

function parseInt(s: string): u64 {
  if (s.startsWith("0x")) {
    return U64.parseInt(s);
  } else {
    return U64.parseInt(s, 16);
  }
}

function toString(i: u64): string {
  return "0x" + ("00000000" + i.toString(16)).slice(-8);
}

export function xor(aStr: string, bStr: string): string {
  return toString((parseInt(aStr) ^ parseInt(bStr)));
}

export function lsh(a: string, b: i32): string {
  return toString(parseInt(a) << b);
}

export function rsh(a: string, b: i32): string {
  return toString(parseInt(a) >> b);
}
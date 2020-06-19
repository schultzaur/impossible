// The entry file of your WebAssembly module.

const BLACK: i32 = 0;
const WHITE: i32 = 0;
const BOARD_SIZE: i32 = 8;

export class BitBoard {
  public blackPieces: u64;
  public whitePieces: u64;

  constructor(blackPieces: i64, whitePieces:i64) {
    this.blackPieces = blackPieces;
    this.whitePieces = whitePieces;
  }

  getPieces(): string {
    return (toString(this.blackPieces) + " " + toString(this.whitePieces));
  }

  move(c: i32, i: i32): BitBoard {
    var mask: u64 = 1 << i;
    if (c == BLACK) {
      return new BitBoard(this.blackPieces | mask, this.whitePieces);
    } else {
      return new BitBoard(this.blackPieces, this.whitePieces | mask);
    }
  }
}

export function getBitBoard(aStr: string, bStr: string): BitBoard {
  return new BitBoard(parseInt(aStr), parseInt(bStr));
}

function parseInt(s: string): u64 {
  if (s.startsWith("0x")) {
    return U64.parseInt(s);
  } else {
    return U64.parseInt(s, 16);
  }
}

function toString(i: u64): string {
  return "0x" + ("0".repeat(16) + i.toString(16)).slice(-16);
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
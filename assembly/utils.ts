import { BLACK, WHITE } from "./constants";

export function oppositeColor(color: i8): i8 {
    return (BLACK + WHITE) - color;
}

export function parseInt(s: string): u64 {
    if (s.startsWith("0x")) {
        return U64.parseInt(s);
    } else {
        return U64.parseInt(s, 16);
    }
}

export function toString(i: u64): string {
    return "0x" + ("0".repeat(16) + i.toString(16)).slice(-16);
}

export function countSetBits(v: u64): f64 {
    // https://graphics.stanford.edu/~seander/bithacks.html#CountBitsSetParallel
    // We start off with every bit counting how many bits are set in each bit.
    // Then every 2 bits counting the bits set in the original 2 bits.
    // Then every 4 bits counting the bits set in the original 4 bits.
    // Then every 8 bits counting the bits set in the original 8 bits.
    // etc...
    //
    // e.g with 2 bits, (v - (v>>1 & 1)) will map:
    //   11 => 11 - 01 = 10 = 2
    //   10 => 10 - 01 = 01 = 1
    //   01 => 01 - 00 = 01 = 1
    //   00 => 00 - 00 = 00 = 0
    //
    // and with 4 bits, (((c >> 2) & 3) + (c & 3)) will map:
    //   1001 => 0010 + 0001 = 0011 = 3
    // 
    // After the second step, the resulting sums can fit within the masks used,
    // and so we don't need to mask each half individually.

    let c = v - ((v >> 1) & 0x5555555555555555);
    c = ((c >> 2) & 0x3333333333333333) + (c & 0x3333333333333333);
    c = ((c >> 4) + c) & 0x0F0F0F0F0F0F0F0F;
    c = ((c >> 8) + c) & 0x00FF00FF00FF00FF;
    c = ((c >> 16) + c) & 0x0000FFFF0000FFFF;
    c = ((c >> 32) + c) & 0x00000000FFFFFFFF;

    return c as f64;
}
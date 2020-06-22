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
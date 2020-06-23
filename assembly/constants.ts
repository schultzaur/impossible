export const BOARD_SIZE: i8 = 8;
export const NUM_PLAYERS: i8 = 2;
export const NUM_SQUARES: i32 = BOARD_SIZE ** 2;

export const EMPTY: i8 = -1
export const BLACK: i8 = 0;
export const WHITE: i8 = 1;

export const EMPTY_CHAR: string = '-';
export const BLACK_CHAR: string = 'B';
export const WHITE_CHAR: string = 'W';

// -9 -8 -7
// -1  X  1
//  7  8  9
export const DIRECTIONS: StaticArray<i8> = StaticArray.fromArray([
    -9 as i8,
    -8 as i8,
    -7 as i8,
    -1 as i8,
    1 as i8,
    7 as i8,
    8 as i8,
    9 as i8,
])
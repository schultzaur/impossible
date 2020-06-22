export const BOARD_SIZE: u8 = 8;
export const NUM_PLAYERS: u8 = 2;
export const NUM_SQUARES: u8 = (BOARD_SIZE ** 2) as u8;

export const EMPTY: i8 = -1
export const BLACK: i8 = 0;
export const WHITE: i8 = 1;

export const EMPTY_CHAR: string = '-';
export const BLACK_CHAR: string = 'B';
export const WHITE_CHAR: string = 'W';

export const DIRECTIONS: StaticArray<i8> = StaticArray.fromArray([
    // TODO 
    -1 as i8,
    -1 as i8,
    -1 as i8,
    -1 as i8,
    -1 as i8,
    -1 as i8,
    -1 as i8,
    -1 as i8,
])
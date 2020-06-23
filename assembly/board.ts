import { BitBoard } from "./bitboard";
import { DIRECTIONS, NUM_SQUARES, EMPTY_CHAR, BLACK_CHAR, BLACK, EMPTY, WHITE_CHAR, WHITE, } from "./constants";
import { oppositeColor, toString, } from "./utils";

export class Board {
    pieces: StaticArray<i8>;
    bitBoard: BitBoard;
  
    constructor(pieces: StaticArray<i8>) {
        this.pieces = pieces;
        this.bitBoard = new BitBoard(pieces);
    }
  
    move(active: i8, square: u8): StaticArray<i8> {
        let newPieces: StaticArray<i8> = StaticArray.slice(this.pieces);
        
        let mask: u64 = 1 << square;
        let opposite: i8 = oppositeColor(active);

        newPieces[square] = active;

        for (let d: i8 = 0; d < DIRECTIONS.length; d++) {
            if (this.bitBoard.directionalMoves[active][d] & mask) {
                Board.directionalMove(newPieces, active, opposite, square, DIRECTIONS[d]);
            }
        }

        return newPieces;
    }

    static directionalMove(pieces: StaticArray<i8>, active: i8, opposite: i8, square: i8, direction: i8): void {
        var moveSquare: i8 = square + direction;

        if (direction % 8) {
            // If there is a horizontal component to the direction, and we we reached
            // the left or right ends of the board, we either wrapped around, or the
            // moveSquare must be one of ours.
            while (moveSquare >= 0 && moveSquare < NUM_SQUARES
                    && pieces[moveSquare] == opposite
                    && moveSquare % 8 != 0 && moveSquare % 8 != 7) {
                pieces[moveSquare] = active;
                moveSquare += direction;
            }
        } else {
            while (moveSquare >= 0 && moveSquare < NUM_SQUARES
                    && pieces[moveSquare] == opposite) {
                pieces[moveSquare] = active;
                moveSquare += direction;
            }
        }
    }

    static fromString(piecesStr: string): Board {
        return new Board(piecesFromString(piecesStr))
    }

    toString(): string {
        let piecesStr: string = "";

        for (let square: i8 = 0; square < NUM_SQUARES; square++) {
            switch(this.pieces[square]) {
                case BLACK:
                    piecesStr += BLACK_CHAR;
                    break;
                case WHITE:
                    piecesStr += WHITE_CHAR;
                    break;
                default:
                    piecesStr += EMPTY_CHAR;
                    break;
            }

            if (square % 8 == 7) {
                piecesStr += " ";
            }
        }

        return piecesStr;
    }

    toMoves(active: i8): string {
        let movesStr: string = "";

        let mask: u64 = 1;
        for (let square: i8 = 0; square < NUM_SQUARES; square++) {
            if (this.bitBoard.moves[active] & mask) {
                movesStr += "X";
            } else {
                movesStr += "O";
            }

            if (square % 8 == 7) {
                movesStr += " ";
            }

            mask <<= 1;
        }

        return movesStr + toString(this.bitBoard.pieces[active]);
    }
}

export function piecesFromString(piecesStr: string): StaticArray<i8> {
    let pieces = new StaticArray<i8>(64);

    for (let square: i8 = 0; square < NUM_SQUARES; square++) {
        if (piecesStr.charAt(square) == BLACK_CHAR) {
            pieces[square] = BLACK;
        } else if (piecesStr.charAt(square) == WHITE_CHAR) {
            pieces[square] = WHITE;
        } else {
            pieces[square] = EMPTY;
        }
    }

    return pieces;
}
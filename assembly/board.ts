import { BitBoard } from "./bitboard";
import { DIRECTIONS, NUM_SQUARES, EMPTY, } from "./constants";
import { oppositeColor, } from "./utils";

export class Board {
    pieces: StaticArray<i8>;
    bitBoard: BitBoard;
    lastMove: i8;
    active: i8;
  
    constructor(pieces: StaticArray<i8>, lastMove: i8) {
        this.pieces = pieces;
        this.bitBoard = new BitBoard(pieces);
        this.lastMove = lastMove;
        this.active = this.getActive(lastMove);
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

    getActive(lastMove: i8): i8 {
        if (lastMove == -1) {
            return EMPTY;
        }

        let lastPlayer: i8 = this.pieces[lastMove];
        let oppositePlayer: i8 = oppositeColor(lastPlayer);

        if (this.bitBoard.moves[oppositePlayer]) {
            return oppositePlayer;
        } else if (this.bitBoard.moves[lastPlayer]) {
            return lastPlayer;
        } else {
            return EMPTY;
        }        
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
}
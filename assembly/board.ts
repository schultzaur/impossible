import { BitBoard } from "./bitboard";
import { DIRECTIONS, NUM_SQUARES, EMPTY_CHAR, BLACK_CHAR, BLACK, EMPTY, WHITE_CHAR, WHITE } from "./constants";

export class Board {
    pieces: StaticArray<i8>;
    bitBoard: BitBoard;
    heuristic: f64;
  
    constructor(pieces: StaticArray<i8>) {
        this.pieces = pieces;
        this.bitBoard = new BitBoard(pieces);
        this.setHeuristic();
    }

    setHeuristic(): void {
        // TODO
        this.heuristic = 0;
    }
  
    move(color: i8, square: i8): Board {
        let newPieces: StaticArray<i8> = StaticArray.slice(this.pieces);

        newPieces[square] = color;

        let mask: u64 = 1 << square;

        for (let d = 0; d < DIRECTIONS.length; d++) {
            if (this.bitBoard.directionalMoves[color][d] & mask) {
                Board.directionalMove(newPieces, color, square, DIRECTIONS[d]);
            }
        }

        return new Board(newPieces);
    }

    static directionalMove(pieces: StaticArray<i8>, c: i8, i: i8, dir: i8): void {
        // Todo
    }

    toString(): string {
        let piecesStr: string = "";

        for (let square: u8 = 0; square < NUM_SQUARES; square++) {
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
        }

        return piecesStr;
    }
  
    // -WB-BW-B 
    static fromString(piecesStr: string): Board {
        let pieces = new StaticArray<i8>(64);

        for (let square: u8 = 0; square < NUM_SQUARES; square++) {
            if (piecesStr.charAt(square) == BLACK_CHAR) {
                pieces[square] = BLACK;
            } else if (piecesStr.charAt(square) == WHITE_CHAR) {
                pieces[square] = WHITE;
            } else {
                pieces[square] = EMPTY;
            }
        }

        return new Board(pieces);
    }
}

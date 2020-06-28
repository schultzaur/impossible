import { Board } from "./board";
import { NUM_SQUARES, BLACK, BLACK_CHAR, WHITE_CHAR, WHITE, EMPTY_CHAR, EMPTY, NUM_PLAYERS, } from "./constants";
import { oppositeColor } from "./utils";
import { AiBoard } from "./ai";

const INVALID_MOVE: string = ":(";

export function doMove(piecesStr: string, active: i8, square: i8): string {
    let board: Board = new Board(piecesFromString(piecesStr), -1);
    let newPieces: StaticArray<i8> = board.move(active, square);

    if (newPieces.length != 64) {
        return INVALID_MOVE;
    }

    let newBoard = new Board(newPieces, square);
    return formatBoard(newBoard);
}

export function getBestMove(piecesStr: string, active: i8): i8 {
    let pieces: StaticArray<i8> = piecesFromString(piecesStr);
    var aiBoard = new AiBoard(pieces, -1, active, oppositeColor(active));
    return aiBoard.getBestMove();
}

function formatBoard(board: Board): string {
    let result: string = board.active.toString()
        + "|" + board.lastMove.toString()
        + "|" + piecesToString(board.pieces);
    
    for (let player: i8 = 0; player < NUM_PLAYERS; player++) {
        result += "|" + formatMoves(board.bitBoard.moves[player]);
    }

    return result;
}

function formatMoves(moves: u64): string {
    let movesStr: string = "";

    for (let square: i8 = 0; square < NUM_SQUARES; square++) {
        movesStr += (moves & 1).toString(2);

        moves >>= 1;
    }

    return movesStr;

    // TODO: figure out what to do here. no reverse in assemblyscript.
    // return ("0".repeat(64) + moves.toString(2)).slice(-64);
}

function piecesToString(pieces: StaticArray<i8>): string {
    let piecesStr: string = "";

    for (let square: i8 = 0; square < NUM_SQUARES; square++) {
        switch(pieces[square]) {
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

function piecesFromString(piecesStr: string): StaticArray<i8> {
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
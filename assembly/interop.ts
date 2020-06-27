import { Board } from "./board";
import { NUM_SQUARES, BLACK, BLACK_CHAR, WHITE_CHAR, WHITE, EMPTY_CHAR, EMPTY, NUM_PLAYERS, } from "./constants";
import { oppositeColor } from "./utils";
import { AiBoard } from "./ai";

export function doMove(piecesStr: string, active: i8, square: i8): string {
    let board: Board = new Board(piecesFromString(piecesStr), -1);
    let newBoard = new Board(board.move(active, square), square);
    return formatBoard(newBoard);
}

export function doBestMove(piecesStr: string, active: i8): string {
    let pieces: StaticArray<i8> = piecesFromString(piecesStr);
    var aiBoard = new AiBoard(pieces, -1, active, oppositeColor(active));
    var newBoard = aiBoard.doBestMove();
    return formatBoard(newBoard);
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
    return "0".repeat(64) + moves.toString(2).slice(-64);
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
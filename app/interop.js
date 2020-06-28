import { Game, getIndex, BOARD_SIZE, Colors } from "./othello";

const BLACK_CHAR = "B";
const WHITE_CHAR = "W";
const EMPTY_CHAR = "-";
const INVALID_MOVE = ":(";

function getEmptyBoard() {
    return new Array(BOARD_SIZE).fill(0).map(() => new Array(BOARD_SIZE).fill(Colors.None));
}

function parseActive(activeStr) {
    switch(activeStr) {
        case "0":
            return Colors.Black;
        case "1":
            return Colors.White;
        case "-1":
        default:
            return Colors.None;
    }
}

function activeToString(active) {
    switch(active) {
        case Colors.Black:
            return "0";
        case Colors.White:
            return "1";
        case Colors.None:
        default:
            return "-1";
    }
}

function parseLastMove(m) {
    let square = parseInt(m);

    if (square == -1) {
        return [-1, -1];
    }

    return [Math.floor(square / BOARD_SIZE), square % BOARD_SIZE];
}

function lastMoveToString(m) {
    return getIndex(m[0], m[1]).toString();
}

function parsePieces(piecesStr) {
    let pieces = getEmptyBoard();

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            switch(piecesStr.charAt(getIndex(row, col))) {
                case BLACK_CHAR:
                    pieces[row][col] = Colors.Black;
                    break;
                case WHITE_CHAR:
                    pieces[row][col] = Colors.White;
                    break;
            }
        }
    }

    return pieces;
}

export function piecesToString(pieces) {
    let piecesStr = "";
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            switch(pieces[row][col]) {
                case Colors.Black:
                    piecesStr += BLACK_CHAR;
                    break;
                case Colors.White:
                    piecesStr += WHITE_CHAR;
                    break;
                case Colors.None:
                default:
                    piecesStr += EMPTY_CHAR;
                    break;
            }
        }
    }

    return piecesStr;
}

function parseMoves(movesStr, color) {
    let moves = getEmptyBoard();
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (movesStr.charAt(getIndex(row, col)) == "1") {
                moves[row][col] = color;
            }
        }
    }

    return moves
}

function movesToString(moves) {
    let movesStr = "";
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            switch(moves[row][col]) {
                case Colors.Black:
                    movesStr += "1";
                    break;
                case Colors.White:
                    movesStr += "1";
                    break;
                case Colors.None:
                default:
                    movesStr += "0";
                    break;
            }
        }
    }

    return movesStr;
}
    
export function boardToString(game) {
    return `${activeToString(game.turn)}|${lastMoveToString(game.lastMove)}|${piecesToString(game.pieces)}`
        + `|${movesToString(game.validMoves[Colors.Black])}|${movesToString(game.validMoves[Colors.White])}`;
}

export function parseBoard(boardStr, player) {
    if (boardStr == INVALID_MOVE) {
        return null;
    }

    let tokens = boardStr.split("|");

    return new Game(
        parsePieces(tokens[2]),
        {
            [Colors.Black]: parseMoves(tokens[3], Colors.Black),
            [Colors.White]: parseMoves(tokens[4], Colors.White),
        },
        player,
        parseActive(tokens[0]),
        parseLastMove(tokens[1])
    );
}

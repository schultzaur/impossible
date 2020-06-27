import { Board } from "../docs/renegade/othello";

export const BOARD_SIZE = 8;

export const Players = {
    Player: 1,
    CPU: 2,
}

export const Colors = {
    Black: 0,
    White: 1,
    None: 2,
}

const BLACK_CHAR = "B";
const WHITE_CHAR = "W";
const EMPTY_CHAR = "-";

const newGameStr =
    "0"
    + "|-1"
    + "|---------------------------WB------BW---------------------------"
    + "|0000000000000000000100000010000000000100000010000000000000000000"
    + "|0000000000000000000010000000010000100000000100000000000000000000";


function getEmptyBoard() {
    return new Array(BOARD_SIZE).fill(0).map(() => new Array(BOARD_SIZE).fill(Colors.None));
}

function parseActive(a) {
    switch(a) {
        case "0":
            return Colors.Black;
        case "1":
            return Colors.White;
        case "-1":
        default:
            return Colors.None;
    }
}

function toActive(a) {
    switch(a) {
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

function toLastMove(m) {
    return getIndex(m[0], m[1]).toString();
}

function parsePieces(s) {
    let pieces = getEmptyBoard();

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            switch(s.charAt(getIndex(row, col))) {
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

function toPieces(pieces) {
    let s = "";
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            switch(pieces[row][col]) {
                case Colors.Black:
                    s += BLACK_CHAR;
                    break;
                case Colors.White:
                    s += WHITE_CHAR;
                    break;
                case Colors.None:
                default:
                    s += EMPTY_CHAR;
                    break;
            }
        }
    }

    return s;
}

function parseMoves(s, c) {
    let moves = getEmptyBoard();

    // TODO - reverse the flip (?)
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (s.charAt(63-getIndex(row, col)) == "1") {
                moves[row][col] = c;
            }
        }
    }

    return moves
}

function toMoves(moves) {
    let s = "";
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            switch(moves[row][col]) {
                case Colors.Black:
                    s += "1";
                    break;
                case Colors.White:
                    s += "1";
                    break;
                case Colors.None:
                default:
                    s += "0";
                    break;
            }
        }
    }

    return s;
}

export class Game {
    constructor(pieces, validMoves, playerColor, turnColor, lastMove) {
        this.pieces = pieces;
        this.validMoves = validMoves;
        this.player = playerColor;
        this.turn = turnColor;
        this.lastMove = lastMove;
    }

    static getNewGame(p) {
        return Game.parseBoard(newGameStr, p);
    }
    
    static parseBoard(b, p) {
        let tokens = b.split("|");
        
        return new Game(
            parsePieces(tokens[2]),
            {
                [Colors.Black]: parseMoves(tokens[3], Colors.Black),
                [Colors.White]: parseMoves(tokens[4], Colors.White),
            },
            p,
            parseActive(tokens[0]),
            parseLastMove(tokens[1])
        );
    }

    toString() {
        let s = "";

        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                if (this.pieces[row][col] == Colors.Black) {
                    s += "B"
                } else if (this.pieces[row][col] == Colors.White) {
                    s += "W"
                } else {
                    s += "-"
                }
            }
        }

        return s;        
    }

    getGameLink() {
        var path;
        if (document.baseURI.indexOf("127.0.0.1") > -1) {
            path = "./renegade.html";
        } else {
            path = "./renegade";
        }

        let board = `${toActive(this.active)}|${toLastMove(this.lastMove)}|${toPieces(this.pieces)}`
            + `|${toMoves(this.validMoves[Colors.Black])}|${toMoves(this.validMoves[Colors.Black])}`;

        path += `?board=${board}&player=${this.player}`

        return new URL(path, document.baseURI).href;
    }

    static fromGameLink(urlParams) {
        try {
            var board = urlParams.get('board');
            var player = JSON.parse(urlParams.get('player'));

            if (board && player) {
                return Game.parseBoard(board, player);
            }
        }
        catch (error) {
            console.log(error);
        }
        
        return Game.getNewGame();
    }
}

export function getOppositeColor(color) {
    return color === Colors.White ? Colors.Black : Colors.White;
}

export function getIndex(row, col) {
    return row * BOARD_SIZE + col;
}
import { parseBoard, boardToString } from "./interop";

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

const newGameStr =
    "0"
    + "|-1"
    + "|---------------------------WB------BW---------------------------"
    + "|0000000000000000000100000010000000000100000010000000000000000000"
    + "|0000000000000000000010000000010000100000000100000000000000000000";

export class Game {
    constructor(pieces, validMoves, playerColor, turnColor, lastMove) {
        this.pieces = pieces;
        this.validMoves = validMoves;
        this.player = playerColor;
        this.turn = turnColor;
        this.lastMove = lastMove;
    }

    static getNewGame(p) {
        return parseBoard(newGameStr, p);
    }

    getGameLink() {
        var path;
        if (document.baseURI.indexOf("127.0.0.1") > -1 || document.baseURI.indexOf("localhost")) {
            path = "./renegade.html";
        } else {
            path = "./renegade";
        }

        path += `?board=${boardToString(this)}&player=${this.player}`;

        return new URL(path, document.baseURI).href;
    }

    static fromGameLink(urlParams) {
        try {
            var board = urlParams.get('board');
            var player = urlParams.get('player');

            if (board && player) {
                return parseBoard(board, parseInt(player));
            }
        }
        catch (error) {
            console.log(error);
        }
        
        return Game.getNewGame(Colors.Black);
    }
}

export function getOppositeColor(color) {
    return color === Colors.White ? Colors.Black : Colors.White;
}

export function getIndex(row, col) {
    return row * BOARD_SIZE + col;
}
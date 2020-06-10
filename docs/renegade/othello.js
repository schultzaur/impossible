export const BOARD_SIZE = 8;

export const Colors = {
    None: 0,
    White: 1,
    Black: 2,
}

export const Player = {
    Player: 1,
    CPU: 2,
}

export function getEmptyBoard() {
    return new Array(BOARD_SIZE).fill(0).map(() => new Array(BOARD_SIZE).fill(Colors.None));
}

export function getNewBoard() {
    var board = getEmptyBoard();

    var middle = Math.floor(BOARD_SIZE/2) - 1;

    board[middle  ][middle  ] = Colors.White;
    board[middle  ][middle+1] = Colors.Black;
    board[middle+1][middle  ] = Colors.Black;
    board[middle+1][middle+1] = Colors.White;

    return board;
}

export function getOppositeColor(color) {
    return color === Colors.White ? Colors.Black : Colors.White;
}

export function getIndex(row, col) {
    return row * BOARD_SIZE + col;
}

export function getRowCol(index) {
    return [Math.floor(index / BOARD_SIZE), index % BOARD_SIZE];
}

export function onBoard(row, col) {
    return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

const directions = [
    [-1,-1],
    [-1, 0],
    [-1, 1],
    [ 0,-1],
    [ 0, 1],
    [ 1,-1],
    [ 1, 0],
    [ 1, 1],
];

export class Board {
    constructor (board) {
        this.board = (typeof board !== 'undefined') ? board : getNewBoard();
    }

    copy() {
        var newBoard = new Array(BOARD_SIZE);

        for (var row = 0; row < 8; row++) {
            newBoard[row] = new Array(BOARD_SIZE);
            for (var col = 0; col < 8; col++) {
                newBoard[row][col] = this.board[row][col];
            }
        }

        return new Board(newBoard);
    }

    getValidMoves(color) {
        var validMoves = getEmptyBoard();

        for (var row = 0; row < 8; row++) {
            for (var col = 0; col < 8; col++) {
                if (this.isValidMove(row, col, color)) {
                    validMoves[row][col] = color;
                }
            }
        }
       
        return validMoves;
    }

    isValidMove(row, col, color) {
        var oppositeColor = getOppositeColor(color);

        if (this.board[row][col] === color || this.board[row][col] === oppositeColor) {
            return false;
        }

        return directions.some(direction => this.isValidCaptureDirection(row, col, direction, color, oppositeColor));
    }

    isValidCaptureDirection(row, col, direction, color, oppositeColor) {
        var pieceCaptured = false;

        var capRow = row + direction[0];
        var capCol = col + direction[1];

        while (onBoard(capRow, capCol)) {
            if (this.board[capRow][capCol] === oppositeColor) {
                pieceCaptured = true;
            } else {
                break;
            }

            capRow += direction[0];
            capCol += direction[1];
        }

        return pieceCaptured && onBoard(capRow, capCol) && this.board[capRow][capCol] === color;
    }

    move(row, col, color, oppositeColor) {
        var pieceCaptured = false;
        var newBoard = this.copy();
        
        directions.forEach(direction => {
            if (newBoard.isValidCaptureDirection(row, col, direction, color, oppositeColor)) {
                pieceCaptured = true;
                var capRow = row + direction[0];
                var capCol = col + direction[1];

                while (onBoard(capRow, capCol) && newBoard.board[capRow][capCol] !== color) {
                    newBoard.board[capRow][capCol] = color
                    capRow += direction[0];
                    capCol += direction[1];
                }
            }
        })
        
        if (pieceCaptured) {
            newBoard.board[row][col] = color;
            return newBoard;
        }

        return false;
    }
}

export class Game {
    constructor(board, turn, validMoves, lastMove) {
        this.board = (typeof board !== 'undefined') ? board : new Board();
        this.turn = (typeof turn !== 'undefined') ? turn : Colors.Black;
        this.validMoves = (typeof validMoves !== 'undefined') ? validMoves : this.board.getValidMoves(this.turn);
        this.lastMove = (typeof lastMove !== 'undefined') ? lastMove : [-1,-1];
    }

    move(row, col) {
        if (!this.board.isValidMove(row, col, this.turn)) {
            return false;
        }

        var oppositeTurn = getOppositeColor(this.turn)
        var newBoard = this.board.move(row, col, this.turn, oppositeTurn);;

        var nextTurn = null;
        var validMoves = newBoard.getValidMoves(oppositeTurn);
        if (validMoves) {
            nextTurn = oppositeTurn;
        } else {
            validMoves = newBoard.getValidMoves(this.turn);
            if (validMoves) {
                nextTurn = this.turn;
            }
        }
        
        return new Game(newBoard, nextTurn, validMoves, [row, col]);
    }

    findBestMove() {

    }
}
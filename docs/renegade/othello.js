export const BOARD_SIZE = 8;

export const Colors = {
    None: 0,
    White: 1,
    Black: 2,
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

export function isValidCaptureDirection(board, row, col, direction, color, oppositeColor) {
    var pieceCaptured = false;

    var capRow = row + direction[0];
    var capCol = col + direction[1];

    while (onBoard(capRow, capCol)) {
        if (board[capRow][capCol] === oppositeColor) {
            pieceCaptured = true;
        } else {
            break;
        }

        capRow += direction[0];
        capCol += direction[1];
    }

    return pieceCaptured && onBoard(capRow, capCol) && board[capRow][capCol] === color;
}

export function getValidMoves(board, color) {
    var validMoves = new Array();

    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            if (isValidMove(board, row, col, color)) {
                validMoves.push([row, col]);
            }
        }
    }
   
    return validMoves;
}


export function isValidMove(board, row, col, color) {
    if (!onBoard(row, col)) {
        return false;
    }
    
    var oppositeColor = getOppositeColor(color);

    if (board[row][col] === color || board[row][col] === oppositeColor) {
        return false;
    }

    return directions.some(direction => isValidCaptureDirection(board, row, col, direction, color, oppositeColor));
}


export class Board {
    constructor (board) {
        this.board = (typeof board !== 'undefined') ? board : getNewBoard();
        this.validMoves = {
            [Colors.White]: getValidMoves(this.board, Colors.White),
            [Colors.Black]: getValidMoves(this.board, Colors.Black),
        };
    }

    copyBoard() {
        var newBoard = new Array(BOARD_SIZE);

        for (var row = 0; row < 8; row++) {
            newBoard[row] = new Array(BOARD_SIZE);
            for (var col = 0; col < 8; col++) {
                newBoard[row][col] = this.board[row][col];
            }
        }

        return newBoard;
    }

    move(row, col, color, oppositeColor) {
        var pieceCaptured = false;
        var newBoard = this.copyBoard();
        
        directions.forEach(direction => {
            if (isValidCaptureDirection(newBoard, row, col, direction, color, oppositeColor)) {
                pieceCaptured = true;
                var capRow = row + direction[0];
                var capCol = col + direction[1];

                while (onBoard(capRow, capCol) && newBoard[capRow][capCol] !== color) {
                    newBoard[capRow][capCol] = color
                    capRow += direction[0];
                    capCol += direction[1];
                }
            }
        })
        
        if (pieceCaptured) {
            newBoard[row][col] = color;
            return new Board(newBoard);
        }

        return false;
    }
}
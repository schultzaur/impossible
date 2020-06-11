export const BOARD_SIZE = 8;

export const Colors = {
    None: 0,
    White: 1,
    Black: 2,
}

export function getEmptyBoard() {
    return new Array(BOARD_SIZE).fill(0).map(() => new Array(BOARD_SIZE).fill(Colors.None));
}

export function getNewPieces() {
    var pieces = getEmptyBoard();

    var middle = Math.floor(BOARD_SIZE/2) - 1;

    pieces[middle  ][middle  ] = Colors.White;
    pieces[middle  ][middle+1] = Colors.Black;
    pieces[middle+1][middle  ] = Colors.Black;
    pieces[middle+1][middle+1] = Colors.White;

    return pieces;
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

export function isValidCaptureDirection(pieces, row, col, direction, color, oppositeColor) {
    var pieceCaptured = false;

    var capRow = row + direction[0];
    var capCol = col + direction[1];

    while (onBoard(capRow, capCol)) {
        if (pieces[capRow][capCol] === oppositeColor) {
            pieceCaptured = true;
        } else {
            break;
        }

        capRow += direction[0];
        capCol += direction[1];
    }

    return pieceCaptured && onBoard(capRow, capCol) && pieces[capRow][capCol] === color;
}

export function getValidMoves(pieces, color) {
    var validMoves = new Array();

    for (var row = 0; row < 8; row++) {
        for (var col = 0; col < 8; col++) {
            if (isValidMove(pieces, row, col, color)) {
                validMoves.push([row, col]);
            }
        }
    }
   
    return validMoves;
}


export function isValidMove(pieces, row, col, color) {
    if (!onBoard(row, col) || pieces[row][col] != Colors.None) {
        return false;
    }
    
    var oppositeColor = getOppositeColor(color);

    return directions.some(direction => isValidCaptureDirection(pieces, row, col, direction, color, oppositeColor));
}


export class Board {
    constructor (pieces) {
        this.pieces = (typeof pieces !== 'undefined') ? pieces : getNewPieces();
        this.validMoves = {
            [Colors.White]: getValidMoves(this.pieces, Colors.White),
            [Colors.Black]: getValidMoves(this.pieces, Colors.Black),
        };
    }

    copyPieces() {
        var newPieces = new Array(BOARD_SIZE);

        for (var row = 0; row < 8; row++) {
            newPieces[row] = new Array(BOARD_SIZE);
            for (var col = 0; col < 8; col++) {
                newPieces[row][col] = this.pieces[row][col];
            }
        }

        return newPieces;
    }

    move(row, col, color, oppositeColor) {
        var pieceCaptured = false;
        var newPieces = this.copyPieces();
        
        directions.forEach(direction => {
            if (isValidCaptureDirection(newPieces, row, col, direction, color, oppositeColor)) {
                pieceCaptured = true;
                var capRow = row + direction[0];
                var capCol = col + direction[1];

                while (onBoard(capRow, capCol) && newPieces[capRow][capCol] !== color) {
                    newPieces[capRow][capCol] = color
                    capRow += direction[0];
                    capCol += direction[1];
                }
            }
        })
        
        if (pieceCaptured) {
            newPieces[row][col] = color;
            return newPieces;
        }

        return false;
    }
}
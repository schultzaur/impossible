import * as othello from './othello.js';

const DEPTH = 6;
const BRANCHING_FACTOR = 10;

const PARITY_WEIGHT = 10;
const MOBILITY_WEIGHT = 30;
const CORNER_WEIGHT = 25;
const STABILITY_WEIGHT = 30;

// row, col, line start direction, line direction.
const corners = [
    [0,                    0,                    [ 0,  1],  [1,  0]],
    [0,                    othello.BOARD_SIZE-1, [ 1,  0],  [0, -1]],
    [othello.BOARD_SIZE-1, othello.BOARD_SIZE-1, [ 0, -1], [-1,  0]],
    [othello.BOARD_SIZE-1, 0,                    [-1,  0], [ 0,  1]],
];

function countCoins(board, color) {
    var coins = 0;

    for (var row = 0; row < othello.BOARD_SIZE; row++) {
        for (var col = 0; col < othello.BOARD_SIZE; col++) {
            if (board[row][col] === color) {
                coins += 1;
            }
        }
    }

    return coins;
}

function countCorners(board, validMoves, color) {
    var cornerScore = 0;
    corners.forEach(corner => {
        if (board[corner[0]][corner[1]] === color) {
            cornerScore += 2
        }
        if (validMoves.some(validMove => corner[0] == validMove[0] && corner[1] == validMove[1])) {
            cornerScore += 1
        }
    })
    return cornerScore;
}

function countStable(board, color) {
    var stability = new Array(othello.BOARD_SIZE).fill(0).map(() => new Array(othello.BOARD_SIZE).fill(0));

    corners.forEach(corner => {
        var lineStartRow = corner[0];
        var lineStartCol = corner[1];
        var lineStartDir = corner[2];
        var lineDir = corner[3];

        while (othello.onBoard(lineStartRow, lineStartCol) &&
            board[lineStartRow][lineStartCol] === color) {
            
            var lineRow = lineStartRow;
            var lineCol = lineStartCol;

            var first = true;
            while (true) {
                var stableCheckRow = lineRow - lineStartDir[0] + (first ? 0 : lineDir[0]); 
                var stableCheckCol = lineCol - lineStartDir[1] + (first ? 0 : lineDir[1]); 

                if (!othello.onBoard(lineRow, lineCol)
                    || board[lineRow][lineCol] !== color
                    || stability[lineRow][lineCol]
                    || (othello.onBoard(stableCheckRow, stableCheckCol) && !stability[stableCheckRow][stableCheckCol]))
                {
                    break;
                }

                stability[lineRow][lineCol] = 1;

                lineRow += lineDir[0];
                lineCol += lineDir[1];
            }

            lineStartRow += lineStartDir[0];
            lineStartCol += lineStartDir[1];
        }
    })

    var stableSum = 0;
    for (var row = 0; row < othello.BOARD_SIZE; row++) {
        for (var col = 0; col < othello.BOARD_SIZE; col++) {
            stableSum += stability[row][col];
        }
    }
    return stableSum;
}

function heuristic(board, maxColor, minColor) {
    var minColor = othello.getOppositeColor(maxColor);
    
    var maxParity = countCoins(board.board, maxColor)
    var minParity = countCoins(board.board, minColor)
    var parity = 100 * (maxParity - minParity) / (maxParity + minParity)

    var maxValidMoves = board.validMoves[maxColor];
    var minValidMoves = board.validMoves[minColor];
    var maxMobility = maxValidMoves.length;
    var minMobility = minValidMoves.length;
    var mobility = 0;
    if (maxMobility + minMobility == 0) {
        // Games over. 
        return maxParity > minParity ? Infinity : -Infinity;
    } else {
        mobility = 100 * (maxMobility - minMobility) / (maxMobility + minMobility)
    }
    
    var maxCorner = countCorners(board.board, maxValidMoves, maxColor)
    var minCorner = countCorners(board.board, minValidMoves, minColor)
    var corner = 0
    if (maxCorner + minCorner != 0) {
        corner = 100 * (maxCorner - minCorner) / (maxCorner + minCorner)
    }

    var maxStable = countStable(board.board, maxColor)
    var minStable = countStable(board.board, minColor)
    var stable = 0
    if (maxStable + minStable != 0) {
        stable = 100 * (maxStable - minStable) / (maxStable + minStable)
    }

    var mobilityWeight, stabilityWeight, parityWeight, cornerWeight;
    if (maxParity + minParity < 30) {
        mobilityWeight = 2 * MOBILITY_WEIGHT;
        stabilityWeight = 2 * STABILITY_WEIGHT;

        parityWeight = -PARITY_WEIGHT;

        cornerWeight = CORNER_WEIGHT;
    } else if (maxParity + minParity > 50) {
        stabilityWeight = 4 * STABILITY_WEIGHT;
        cornerWeight = 2 * CORNER_WEIGHT;

        mobilityWeight = MOBILITY_WEIGHT;
        parityWeight = PARITY_WEIGHT;
    } else {
        parityWeight = 0 * PARITY_WEIGHT;
        mobilityWeight = MOBILITY_WEIGHT;
        cornerWeight = CORNER_WEIGHT;
        stabilityWeight = STABILITY_WEIGHT;
    }

    return [
        parityWeight * parity
            + mobilityWeight * mobility
            + cornerWeight * corner
            + stabilityWeight * stable,
        parity,
        mobility,
        corner,
        stable];
}

function minimax(board, boardScore, maxColor, minColor, depth, currentColor) {
    var oppositeColor = othello.getOppositeColor(currentColor);
    if (!board.validMoves[currentColor].length > 0) {
        if (board.validMoves[oppositeColor].length > 0) {
            currentColor = oppositeColor;
        } else {
            return [boardScore, [-1, -1]]
        }
    }

    if (depth == DEPTH)
    {
        return [boardScore, [-1, -1]]
    }

    var value, move;
    if (currentColor == maxColor) {
        value = -Infinity;
        move = [-1, -1];

        var candidates = []
        board.validMoves[maxColor].forEach(validMove => {
            var candidateBoard = board.move(validMove[0], validMove[1], maxColor, minColor);
            var score = heuristic(board, maxColor, minColor)[0];

            candidates.push([score, validMove, candidateBoard])
        })
        candidates.sort(function(a, b) { return b[0]-a[0]; });

        candidates.slice(0, BRANCHING_FACTOR).forEach(candidate => {
            if (move[0] == -1) {
                move = candidate[1]
            };

            var mm = minimax(candidate[2], candidate[0], maxColor, minColor, depth + 1, othello.getOppositeColor(currentColor));
            if (mm[0] >= value) {
                value = mm[0];
                move = candidate[1]
            };
        })

        return [value, move]
    } else {
        value = Infinity;
        move = [-1, -1];

        var candidates = []
        board.validMoves[minColor].forEach(validMove => {
            var candidateBoard = board.move(validMove[0], validMove[1], minColor, maxColor);
            var score = heuristic(board, maxColor, minColor)[0];

            candidates.push([score, validMove, candidateBoard])
        })
        candidates.sort(function(a, b) { return a[0]-b[0]; });

        candidates.slice(0, BRANCHING_FACTOR).forEach(candidate => {
            if (move[0] == -1) {
                move = candidate[1]
            };

            var mm = minimax(candidate[2], candidate[0], maxColor, minColor, depth + 1, othello.getOppositeColor(currentColor));
            if (mm[0] <= value) {
                value = mm[0];
                move = candidate[1]
            }
        })

        return [value, move]
    }
}

export function findBestMove(board, maxColor) {
    var minColor = othello.getOppositeColor(maxColor);
    var boardScore = heuristic(board, maxColor, minColor);
    var mm = minimax(board, boardScore[0], maxColor, minColor, 0, maxColor);

    console.log(boardScore, mm);
    return mm[1];
}
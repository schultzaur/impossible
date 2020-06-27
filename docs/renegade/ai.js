import * as othello from './othello.js';

const DEPTH = 6;
const BRANCHING_FACTOR = 8;

const PARITY_WEIGHT = 10;
const MOBILITY_WEIGHT = 30;
const CORNER_WEIGHT = 25;
const STABILITY_WEIGHT = 30;

// row, col, line start direction, line direction.
const CORNERS = [
    [0,                    0,                    [ 0,  1],  [1,  0]],
    [0,                    othello.BOARD_SIZE-1, [ 1,  0],  [0, -1]],
    [othello.BOARD_SIZE-1, othello.BOARD_SIZE-1, [ 0, -1], [-1,  0]],
    [othello.BOARD_SIZE-1, 0,                    [-1,  0], [ 0,  1]],
];

const STABLE_ORDER_GRID = [
    [ 0,  4, 12, 24, 29, 17,  9,  1],
    [ 8, 20, 32, 40, 45, 37, 21,  5],
    [16, 36, 48, 52, 57, 49, 33, 13],
    [28, 44, 56, 60, 61, 53, 41, 25],
    [27, 43, 55, 63, 62, 58, 46, 30],
    [15, 35, 51, 59, 54, 50, 38, 18],
    [ 7, 23, 39, 47, 42, 34, 22, 10],
    [ 3, 11, 19, 31, 26, 14,  6,  2],
];
const STABLE_ORDER = new Array(64);

for (var row = 0; row < 8; row++) {
    for (var col = 0; col < 8; col++) {
        STABLE_ORDER[STABLE_ORDER_GRID[row][col]] = [row, col]; 
    }
}

class AiBoard extends othello.Board
{
    constructor(pieces, lastMove, maxColor, minColor) {
        super(pieces);

        this.lastMove = lastMove;
        this.maxColor = maxColor;
        this.minColor = minColor;
        this.heuristic = this.getHeuristic();
        
        if (othello.onBoard(lastMove[0], lastMove[1])) {
            var lastPlayer = this.pieces[lastMove[0]][lastMove[1]];
            var currentPlayer = othello.getOppositeColor(lastPlayer);

            if (this.validMoves[currentPlayer].length == 0) {
                if (this.validMoves[lastPlayer].length > 0) {
                    currentPlayer = lastPlayer;
                } else {
                    currentPlayer = othello.Colors.None;
                }
            }

            this.currentColor = currentPlayer;
        } else {
            this.currentColor = maxColor;
        }
    }

    move(move) {
        var pieces = super.move(move[0], move[1], this.currentColor, othello.getOppositeColor(this.currentColor));

        if (pieces) {
            return new AiBoard(pieces, move, this.maxColor, this.minColor);
        }

        throw console.error("oops");
    }

    getHeuristic() {
        var maxParity = this.countCoins(this.maxColor)
        var minParity = this.countCoins(this.minColor)
        var parity = 100 * (maxParity - minParity) / (maxParity + minParity)
    
        var maxMobility = this.validMoves[this.maxColor].length;
        var minMobility = this.validMoves[this.minColor].length;
        var mobility = 0;
        if (maxMobility + minMobility == 0) {
            // Games over. 
            return [maxParity > minParity ? Infinity : -Infinity];
        } else {
            mobility = 100 * (maxMobility - minMobility) / (maxMobility + minMobility)
        }
        
        var maxCorner = this.countCorners(this.maxColor)
        var minCorner = this.countCorners(this.minColor)
        var corner = 0
        if (maxCorner + minCorner != 0) {
            corner = 100 * (maxCorner - minCorner) / (maxCorner + minCorner)
        }
    
        var maxStable = this.countStable(this.maxColor)
        var minStable = this.countStable(this.minColor)
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

    countCoins(color) {
        var coins = 0;
    
        for (var row = 0; row < othello.BOARD_SIZE; row++) {
            for (var col = 0; col < othello.BOARD_SIZE; col++) {
                if (this.pieces[row][col] === color) {
                    coins += 1;
                }
            }
        }
    
        return coins;
    }

    countCorners(color) {
        var cornerScore = 0;
        CORNERS.forEach(corner => {
            if (this.pieces[corner[0]][corner[1]] === color) {
                cornerScore += 2
            }
            if (this.validMoves[color].some(validMove => corner[0] == validMove[0] && corner[1] == validMove[1])) {
                cornerScore += 1
            }
        })
        return cornerScore;
    }
    
    countStable(color) {
        return 0;
        var stability = othello.getEmptyBoard();

        CORNERS.forEach(corner => {
            var lineStartRow = corner[0];
            var lineStartCol = corner[1];
            var lineStartDir = corner[2];
            var lineDir = corner[3];

            while (othello.onBoard(lineStartRow, lineStartCol) &&
                this.pieces[lineStartRow][lineStartCol] === color) {
                
                var lineRow = lineStartRow;
                var lineCol = lineStartCol;

                var first = true;
                while (true) {
                    var stableCheckRow = lineRow - lineStartDir[0] + (first ? 0 : lineDir[0]); 
                    var stableCheckCol = lineCol - lineStartDir[1] + (first ? 0 : lineDir[1]); 

                    if (!othello.onBoard(lineRow, lineCol)
                        || this.pieces[lineRow][lineCol] !== color
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
}

function minimax(board, depth) {
    // mayberework so pass skips a depth?
    if (board.currentColor == othello.Colors.None || depth == DEPTH)
    {
        return [board.heuristic[0], [-1, -1]];
    }

    var value, move;
    if (board.currentColor == board.maxColor) {
        value = -Infinity;
        move = [-1, -1];

        var candidates = board.validMoves[board.maxColor].map(move => board.move(move));
        candidates.sort(function(a, b) { return b.heuristic[0] - a.heuristic[0]; });
        candidates.slice(0, BRANCHING_FACTOR).forEach(candidate => {
            var mm = minimax(candidate, depth + 1);
            if (value == -Infinity || mm[0] > value) {
                value = mm[0];
                move = candidate.lastMove;
            }
        })

        return [value, move]
    } else {
        value = Infinity;
        move = [-1, -1];

        var candidates = []

        var candidates = board.validMoves[board.minColor].map(move => board.move(move));
        candidates.sort(function(a, b) { return a.heuristic[0] - b.heuristic[0]; });
        candidates.slice(0, BRANCHING_FACTOR).forEach(candidate => {
            var mm = minimax(candidate, depth + 1);
            if (value == Infinity || mm[0] < value) {
                value = mm[0];
                move = candidate.lastMove;
            }
        })

        return [value, move]
    }
}

export function findBestMove(board, maxColor) {
    var start = Date.now();
    var minColor = othello.getOppositeColor(maxColor);

    var aiBoard = new AiBoard(board.pieces, [-1, -1], maxColor, minColor);
    var bestMove = minimax(aiBoard, 0);

    console.log(`found: ${ bestMove } in ${Date.now() - start}ms`);
    return bestMove[1];
}
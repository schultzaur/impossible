import { Board } from "./board";
import { oppositeColor, countSetBits } from "./utils";
import { EMPTY, CORNER_MASK, NUM_SQUARES } from "./constants";

const DEPTH: u8 = 6;
const BRANCHING_FACTOR: u8 = 8;

const PARITY_WEIGHT: u8 = 10;
const MOBILITY_WEIGHT: u8 = 30;
const CORNER_WEIGHT: u8 = 25;
const STABILITY_WEIGHT: u8 = 30;

/*
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
*/

export class AiBoard extends Board
{
    lastMove: i8;
    maxColor: i8;
    minColor: i8;
    heuristic: f64;
    active: i8;

    constructor(pieces: StaticArray<i8>, lastMove: i8, maxColor: i8, minColor: i8) {
        super(pieces);

        this.lastMove = lastMove;
        this.maxColor = maxColor;
        this.minColor = minColor;
        this.heuristic = 0;
        
        if (lastMove != -1){
            var lastPlayer = this.pieces[lastMove];
            var oppositePlayer = oppositeColor(lastPlayer);

            if (!this.bitBoard.moves[oppositePlayer]) {
                if (this.bitBoard.moves[lastPlayer]) {
                    this.active = lastPlayer;
                } else {
                    this.active = EMPTY;
                }
            } else {
                this.active = oppositePlayer;
            }
        } else {
            this.active = maxColor;
        }

        this.setHeuristic();
    }

    aiMove(square: u8): AiBoard {
        var pieces = this.move(this.active, square);
        
        return new AiBoard(pieces, square, this.maxColor, this.minColor);
    }

    setHeuristic(): void {
        var maxParity = this.countCoins(this.maxColor)
        var minParity = this.countCoins(this.minColor)
        var parity: f64 = 100 * (maxParity - minParity) / (maxParity + minParity)
    
        var maxMobility = this.countMobility(this.maxColor)
        var minMobility = this.countMobility(this.minColor)
        var mobility: f64 = 0;
        if (maxMobility + minMobility == 0) {
            // Games over. 
            this.heuristic = maxParity > minParity ? Infinity : -Infinity;
        } else {
            mobility = 100 * (maxMobility - minMobility) / (maxMobility + minMobility)
        }
        
        var maxCorner = this.countCorners(this.maxColor)
        var minCorner = this.countCorners(this.minColor)
        var corner: f64 = 0
        if (maxCorner + minCorner != 0) {
            corner = 100 * (maxCorner - minCorner) / (maxCorner + minCorner)
        }
    
        var maxStable = this.countStable(this.maxColor)
        var minStable = this.countStable(this.minColor)
        var stable: f64 = 0
        if (maxStable + minStable != 0) {
            stable = 100 * (maxStable - minStable) / (maxStable + minStable)
        }
    
        var mobilityWeight: f64;
        var stabilityWeight: f64;
        var parityWeight: f64;
        var cornerWeight: f64;

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
    
        this.heuristic = 
            parityWeight * parity
                + mobilityWeight * mobility
                + cornerWeight * corner
                + stabilityWeight * stable;
    }

    countCoins(active: i8): f64 {
        return countSetBits(this.bitBoard.pieces[active]);
    }

    countMobility(active: i8): f64 {
        return countSetBits(this.bitBoard.moves[active]);
    }

    countCorners(active: i8): f64 {
        return 2 * countSetBits(this.bitBoard.pieces[active] & CORNER_MASK) +
            countSetBits(this.bitBoard.moves[active] & CORNER_MASK);
    }
    
    countStable(active: i8): f64 {
        // var stability = othello.getEmptyBoard();

        // CORNERS.forEach(corner => {
        //     var lineStartRow = corner[0];
        //     var lineStartCol = corner[1];
        //     var lineStartDir = corner[2];
        //     var lineDir = corner[3];

        //     while (othello.onBoard(lineStartRow, lineStartCol) &&
        //         this.pieces[lineStartRow][lineStartCol] === color) {
                
        //         var lineRow = lineStartRow;
        //         var lineCol = lineStartCol;

        //         var first = true;
        //         while (true) {
        //             var stableCheckRow = lineRow - lineStartDir[0] + (first ? 0 : lineDir[0]); 
        //             var stableCheckCol = lineCol - lineStartDir[1] + (first ? 0 : lineDir[1]); 

        //             if (!othello.onBoard(lineRow, lineCol)
        //                 || this.pieces[lineRow][lineCol] !== color
        //                 || stability[lineRow][lineCol]
        //                 || (othello.onBoard(stableCheckRow, stableCheckCol) && !stability[stableCheckRow][stableCheckCol]))
        //             {
        //                 break;
        //             }

        //             stability[lineRow][lineCol] = 1;

        //             lineRow += lineDir[0];
        //             lineCol += lineDir[1];
        //         }

        //         lineStartRow += lineStartDir[0];
        //         lineStartCol += lineStartDir[1];
        //     }
        // })

        // var stableSum = 0;
        // for (var row = 0; row < othello.BOARD_SIZE; row++) {
        //     for (var col = 0; col < othello.BOARD_SIZE; col++) {
        //         stableSum += stability[row][col];
        //     }
        // }
        // return stableSum;

        return 0;
    }
}

class MoveScore {
    score: f64;
    move: i8;
    constructor(score: f64, move: i8) {
        this.score = score;
        this.move = move;
    }
}
export function minimax(board: AiBoard, depth: u8): MoveScore {
    // maybe rework so pass skips a depth?
    if (board.active == EMPTY || depth == DEPTH)
    {
        return new MoveScore(board.heuristic, board.lastMove);
    }

    let candidates = new Array<AiBoard>();

    let mask: u64 = 1
    for (let square: i8 = 0; square < NUM_SQUARES; square++) {
        if (board.bitBoard.moves[board.active] & mask) {
            candidates.push(board.aiMove(square));
        }

        mask <<= 1;
    }

    let value: f64;
    let move: i8;
    if (board.active == board.maxColor) {
        value = -Infinity;
        move = -1;

        candidates.sort(function(a, b) { return b.heuristic > a.heuristic ? 1 : -1 });
        for (let i = 0; i < min(candidates.length, BRANCHING_FACTOR); i++) {
            let mm = minimax(candidates[i], depth + 1);
            if (value == -Infinity || mm.score > value) {
                value = mm.score;
                move = candidates[i].lastMove;
            }
        }
    } else {
        value = Infinity;
        move = -1;

        candidates.sort(function(a, b) { return a.heuristic > b.heuristic ? 1 : -1 });
        for (let i = 0; i < min(candidates.length, BRANCHING_FACTOR); i++) {
            let mm = minimax(candidates[i], depth + 1);
            if (value == Infinity || mm.score < value) {
                value = mm.score;
                move = candidates[i].lastMove;
            }
        }
    }

    return new MoveScore(value, move);
}
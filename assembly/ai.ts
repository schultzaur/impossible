import { Board } from "./board";
import { countSetBits } from "./utils";
import { BLACK, WHITE, EMPTY, CORNER_MASK, NUM_SQUARES } from "./constants";
import { TOP_ROW, BOTTOM_ROW, LEFT_ROW, RIGHT_ROW } from "./constants";
import { EDGE_SCORES } from "./edgeStability";

import { piecesToString } from "./interop";

const DEPTH: u8 = 8;
const BRANCHING_FACTOR: u8 = 12;

const PARITY_WEIGHT: f64 = 10;
const MOBILITY_WEIGHT: f64 = 30;
const CORNER_WEIGHT: f64 = 25;
const STABILITY_WEIGHT: f64 = 50;

function heuristicString(values: Array<f64>): string {
    let s: string = "[";

    for (let i = 0; i < values.length; i++) {
        if (i != 0) { s += ","; }
        s += values[i].toString();
    }

    s += "]";

    return s;
}

export class AiBoard extends Board
{
    maxColor: i8;
    minColor: i8;
    heuristic: Array<f64>;

    constructor(pieces: StaticArray<i8>, lastMove: i8, maxColor: i8, minColor: i8) {
        super(pieces, lastMove);

        if (lastMove == -1) {
            this.active = maxColor;
        }

        this.maxColor = maxColor;
        this.minColor = minColor;
        this.heuristic = this.getHeuristic();
    }

    aiMove(square: u8): AiBoard {
        var pieces = this.move(this.active, square);
        
        return new AiBoard(pieces, square, this.maxColor, this.minColor);
    }

    doBestMove(): AiBoard {
        return this.aiMove(this.getBestMove());
    }

    getBestMove(): i8 {
        trace(heuristicString(this.heuristic) + "|" + piecesToString(this.pieces));
        return minimax(this, 0, -Infinity, Infinity).board.lastMove;
    }

    getHeuristic(): Array<f64> {
        var maxParity = this.countCoins(this.maxColor);
        var minParity = this.countCoins(this.minColor);
        var parity: f64 = 100 * (maxParity - minParity) / (maxParity + minParity)
    
        var maxMobility = this.countMobility(this.maxColor);
        var minMobility = this.countMobility(this.minColor);
        var mobility: f64 = 0;
        if (maxMobility + minMobility == 0) {
            // Games over. 
            return [maxParity > minParity ? Infinity : -Infinity];
        } else {
            mobility = 100 * (maxMobility - minMobility) / (maxMobility + minMobility)
        }
        
        var maxCorner = this.countCorners(this.maxColor);
        var minCorner = this.countCorners(this.minColor);
        var corner: f64 = 0
        if (maxCorner + minCorner != 0) {
            corner = 100 * (maxCorner - minCorner) / (maxCorner + minCorner)
        }
    
        var edgeStability = this.countEdgeStability()
    
        var mobilityWeight: f64;
        var stabilityWeight: f64;
        var parityWeight: f64;
        var cornerWeight: f64;

        if (maxParity + minParity < 30) {
            mobilityWeight = MOBILITY_WEIGHT;
            stabilityWeight = STABILITY_WEIGHT;
    
            parityWeight = -1 * PARITY_WEIGHT;
    
            cornerWeight = CORNER_WEIGHT;
        } else if (maxParity + minParity < 50) {
            parityWeight = 0 * PARITY_WEIGHT;
            mobilityWeight = 2 * MOBILITY_WEIGHT;
            stabilityWeight = 2 * STABILITY_WEIGHT;
            cornerWeight = CORNER_WEIGHT;
        } else {
            stabilityWeight = STABILITY_WEIGHT;
            mobilityWeight = MOBILITY_WEIGHT;
            parityWeight = PARITY_WEIGHT;
            cornerWeight = CORNER_WEIGHT;
        }
        
        const score: f64 =
            parityWeight * parity
                + mobilityWeight * mobility
                + cornerWeight * corner
                + stabilityWeight * edgeStability;

        if (score > 1000000) {
            trace(heuristicString([score, parity, mobility, corner, edgeStability, parityWeight, mobilityWeight, cornerWeight, stabilityWeight])
                + "|" + piecesToString(this.pieces));
        }

        return [
            score,
            parity,
            mobility,
            corner,
            edgeStability];
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
    
    countEdgeStability(): f64 {
        let stability: f64 = 0;

        const blackPieces: u64 = this.bitBoard.pieces[BLACK]
        const whitePieces: u64 = this.bitBoard.pieces[WHITE]
        const pieces: u64 = blackPieces | whitePieces;

        let key: u16 = 0;
        let mask: u64 = 1 << 0;
        if (pieces & TOP_ROW) {
            for (let i: i8 = 0; i < 8; i++) {
                key *= 3;
                
                if (blackPieces & mask) {
                    key += 1;
                } else if (whitePieces & mask) {
                    key += 2;
                }

                mask <<= 1;
            }
        }
        stability += EDGE_SCORES[key];

        key = 0;
        mask = 1 << 56; 
        if (pieces & BOTTOM_ROW) {
            for (let i: i8 = 0; i < 8; i++) {
                key *= 3;
                
                if (blackPieces & mask) {
                    key += 1;
                } else if (whitePieces & mask) {
                    key += 2;
                }

                mask <<= 1;
            }
        }
        stability += EDGE_SCORES[key];

        key = 0;
        mask = 1 << 0;
        if (pieces & LEFT_ROW) {
            for (let i: i8 = 0; i < 8; i++) {
                key *= 3;
                
                if (blackPieces & mask) {
                    key += 1;
                } else if (whitePieces & mask) {
                    key += 2;
                }

                mask <<= 8;
            }
        }
        stability += EDGE_SCORES[key];

        key = 0;
        mask =  1 << 7;
        if (pieces & RIGHT_ROW) {
            for (let i: i8 = 0; i < 8; i++) {
                key *= 3;
                
                if (blackPieces & mask) {
                    key += 1;
                } else if (whitePieces & mask) {
                    key += 2;
                }

                mask <<= 8;
            }
        }
        stability += EDGE_SCORES[key];        

        return this.maxColor == BLACK ? stability : -stability;
    }
}

class MoveScore {
    score: f64;
    board: AiBoard;
    constructor(score: f64, board: AiBoard) {
        this.score = score;
        this.board = board;
    }
}

function minimax(board: AiBoard, depth: u8, alpha: f64, beta: f64): MoveScore {
    // maybe rework so pass skips a depth?
    
    if (board.active == EMPTY || depth == DEPTH)
    {
        return new MoveScore(board.heuristic[0], board);
    }

    let candidates = new Array<AiBoard>();

    let mask: u64 = 1
    for (let square: i8 = 0; square < NUM_SQUARES; square++) {
        if (board.bitBoard.moves[board.active] & mask) {
            candidates.push(board.aiMove(square));
        }

        mask <<= 1;
    }

    let value: f64 = 0;
    let best_i: i32 = -1;

    if (board.active == board.maxColor) {
        candidates.sort(function(a, b) { return b.heuristic[0] > a.heuristic[0] ? 1 : -1 });

        value = -Infinity;

        for (let i: i32 = 0; i < min(candidates.length, BRANCHING_FACTOR); i++) {
            let moveScore = minimax(candidates[i], depth + 1, alpha, beta);

            if (best_i == -1 || moveScore.score > value) {
                value = moveScore.score;
                best_i = i;
            }

            if (moveScore.score > alpha) {
                alpha = moveScore.score;
            }

            if (alpha >= beta) {
                break;
            }
        }
    } else {
        candidates.sort(function(a, b) { return b.heuristic[0] < a.heuristic[0] ? 1 : -1 });

        value = Infinity;

        for (let i: i32 = 0; i < min(candidates.length, BRANCHING_FACTOR); i++) {
            let moveScore = minimax(candidates[i], depth + 1, alpha, beta);

            if (best_i == -1 || moveScore.score < value) {
                value = moveScore.score;
                best_i = i;
            }

            if (moveScore.score < beta) {
                beta = moveScore.score;
            }

            if (beta <= alpha) {
                break;
            }
        }
    }

    return new MoveScore(value, candidates[best_i]);
}
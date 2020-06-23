import { NUM_PLAYERS, BLACK, WHITE, NUM_SQUARES, DIRECTIONS, } from "./constants";
import { oppositeColor } from "./utils";

export class BitBoard {
    public pieces: StaticArray<u64>;
    public moves: StaticArray<u64>;
    public directionalMoves: StaticArray<StaticArray<u64>>;
  
    constructor(pieces: StaticArray<i8>) {
        this.pieces = new StaticArray<u64>(NUM_PLAYERS);
        this.moves = new StaticArray<u64>(NUM_PLAYERS);
        this.directionalMoves = new StaticArray<StaticArray<u64>>(NUM_PLAYERS);
        
        for (let player: i8 = 0; player < NUM_PLAYERS; player++) {
            this.directionalMoves[player] = new StaticArray<u64>(DIRECTIONS.length);
        }

        this.setPieces(pieces);
        this.calculateMoves();
    }

    setPieces(pieces: StaticArray<i8>): void {
        let mask: u64 = 1;
        let player: i8 = -1;
        for (let square: i8 = 0; square < NUM_SQUARES; square++) {
            player = pieces[square];
            if (player == BLACK || player == WHITE ) {
                this.pieces[player] |= mask;
            }

            mask <<= 1;
        }
    }

    calculateMoves(): void {
        for (let activePlayer: i8 = 0; activePlayer < NUM_PLAYERS; activePlayer++) {
            // square representation (array):
            // 0  1  2  3  4  5  6  7
            // 8  9 10 . . .
            //
            // bit board representation (u64):
            // ...b10b9b8b7b6b5b4b3b2b1b0
            //
            // So, if we're moving down and to the right, e.g. direction is 9 in the square
            // representation, or towards the bottom right, to do the same move in bit board
            // representation, we would shift left (<<) by 9. However, the "directions" are
            // starting from the move square, and the calculations here will be starting from
            // the active player's existing pieces, and calculate the move squares, so again,
            // the direction is flipped. Therefore, for the shifts here, we will actually
            // shift in the same direction (>>).
            //
            // e.g.
            // Row 1: -BWW----
            // Bit board representation:
            //     black: ....00000010
            //     white: ....00001100
            // There is a valid move on square 4, which captures to the left (direction: -1).
            // To do this calculation we will start on square 1, and project a ray to the "right".
            // This corresponds to a bit shift to the left.

            let oppositePlayer: i8 = oppositeColor(activePlayer);
            let active: u64 = this.pieces[activePlayer];
            let opposite: u64 = this.pieces[oppositePlayer];

            // Each row of bit board mask (0x7E) looks like: 01111110
            // This will be used to get the "inner" pieces, a.k.a the only pieces we can capture if
            // the capture direction has horizontal movement. This is necessary to make sure we don't
            // wrap around the left or right edges of the board. We don't need the same for the top
            // and bottom edges of the board, as standard bit shifts are not circular. For diagonal
            // directions, we can use the same horizontal mask.
            let oppositeInner = opposite & 0x7e7e7e7e7e7e7e7e;

            let flipped: u64 = 0;
            let oppositeAdjacent: u64 = 0;

            for (let d: i8 = 0; d < DIRECTIONS.length; d++) {
                let direction: i8 = DIRECTIONS[d];
                let directionMoves: u64 = 0;
                if (direction > 0) {
                    // positive means >>
                    if (direction % 8) {
                        // Some horizontal component. Need to use the "inner" pieces.
                        // Get the opposite player's adjacent pieces (useful later on to save an op).
                        oppositeAdjacent = (oppositeInner >> direction) & oppositeInner;
                        // Extend capture rays from the active player's pieces 1 piece in length.
                        flipped = (active >> direction) & oppositeInner;
                        // Extend the rays to 2 pieces in length.
                        flipped |= (flipped >> direction) & oppositeInner;
                    } else {
                        // Vertical. Can just use the normal piececs.
                        oppositeAdjacent = (opposite >> direction) & opposite;
                        flipped = (active >> direction) & opposite;
                        flipped |= (flipped >> direction) & opposite;
                    }
    
                    // Extend the rays to 4 pieces in length. Then to 6 (max capture ray length).
                    flipped |= (flipped >> (direction * 2)) & oppositeAdjacent;
                    flipped |= (flipped >> (direction * 2)) & oppositeAdjacent;

                    // Now go one piece past it, and that's the square the active player can move to capture.
                    directionMoves = flipped >> direction;
                } else {
                    // negative means <<
                    direction = abs(direction);

                    if (direction % 8) {
                        oppositeAdjacent = (oppositeInner << direction) & oppositeInner;
                        flipped = (active << direction) & oppositeInner;
                        flipped |= (flipped << direction) & oppositeInner;
                    } else {
                        oppositeAdjacent = (opposite << direction) & opposite;
                        flipped = (active << direction) & opposite;
                        flipped |= (flipped << direction) & opposite;
                    }
    
                    flipped |= (flipped << (direction * 2)) & oppositeAdjacent;
                    flipped |= (flipped << (direction * 2)) & oppositeAdjacent;
                    directionMoves = flipped << direction;
                }

                // These are squares the player could play to capture, but they may already be taken. Let's fix that.
                directionMoves &= ~(active | opposite);

                // Now save the caltulation!
                this.moves[activePlayer] |= directionMoves
                this.directionalMoves[activePlayer][d] = directionMoves;
            }
        }
    }
}
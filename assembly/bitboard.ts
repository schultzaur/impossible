import { NUM_PLAYERS, BLACK, WHITE, NUM_SQUARES, } from "./constants";

export class BitBoard {
    public blackPieces: u64;
    public whitePieces: u64;
    public blackMoves: u64;
    public whiteMoves: u64;
    public directionalMoves: u64[][];
  
    constructor(pieces: StaticArray<i8>) {
        this.blackPieces = 0x0;
        this.whitePieces = 0x0;

        let mask: u64 = 1;
        for (let square: u8 = 0; square < NUM_SQUARES; square++) {
            if (pieces[square] == BLACK) {
                this.blackPieces |= mask;
            } else if (pieces[square] == WHITE) {
                this.whitePieces |= mask;
            }

            mask <<= 1;
        }

        this.calculateMoves();
    }

    calculateMoves(): void {
        this.blackMoves = 0x0;
        this.whiteMoves = 0x0;
        this.directionalMoves = new Array<u64[]>(NUM_PLAYERS);

        for(let player: u8 = 0; player < NUM_PLAYERS; player++) {
            this.directionalMoves[player] = new Array<u64>(8);
        }
    }
}
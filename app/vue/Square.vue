<template>
    <a class="square"
        v-on:click="$emit('clicked', { row: row, col: col })"
        v-bind:style="squareStyle">
        <div class="piece" v-bind:style="{ background: pieceColor, width: pieceSize, height: pieceSize }"></div>
    </a>
</template>

<script>
import * as othello from "../othello";

export default {
    name: "square",
    props: ['row', 'col', 'gameState'],
    computed: {
        squareStyle: function() {
            if (this.row == this.gameState.lastMove[0] && this.col == this.gameState.lastMove[1]) {
                return {
                    "--background": "red",
                    "--background-hover": "orange",
                }
            } else {
                return {
                    "--background": "green",
                    "--background-hover": "yellowgreen",
                }
            }
        },
        piece: function() {
            return this.gameState.pieces[this.row][this.col];
        },
        validMove: function() {
            return this.gameState.validMoves[this.gameState.turn][this.row][this.col];
        },
        pieceColor: function () {
            if (this.piece === othello.Colors.Black || this.validMove == othello.Colors.Black) {
                return "black";
            } else if (this.piece === othello.Colors.White || this.validMove == othello.Colors.White) {
                return "white";
            } else {             
                return "none";
            }
        },
        pieceSize: function() {
            if (this.piece === othello.Colors.Black || this.piece === othello.Colors.White) {
                return "32px";
            } else if (this.validMove == othello.Colors.Black || this.validMove == othello.Colors.White) {
                return "8px";
            } else {
                return "0px";
            }
        },
    }
}
</script>
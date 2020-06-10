import * as othello from './othello.js';

var gameTemplate = 
`<div class="game">
    <board
        v-on:clicked="clicked($event)"
        v-bind:gameState="gameState">
    </board>
    <div class="controls">
        <br>
        <input type="radio" id="player" value="Player" v-model="first"> 
        <label for="player">Player First</label>
        <br>
        <input type="radio" id="cpu" value="CPU" v-model="first">
        <label for="cpu">CPU First</label>
        <br>
        <button v-on:click="newGame()">New Game</button>
        <br>
        <button v-on:click="undo()">Undo</button>
    </div>
</div>`

var boardTemplate = 
`<div class="board">
    <div
        v-for="row in 8"
        v-bind:key="row">
        <square
            v-for="col in 8"
            v-bind:row="row-1"
            v-bind:col="col-1"
            v-bind:key="index(row, col)"
            v-bind:gameState="gameState"
            v-on="$listeners">
        </square>
    </div>
</div>`

var squareTemplate =
`<a class="square"
    v-on:click="$emit('clicked', { row: row, col: col })"
    v-bind:style="squareStyle">
    <div class="piece" v-bind:style="{ background: pieceColor, width: pieceSize, height: pieceSize }">
    </div>
</a>`;


Vue.component('square', {
    props: ['row', 'col', 'gameState'],
    template: squareTemplate,
    computed: {
        squareStyle: function() {
            if (this.row === this.gameState.lastMove[0] && this.col == this.gameState.lastMove[1]) {
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
            return this.gameState.board.board[this.row][this.col];
        },
        validMove: function() {
            return this.gameState.validMoves[this.row][this.col];
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
                return "16px";
            } else if (this.validMove == othello.Colors.Black || this.validMove == othello.Colors.White) {
                return "4px";
            } else {
                return "0px";
            }
        },
    }
});

Vue.component('board', {
    props: ['gameState'],
    template: boardTemplate,
    computed: {},
    methods: {
        index(row, col) {
            return othello.getIndex(row-1, col-1);
        },
    }
});

Vue.component('game', {
    props: [],
    template: gameTemplate,
    computed: {},
    data() {
        return {
            gameState: new othello.Game(),
            first: 'Player',
        }
    },
    methods: {
        clicked(move) {
            this.gameState = this.gameState.move(move.row, move.col);
        },
        newGame() {
            this.gameState = new othello.Game();
        },
        undo() {

        }
    }
});

export function loadApp()
{
    var app = new Vue({el: '#app'});    
}
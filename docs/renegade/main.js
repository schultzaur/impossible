import * as ai from './ai.js';
import * as othello from './othello.js';

export class Game {
    constructor(board, turn, lastMove) {
        this.board = (typeof board !== 'undefined') ? board : new othello.Board();
        this.turn = (typeof turn !== 'undefined') ? turn : othello.Colors.Black;
        this.validMovesBoard = this.getValidMovesBoard();
        this.lastMove = (typeof lastMove !== 'undefined') ? lastMove : [-1,-1];
    }

    getValidMovesBoard() {
        var validMoves = othello.getEmptyBoard();
        this.board.validMoves[this.turn].forEach(validMove => {
            validMoves[validMove[0]][validMove[1]] = this.turn;
        })
       

        return validMoves;
    }

    move(row, col) {
        if (!othello.isValidMove(this.board.board, row, col, this.turn)) {
            return false;
        }

        var oppositeTurn = othello.getOppositeColor(this.turn)
        var newBoard = this.board.move(row, col, this.turn, oppositeTurn);;

        var nextTurn = null;
        if (newBoard.validMoves[oppositeTurn]) {
            nextTurn = oppositeTurn;
        } else if (newBoard.validMoves[this.turn]) {
            nextTurn = this.turn;
        }

        return new Game(newBoard, nextTurn, [row, col]);
    }
}


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
            return this.gameState.board.board[this.row][this.col];
        },
        validMove: function() {
            return this.gameState.validMovesBoard[this.row][this.col];
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
        var gameStates = [new Game()];

        return {
            gameStates: gameStates,
            gameState: gameStates[gameStates.length-1],
            first: 'Player',
        };
    },
    methods: {
        clicked(move) {
            var turn = this.gameState.turn;
            
            this.move(move);

            while (this.gameState.turn != turn) {
                var cpu_move = ai.findBestMove(this.gameState.board, this.gameState.turn);
                
                if (!this.move({ row: cpu_move[0], col: cpu_move[1] })) {
                    break;
                };
            }
        },
        move(move) {
            var newGameState = this.gameState.move(move.row, move.col);
            if (newGameState) {
                this.gameStates.push(newGameState);
                this.gameState = this.gameStates[this.gameStates.length-1];
            }
            return newGameState;
        },
        newGame() {
            this.gameStates.push(new Game());
            this.gameState = this.gameStates[this.gameStates.length-1];

            if (this.first === "CPU") {
                var middle = Math.floor(othello.BOARD_SIZE/2) - 1;
                this.move({ row: middle-1, col: middle});
            }
        },
        undo() {
            if (this.gameStates.length > 1) {
                this.gameStates.pop();
                this.gameState = this.gameStates[this.gameStates.length-1];
            }
        },
    }
});

export function loadApp()
{
    var app = new Vue({el: '#app'});    
}
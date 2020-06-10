import * as ai from './ai.js';
import * as othello from './othello.js';

var gameTemplate = 
`<div class="game">
    <board
        v-on:clicked="clicked($event)"
        v-bind:gameState="gameState">
    </board>
    <div class="controls">
        <br>
        <input type="radio" id="player" v-bind:value="player" v-model="first"> 
        <label for="player">Player First</label>
        <br>
        <input type="radio" id="cpu" v-bind:value="cpu" v-model="first">
        <label for="cpu">CPU First</label>
        <br>
        <button v-on:click="newGame()">New Game</button>
        <br>
        <button v-on:click="undo()">Undo</button>
    </div>
    <br>
    <div class="gameLink"> 
        <button v-on:click="copyGameLink()">Copy Game Link</button>
        <input type="text" v-bind:value="gameLink" id="gameLinkInput"></input>
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
        var urlParams = new URLSearchParams(window.location.search);
        var gameState = Game.fromGameLink(urlParams);

        return {
            gameStates: [gameState],
            gameState: gameState,
            first: gameState.player == othello.Colors.Black ? Players.Player : Players.CPU,
        };
    },
    computed: {
        player : function() {
            return Players.Player;
        },
        cpu: function() {
            return Players.CPU;
        },
        gameLink: function() {
            return this.gameState.getGameLink();
        }
    },
    methods: {
        clicked(move) {
            var oppositeTurn = othello.getOppositeColor(this.gameState.turn);

            var newGame = this.move(move);

            while (newGame && newGame.turn == oppositeTurn) {
                var cpu_move = ai.findBestMove(this.gameState.board, this.gameState.turn);
                newGame = this.move({ row: cpu_move[0], col: cpu_move[1] });

                if (!newGame) {
                    console.log("oopsy", cpu_move, this.gameState);
                }
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

            if (this.first === Players.CPU) {
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
        copyGameLink() {
            var input = $('#gameLinkInput')[0]
            input.select();
            input.setSelectionRange(0,1000);
            window.document.execCommand("copy");

            if (window.getSelection) {
                window.getSelection().removeAllRanges();
            } else if (document.selection) {
                document.selection.empty();
            }
        }
    }
});

const Players = {
    Player: 1,
    CPU: 2,
}

class Game {
    constructor(board, playerColor, turnColor, lastMove) {
        this.board = (typeof board !== 'undefined') ? board : new othello.Board();
        this.player = (typeof playerColor !== 'undefined') ? playerColor : othello.Colors.Black;
        this.turn = (typeof turnColor !== 'undefined') ? turnColor : othello.Colors.Black;
        this.lastMove = (typeof lastMove !== 'undefined') ? lastMove : [-1,-1];
        this.validMovesBoard = this.getValidMovesBoard();
    }

    getValidMovesBoard() {
        var validMoves = othello.getEmptyBoard();

        if (this.turn == othello.Colors.None) {
            return validMoves;
        }

        this.board.validMoves[this.turn].forEach(validMove => {
            validMoves[validMove[0]][validMove[1]] = this.turn;
        })
       
        return validMoves;
    }

    move(row, col) {
        if (this.turn == othello.Colors.None || !othello.isValidMove(this.board.board, row, col, this.turn)) {
            return false;
        }

        var oppositeTurn = othello.getOppositeColor(this.turn)
        var newBoard = this.board.move(row, col, this.turn, oppositeTurn);

        var nextTurn = othello.Colors.None;
        if (newBoard.validMoves[oppositeTurn].length > 0) {
            nextTurn = oppositeTurn;
        } else if (newBoard.validMoves[this.turn].length > 0) {
            nextTurn = this.turn;
        }

        return new Game(newBoard, this.player, nextTurn, [row, col]);
    }

    getGameLink() {
        var path;
        if (document.baseURI.indexOf("127.0.0.1") > -1) {
            path = "./renegade.html";
        } else {
            path = "./renegade";
        }

        var board = JSON.stringify(this.board.board);
        var player = JSON.stringify(this.player);
        var currentPlayer = JSON.stringify(this.turn);
        var lastMove = JSON.stringify(this.lastMove);
        
        path += `?board=${board}&player=${player}&currentPlayer=${currentPlayer}&lastMove=${lastMove}`

        return new URL(path, document.baseURI).href;
    }

    static fromGameLink(urlParams) {
        try {
            var board = JSON.parse(urlParams.get('board'));
            var playerColor = JSON.parse(urlParams.get('player'));
            var turnColor = JSON.parse(urlParams.get('currentPlayer'));
            var lastMove = JSON.parse(urlParams.get('lastMove'));

            if (board && playerColor && turnColor && lastMove) {
                return new Game(new othello.Board(board), playerColor, turnColor, lastMove);
            }
        }
        catch (error) {
            console.log(error);
        }        
        
        return new Game();
    }
}

export function loadApp()
{
    var app = new Vue({el: '#app'});
}
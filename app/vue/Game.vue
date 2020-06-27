<template>
    <div class="game">
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
            <input type="text" v-bind:value="gameLink" id="gameLinkInput">
        </div>
    </div>
</template>

<script>
import Board from "./Board.vue"
import * as othello from "../othello";
import { Game, Players } from "../game"

export default {
    name: "game",
    props: {
        getBestMove: {
            type: Function
        }
    },
    components: { Board },
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
        async clicked(move) {
            var oppositeTurn = othello.getOppositeColor(this.gameState.turn);

            var newGame = this.move(move);

            while (newGame && newGame.turn == oppositeTurn) {
                var cpu_move = await this.getBestMove(this.gameState.board.toString(), this.gameState.turn);
                if (cpu_move != -1) {
                    newGame = this.move({ row: Math.floor(cpu_move / 8), col: cpu_move % 8 });                   
                }
            }
            
            return Promise.resolve();
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
}
</script>
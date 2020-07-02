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
import { piecesToString } from "../interop";

export default {
    name: "game",
    props: {
        doMove: { type: Function },
        getBestMove: { type: Function },
    },
    components: { Board },
    computed: {},
    data() {
        var urlParams = new URLSearchParams(window.location.search);

        var gameState = othello.Game.fromGameLink(urlParams);

        return {
            gameStates: [gameState],
            gameState: gameState,
            first: gameState.player == othello.Colors.Black ? othello.Players.Player : othello.Players.CPU,
        };
    },
    computed: {
        player : function() {
            return othello.Players.Player;
        },
        cpu: function() {
            return othello.Players.CPU;
        },
        gameLink: function() {
            return this.gameState.getGameLink();
        }
    },
    watch: {
        first: function(player) {
            if (player == othello.Players.CPU && this.gameStates.length == 1) {
                var middle = Math.floor(othello.BOARD_SIZE/2) - 1;
                this.move({ row: middle-1, col: middle });
            }
        }
    },
    methods: {
        async clicked(move) {
            var oppositeTurn = othello.getOppositeColor(this.gameState.turn);

            var newGame = this.move(move);

            while (newGame && newGame.turn == oppositeTurn) {
                var cpu_move = await this.getBestMove(piecesToString(this.gameState.pieces), this.gameState.turn);
                if (cpu_move != -1) {
                    newGame = this.move({ row: Math.floor(cpu_move / 8), col: cpu_move % 8 });                   
                } else {
                    break;
                }
            }
            
            return Promise.resolve();
        },
        move(move) {
            var newGameState = this.doMove(this.gameState, move);
            if (newGameState) {
                this.gameStates.push(newGameState);
                this.gameState = this.gameStates[this.gameStates.length-1];
            }
            return newGameState;
        },
        newGame() {
            this.gameStates.push(othello.Game.getNewGame(this.player));
            this.gameState = this.gameStates[this.gameStates.length-1];

            if (this.first === othello.Players.CPU) {
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
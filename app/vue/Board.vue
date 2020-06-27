<template>
    <div class="board">
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
    </div>
</template>

<script>
import Square from "./Square.vue"
import * as othello from "../othello";

export default {
    name: "board",
    props: ['gameState'],
    components: { Square },
    computed: {},
    methods: {
        index(row, col) {
            return othello.getIndex(row-1, col-1);
        },
    }
}
</script>
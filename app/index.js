import Game from "./vue/Game.vue";
import "./main.css";
import * as othello from "./othello";
import { parseBoard, piecesToString } from "./interop";

const loader = require("@assemblyscript/loader");
const wasmPath = './asm/optimized.wasm';

let doMove;

let msgId = 0;
let resolves = {};
let rejects = {};

let worker = new Worker('worker.js');
worker.onmessage = function(e) {
    console.log(`${e.data.messageType} processed in ${e.data.timeTaken}ms: ${e.data.result}`)

    // TODO: Figure out what to actually do here.
    resolves[e.data.id](e.data.result);

    delete resolves[e.data.id];
    delete rejects[e.data.id];
}

async function loadModule() {
    const id = msgId++;

    const imports = { env: { abort() {} }};
    const response = await fetch(wasmPath);
    const buffer = await response.arrayBuffer();
    const compiled = await WebAssembly.compile(buffer);

    const initWorker = new Promise(function (resolve, reject) {
        resolves[id] = resolve;
        rejects[id] = reject;

        worker.postMessage({ messageType: "init", id: id, wasmModule: compiled });
    });

    const othelloWasm = await loader.instantiate(compiled, imports);
    const { __allocString, __retain, __release, __getString,
            _doMove, } = othelloWasm.exports;
    
    doMove = function(game, move) {
        let pieces = piecesToString(game.pieces);
        let active = game.turn;
        let square = othello.getIndex(move.row, move.col);

        let piecesPtr = __retain(__allocString(pieces));
        let newBoardPtr = _doMove(piecesPtr, active, square);
        let newBoard = __getString(newBoardPtr);
        __release(newBoardPtr);
        __release(piecesPtr);
        
        return parseBoard(newBoard, game.player);
    }

    return initWorker;
}

async function getBestMove(board, active) {
    const id = msgId++;

    const bestMovePromise = new Promise(function (resolve, reject) {
        resolves[id] = resolve;
        rejects[id] = reject;

        worker.postMessage({ messageType: "getBestMove", id: id, pieces: board, active: active});
    });

    return bestMovePromise;
}

loadModule()
    .then(_ => {
        new Vue({
            el: '#app',
            components: { Game },
            methods: { doMove, getBestMove }
        });
    });

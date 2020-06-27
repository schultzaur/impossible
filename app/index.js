import Game from "./vue/Game.vue";
import "./main.css";

const loader = require("@assemblyscript/loader");
const wasmPath = './asm/optimized.wasm';

let doMove;

let msgId = 0;
let resolves = {};
let rejects = {};

let worker = new Worker('worker.js');
worker.onmessage = function(e) {
    console.log(`${e.data.messageType} processed in ${e.data.timeTaken}ms: ${e.data.result}`)

    resolves[e.data.id](e.data.result);
    // TODO: Figure out what to actually do here.

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
    const { __allocString, __retain, __release, __getString, _doMove } = othelloWasm.exports;
    
    doMove = function(pieces, active, square) {
        let piecesPtr = __retain(__allocString(pieces));
        let newBoardPtr = _doMove(piecesPtr, active, square);
        let newBoard = __getString(newBoardPtr);
        __release(newBoardPtr);
        __release(piecesPtr);    
        return newBoard;
    }

    return initWorker;
}

async function doBestMove(board, active) {
    const id = msgId++;

    const bestMovePromise = new Promise(function (resolve, reject) {
        resolves[id] = resolve;
        rejects[id] = reject;

        worker.postMessage({ messageType: "doBestMove", id: id, pieces: board, active: active});
    });

    return bestMovePromise;
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

function addComponent(text) {
    const element = document.createElement('p');
    element.innerHTML = text;
    document.body.appendChild(element);
}

let board =
    "--------" +
    "--------" +
    "---B----" +
    "---BBW--" +
    "--BBWWW-" +
    "--BWWW--" +
    "--B-----" +
    "--------";

loadModule()
    .then(_ => {
        new Vue({
            el: '#app',
            components: { Game },
            methods: { getBestMove }
        });
    });

    
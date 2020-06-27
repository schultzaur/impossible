const loader = require("@assemblyscript/loader");

export { loadApp } from "./components"

var doMove;
var loadWorker;

var worker = new Worker('worker.js');
worker.onmessage = function(e) {
    switch(e.data.messageType)
    {
        case "workerReady":
            if (loadWorker.resolve !== null) {
                loadWorker.resolve("Loaded!");
                console.log("workerReady: Suceeded");
            } else {
                console.log("workerReady: Failed");
            }
            break;
        case "timeTest":
            addComponent(`Did time test: ${e.data.timeTaken}ms`);
            break;
        case "doBestMove":
            addComponent(`Did best move in ${e.data.timeTaken}ms: ${e.data.newBoard}`);
            break;
    }
}

async function loadModule() {
    const imports = { env: { abort() {} }};
    const response = await fetch('../build/untouched.wasm');
    const buffer = await response.arrayBuffer();
    const compiled = await WebAssembly.compile(buffer);

    const initWorker = new Promise(function (resolve, reject) {
        loadWorker = { resolve, reject };

        worker.postMessage({ messageType: "init", wasmModule: compiled });
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
        worker.postMessage({ messageType: "timeTest" });

        const start = Date.now();
        let newBoard;
        for (let i = 0; i < 50; i++) {
            newBoard = doMove(board, 0, 52);
            newBoard = doMove(board, 1, 26);
        }
        addComponent(`Moved 100x in: ${Date.now() - start}`);

        worker.postMessage({ messageType: "doMove", pieces: board, active: 0, square: 52 });

        for (let i = 0; i < 10; i++) {
            worker.postMessage({ messageType: "doBestMove", pieces: board, active: 1});   
        }
    });

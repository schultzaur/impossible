const loader = require("@assemblyscript/loader");

var doBestMove;
var getBestMove;

onmessage = async function(e) {
    switch(e.data.messageType) {
        case "init":
            await init(e.data.id, e.data.wasmModule);
            break;
        case "doBestMove":
            doBestMove(e.data.id, e.data.pieces, e.data.active);
            break;
        case "getBestMove":
            getBestMove(e.data.id, e.data.pieces, e.data.active);
            break;
    }
}

init = async function(id, wasmModule) {
    let start = Date.now();

    var imports = { env: { abort() {} }};
    const othelloWasm = await loader.instantiate(wasmModule, imports);
    const { __allocString, __retain, __getString, __release } = othelloWasm.exports;
    const { _doBestMove, _getBestMove, } = othelloWasm.exports;

    doBestMove = function(id, pieces, active) {
        let start = Date.now();
        
        let piecesPtr = __retain(__allocString(pieces));
        let newBoardPtr = _doBestMove(piecesPtr, active);
        let newBoard = __getString(newBoardPtr);
        __release(newBoardPtr);
        __release(piecesPtr);    
        
        postMessage({ messageType: "doBestMove", id: id, result: newBoard, timeTaken: Date.now()-start });
    }

    getBestMove = function(id, pieces, active) {
        let start = Date.now();
        
        let piecesPtr = __retain(__allocString(pieces));
        let bestMove = _getBestMove(piecesPtr, active);
        __release(piecesPtr);    
        
        postMessage({ messageType: "getBestMove", id: id, result: bestMove, timeTaken: Date.now()-start });
    }

    postMessage({ messageType: "workerReady", id: id, result: "Done!", timeTaken: Date.now()-start });
}
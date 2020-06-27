const loader = require("@assemblyscript/loader");

var doBestMove;
var timeTest;

onmessage = async function(e) {
    switch(e.data.messageType) {
        case "init":
            await init(e.data.wasmModule);
            break;
        case "timeTest":
            timeTest();
            break;
        case "doBestMove":
            doBestMove(e.data.pieces, e.data.active);
            break;
    }
  }

init = async function(wasmModule) {
    var imports = { env: { abort() {} }};
    const othelloWasm = await loader.instantiate(wasmModule, imports);
    const { __allocString, __retain, __getString, __release, _doBestMove, _timeTest } = othelloWasm.exports;

    doBestMove = function(pieces, active) {
        let start = Date.now();
        
        let piecesPtr = __retain(__allocString(pieces));
        let newBoardPtr = _doBestMove(piecesPtr, active);
        let newBoard = __getString(newBoardPtr);
        __release(newBoardPtr);
        __release(piecesPtr);    
        
        postMessage({ messageType: "doBestMove", newBoard: newBoard, timeTaken: (Date.now()-start) });
    }

    timeTest = function() {
        let start = Date.now();
        _timeTest();
        postMessage({ messageType: "timeTest", timeTaken: (Date.now()-start) });
    }

    postMessage({ messageType: "workerReady" });
}


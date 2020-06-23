const loader = require("@assemblyscript/loader");

var imports = { env: { abort() {} }};
var othelloWasm = null;

init = async function(wasmModule) {
    console.log('Worker: init');
    othelloWasm = await loader.instantiate(wasmModule, imports);
    
    postMessage({ messageType: "init" });
}

test = async function(testData) {
    console.log('Worker: data received' + testData);
    postMessage({ messageType: "test", testData: "a" });
}

dateTest = async function(testData) {
    const { dateTest } = othelloWasm.exports;
    var a = Date.now();
    dateTest();
    postMessage({ messageType: "dateTest", testData: Date.now()-a });
}

doMoveWrapper = async function (move) {
    const { __allocString, __retain, __release, __getString } = othelloWasm.exports;
    const { doMove, } = othelloWasm.exports;

    let sPtr = __retain(__allocString(move.pieces));
    let rPtr = doMove(sPtr, move.active, move.square);
    let r = __getString(rPtr);
    __release(rPtr);
    __release(sPtr);

    postMessage({ messageType: "doMove", board: r});
}

findBestMoveWrapper = async function (move) {
    const { __allocString, __retain, __release, __getString } = othelloWasm.exports;
    const { findBestMove, } = othelloWasm.exports;

    let sPtr = __retain(__allocString(move.pieces));
    let r = findBestMove(sPtr, move.active);
    __release(sPtr);

    postMessage({ messageType: "findBestMove", bestMove: r});
}

onmessage = async function(e) {
    console.log('worker on message', e);
    switch(e.data.messageType) {
        case "init":
            await init(e.data.wasmModule);
            break;
        case "test":
            await test(e.data.testData);
            break;
        case "dateTest":
            await dateTest(e.data.testData);
            break;
        case "doMove":
            await doMoveWrapper(e.data.move);
            break;
        case "findBestMove":
            await findBestMoveWrapper(e.data.move);
            break;
    }
  }
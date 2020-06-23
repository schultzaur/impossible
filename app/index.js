const loader = require("@assemblyscript/loader");

var loadResolve = null;

var myWorker = new Worker('worker.js');
myWorker.onmessage = function(e) {
    switch(e.data.messageType)
    {
        case "init":
            if (loadResolve !== null) { loadResolve("Loaded!"); }
            break;
        case "test":
            document.body.appendChild(component(e.data.testData));
            break;
        case "dateTest":
            document.body.appendChild(component(e.data.testData));
            break;
    }
}

async function loadModule() {
    var imports = { env: { abort() {} }};
    const response = await fetch('../build/optimized.wasm');
    const buffer = await response.arrayBuffer();
    const compiled = await WebAssembly.compile(buffer);

    // myWorker.postMessage({ messageType: "init", wasmModule: compiled });
    await new Promise(function (resolve, reject) {
        loadResolve = resolve;
        myWorker.postMessage({ messageType: "init", wasmModule: compiled });
    });

    return await loader.instantiate(compiled, imports);
}

function component(s) {
    const element = document.createElement('div');
    element.innerHTML = s;
    return element;
}

var imports = { env: { abort() {} }};
loadModule()
    .then(myModule => {
        const { xor, lsh, and } = myModule.exports;
        const { __allocString, __retain, __release, __getString } = myModule.exports;
    
        function doXor(aStr, bStr) {
            let aPtr = __retain(__allocString(aStr));
            let bPtr = __retain(__allocString(bStr));
            let cPtr = xor(aPtr, bPtr);
            let cStr = __getString(cPtr);
            __release(aPtr);
            __release(bPtr);
            __release(cPtr);
            return cStr;
        }
        
        function doLsh(aStr, b) {
            let aPtr = __retain(__allocString(aStr));
            let cPtr = lsh(aPtr, b);
            let cStr = __getString(cPtr);
            __release(aPtr);
            __release(cPtr);
            return cStr;
        }
    
        function doAnd(aStr) {
            let aPtr = __retain(__allocString(aStr));
            let bPtr = and(aPtr);
            let bStr = __getString(bPtr);
            __release(aPtr);
            __release(bPtr);
            return bStr;
        }
    
        const a = "0xf000000000000001";
        const b = "0xff00000000000011";
        console.log(doXor(a, b));

        document.body.appendChild(component(doXor(a, b)));
        document.body.appendChild(component(doLsh(b, 2)));
        document.body.appendChild(component(doAnd("0xFFFFFFFFFFFFFFFF")));
    
        const { Board, } = myModule.exports;
        
        function doBoardThings(aStr, color, move) {
            let aPtr = __retain(__allocString(aStr));
            let bPtr = Board.fromString(aPtr)
            let b = Board.wrap(bPtr);
            let b2Ptr = b.move(color, move);
            let b2 = Board.wrap(b2Ptr);
            let cPtr = b2.toString();
            let cStr = __getString(cPtr);
            __release(aPtr);
            __release(bPtr);
            __release(b2Ptr);
            __release(cPtr);
            return cStr;
        }
        
        function getBoardMoves(aStr, color) {
            let aPtr = __retain(__allocString(aStr));
            let bPtr = Board.fromString(aPtr)
            let b = Board.wrap(bPtr);
            let cPtr = b.toMoves(color);
            let cStr = __getString(cPtr);
            __release(aPtr);
            __release(bPtr);
            __release(cPtr);
            return cStr;
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
        document.body.appendChild(component(doBoardThings(board, 0, 52)));
        document.body.appendChild(component(doBoardThings(board, 1, 26)));
        document.body.appendChild(component(getBoardMoves(board, 0)));
        document.body.appendChild(component(getBoardMoves(board, 1)));

        return myModule;
    }).then(myModule => {
        myWorker.postMessage({ messageType: "test", testData: "hi2" });
        return myModule;
    }).then(myModule => {
        // should block, can't click checkmark.
        const { dateTest } = myModule.exports;
        var ad = Date.now();
        dateTest();
        document.body.appendChild(component(Date.now()-ad));
        return myModule;
    }).then(myModule => {
        // should not block, can't click checkmark.
        myWorker.postMessage({ messageType: "dateTest", testData: "hi" });
    });

console.log("test");
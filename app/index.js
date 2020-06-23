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
        case "doMove":
            document.body.appendChild(component(e.data.board));
            break;
        case "findBestMove":
            document.body.appendChild(component(e.data.bestMove));
            break;
    }
}

async function loadModule() {
    var imports = { env: { abort() {} }};
    const response = await fetch('../build/untouched.wasm');
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
        myWorker.postMessage({ messageType: "test", testData: "hi2" });
        return myModule;
    }).then(myModule => {
        // should not block, can click checkmark.
        myWorker.postMessage({ messageType: "dateTest", testData: "hi" });
        return myModule;
    }).then(myModule => {
        let board =
            "--------" +
            "--------" +
            "---B----" +
            "---BBW--" +
            "--BBWWW-" +
            "--BWWW--" +
            "--B-----" +
            "--------";

        let move = { pieces: board, active: 0, square: 52 }
        myWorker.postMessage({ messageType: "doMove", move: move });
        myWorker.postMessage({ messageType: "findBestMove", move: move });

        move = { pieces: board, active: 1, square: 26 }
        myWorker.postMessage({ messageType: "doMove", move: move });
        myWorker.postMessage({ messageType: "findBestMove", move: move });

        return myModule;
    });
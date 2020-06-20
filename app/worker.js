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
    }
  }
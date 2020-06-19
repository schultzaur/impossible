const loader = require("@assemblyscript/loader");

async function doStuff() {
    var imports = { env: { abort() {} }};
    const response = await fetch('../build/optimized.wasm');
    const buffer = await response.arrayBuffer();
    const myModule = await loader.instantiate(buffer, imports);
    const { xor, lsh, rsh } = myModule.exports;
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

    function doRsh(aStr, b) {
        let aPtr = __retain(__allocString(aStr));
        let cPtr = rsh(aPtr, b);
        let cStr = __getString(cPtr);
        __release(aPtr);
        __release(cPtr);
        return cStr;
    }

    const a = "0xf0000001";
    const b = "0xff000011";
    console.log(doXor(a, b));
    document.body.appendChild(component(doXor(a, b)));
    document.body.appendChild(component(doLsh(b, 2)));
    document.body.appendChild(component(doRsh(b, 2)));
}

function component(s) {
    const element = document.createElement('div');
    element.innerHTML = s;
    return element;
}

console.log("test");
doStuff();
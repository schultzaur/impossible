/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

eval("const loader = __webpack_require__(/*! @assemblyscript/loader */ \"./node_modules/@assemblyscript/loader/index.js\");\n\nasync function doStuff() {\n    var imports = { env: { abort() {} }};\n    const response = await fetch('../build/optimized.wasm');\n    const buffer = await response.arrayBuffer();\n    const myModule = await loader.instantiate(buffer, imports);\n    const { xor, lsh, rsh } = myModule.exports;\n    const { __allocString, __retain, __release, __getString } = myModule.exports;\n\n    function doXor(aStr, bStr) {\n        let aPtr = __retain(__allocString(aStr));\n        let bPtr = __retain(__allocString(bStr));\n        let cPtr = xor(aPtr, bPtr);\n        let cStr = __getString(cPtr);\n        __release(aPtr);\n        __release(bPtr);\n        __release(cPtr);\n        return cStr;\n    }\n    \n    function doLsh(aStr, b) {\n        let aPtr = __retain(__allocString(aStr));\n        let cPtr = lsh(aPtr, b);\n        let cStr = __getString(cPtr);\n        __release(aPtr);\n        __release(cPtr);\n        return cStr;\n    }\n\n    function doRsh(aStr, b) {\n        let aPtr = __retain(__allocString(aStr));\n        let cPtr = rsh(aPtr, b);\n        let cStr = __getString(cPtr);\n        __release(aPtr);\n        __release(cPtr);\n        return cStr;\n    }\n\n    const a = \"0xf0000001\";\n    const b = \"0xff000011\";\n    console.log(doXor(a, b));\n    document.body.appendChild(component(doXor(a, b)));\n    document.body.appendChild(component(doLsh(b, 2)));\n    document.body.appendChild(component(doRsh(b, 2)));\n}\n\nfunction component(s) {\n    const element = document.createElement('div');\n    element.innerHTML = s;\n    return element;\n}\n\nconsole.log(\"test\");\ndoStuff();\n\n//# sourceURL=webpack:///./index.js?");

/***/ }),

/***/ "./node_modules/@assemblyscript/loader/index.js":
/*!******************************************************!*\
  !*** ./node_modules/@assemblyscript/loader/index.js ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\n\n// Runtime header offsets\nconst ID_OFFSET = -8;\nconst SIZE_OFFSET = -4;\n\n// Runtime ids\nconst ARRAYBUFFER_ID = 0;\nconst STRING_ID = 1;\n// const ARRAYBUFFERVIEW_ID = 2;\n\n// Runtime type information\nconst ARRAYBUFFERVIEW = 1 << 0;\nconst ARRAY = 1 << 1;\nconst STATICARRAY = 1 << 2;\n// const SET = 1 << 3;\n// const MAP = 1 << 4;\nconst VAL_ALIGN_OFFSET = 6;\n// const VAL_ALIGN = 1 << VAL_ALIGN_OFFSET;\nconst VAL_SIGNED = 1 << 11;\nconst VAL_FLOAT = 1 << 12;\n// const VAL_NULLABLE = 1 << 13;\nconst VAL_MANAGED = 1 << 14;\n// const KEY_ALIGN_OFFSET = 15;\n// const KEY_ALIGN = 1 << KEY_ALIGN_OFFSET;\n// const KEY_SIGNED = 1 << 20;\n// const KEY_FLOAT = 1 << 21;\n// const KEY_NULLABLE = 1 << 22;\n// const KEY_MANAGED = 1 << 23;\n\n// Array(BufferView) layout\nconst ARRAYBUFFERVIEW_BUFFER_OFFSET = 0;\nconst ARRAYBUFFERVIEW_DATASTART_OFFSET = 4;\nconst ARRAYBUFFERVIEW_DATALENGTH_OFFSET = 8;\nconst ARRAYBUFFERVIEW_SIZE = 12;\nconst ARRAY_LENGTH_OFFSET = 12;\nconst ARRAY_SIZE = 16;\n\nconst BIGINT = typeof BigUint64Array !== \"undefined\";\nconst THIS = Symbol();\nconst CHUNKSIZE = 1024;\n\n/** Gets a string from an U32 and an U16 view on a memory. */\nfunction getStringImpl(buffer, ptr) {\n  const U32 = new Uint32Array(buffer);\n  const U16 = new Uint16Array(buffer);\n  let length = U32[(ptr + SIZE_OFFSET) >>> 2] >>> 1;\n  let offset = ptr >>> 1;\n  if (length <= CHUNKSIZE) return String.fromCharCode.apply(String, U16.subarray(offset, offset + length));\n  const parts = [];\n  do {\n    const last = U16[offset + CHUNKSIZE - 1];\n    const size = last >= 0xD800 && last < 0xDC00 ? CHUNKSIZE - 1 : CHUNKSIZE;\n    parts.push(String.fromCharCode.apply(String, U16.subarray(offset, offset += size)));\n    length -= size;\n  } while (length > CHUNKSIZE);\n  return parts.join(\"\") + String.fromCharCode.apply(String, U16.subarray(offset, offset + length));\n}\n\n/** Prepares the base module prior to instantiation. */\nfunction preInstantiate(imports) {\n  const extendedExports = {};\n\n  function getString(memory, ptr) {\n    if (!memory) return \"<yet unknown>\";\n    return getStringImpl(memory.buffer, ptr);\n  }\n\n  // add common imports used by stdlib for convenience\n  const env = (imports.env = imports.env || {});\n  env.abort = env.abort || function abort(msg, file, line, colm) {\n    const memory = extendedExports.memory || env.memory; // prefer exported, otherwise try imported\n    throw Error(\"abort: \" + getString(memory, msg) + \" at \" + getString(memory, file) + \":\" + line + \":\" + colm);\n  };\n  env.trace = env.trace || function trace(msg, n) {\n    const memory = extendedExports.memory || env.memory;\n    console.log(\"trace: \" + getString(memory, msg) + (n ? \" \" : \"\") + Array.prototype.slice.call(arguments, 2, 2 + n).join(\", \"));\n  };\n  env.seed = env.seed || function seed() {\n    return Date.now();\n  };\n  imports.Math = imports.Math || Math;\n  imports.Date = imports.Date || Date;\n\n  return extendedExports;\n}\n\n/** Prepares the final module once instantiation is complete. */\nfunction postInstantiate(extendedExports, instance) {\n  const exports = instance.exports;\n  const memory = exports.memory;\n  const table = exports.table;\n  const alloc = exports[\"__alloc\"];\n  const retain = exports[\"__retain\"];\n  const rttiBase = exports[\"__rtti_base\"] || ~0; // oob if not present\n\n  /** Gets the runtime type info for the given id. */\n  function getInfo(id) {\n    const U32 = new Uint32Array(memory.buffer);\n    const count = U32[rttiBase >>> 2];\n    if ((id >>>= 0) >= count) throw Error(\"invalid id: \" + id);\n    return U32[(rttiBase + 4 >>> 2) + id * 2];\n  }\n\n  /** Gets the runtime base id for the given id. */\n  function getBase(id) {\n    const U32 = new Uint32Array(memory.buffer);\n    const count = U32[rttiBase >>> 2];\n    if ((id >>>= 0) >= count) throw Error(\"invalid id: \" + id);\n    return U32[(rttiBase + 4 >>> 2) + id * 2 + 1];\n  }\n\n  /** Gets the runtime alignment of a collection's values. */\n  function getValueAlign(info) {\n    return 31 - Math.clz32((info >>> VAL_ALIGN_OFFSET) & 31); // -1 if none\n  }\n\n  /** Gets the runtime alignment of a collection's keys. */\n  // function getKeyAlign(info) {\n  //   return 31 - Math.clz32((info >>> KEY_ALIGN_OFFSET) & 31); // -1 if none\n  // }\n\n  /** Allocates a new string in the module's memory and returns its retained pointer. */\n  function __allocString(str) {\n    const length = str.length;\n    const ptr = alloc(length << 1, STRING_ID);\n    const U16 = new Uint16Array(memory.buffer);\n    for (var i = 0, p = ptr >>> 1; i < length; ++i) U16[p + i] = str.charCodeAt(i);\n    return ptr;\n  }\n\n  extendedExports.__allocString = __allocString;\n\n  /** Reads a string from the module's memory by its pointer. */\n  function __getString(ptr) {\n    const buffer = memory.buffer;\n    const id = new Uint32Array(buffer)[ptr + ID_OFFSET >>> 2];\n    if (id !== STRING_ID) throw Error(\"not a string: \" + ptr);\n    return getStringImpl(buffer, ptr);\n  }\n\n  extendedExports.__getString = __getString;\n\n  /** Gets the view matching the specified alignment, signedness and floatness. */\n  function getView(alignLog2, signed, float) {\n    const buffer = memory.buffer;\n    if (float) {\n      switch (alignLog2) {\n        case 2: return new Float32Array(buffer);\n        case 3: return new Float64Array(buffer);\n      }\n    } else {\n      switch (alignLog2) {\n        case 0: return new (signed ? Int8Array : Uint8Array)(buffer);\n        case 1: return new (signed ? Int16Array : Uint16Array)(buffer);\n        case 2: return new (signed ? Int32Array : Uint32Array)(buffer);\n        case 3: return new (signed ? BigInt64Array : BigUint64Array)(buffer);\n      }\n    }\n    throw Error(\"unsupported align: \" + alignLog2);\n  }\n\n  /** Allocates a new array in the module's memory and returns its retained pointer. */\n  function __allocArray(id, values) {\n    const info = getInfo(id);\n    if (!(info & (ARRAYBUFFERVIEW | ARRAY | STATICARRAY))) throw Error(\"not an array: \" + id + \", flags= \" + info);\n    const align = getValueAlign(info);\n    const length = values.length;\n    const buf = alloc(length << align, info & STATICARRAY ? id : ARRAYBUFFER_ID);\n    let result;\n    if (info & STATICARRAY) {\n      result = buf;\n    } else {\n      const arr = alloc(info & ARRAY ? ARRAY_SIZE : ARRAYBUFFERVIEW_SIZE, id);\n      const U32 = new Uint32Array(memory.buffer);\n      U32[arr + ARRAYBUFFERVIEW_BUFFER_OFFSET >>> 2] = retain(buf);\n      U32[arr + ARRAYBUFFERVIEW_DATASTART_OFFSET >>> 2] = buf;\n      U32[arr + ARRAYBUFFERVIEW_DATALENGTH_OFFSET >>> 2] = length << align;\n      if (info & ARRAY) U32[arr + ARRAY_LENGTH_OFFSET >>> 2] = length;\n      result = arr;\n    }\n    const view = getView(align, info & VAL_SIGNED, info & VAL_FLOAT);\n    if (info & VAL_MANAGED) {\n      for (let i = 0; i < length; ++i) view[(buf >>> align) + i] = retain(values[i]);\n    } else {\n      view.set(values, buf >>> align);\n    }\n    return result;\n  }\n\n  extendedExports.__allocArray = __allocArray;\n\n  /** Gets a live view on an array's values in the module's memory. Infers the array type from RTTI. */\n  function __getArrayView(arr) {\n    const U32 = new Uint32Array(memory.buffer);\n    const id = U32[arr + ID_OFFSET >>> 2];\n    const info = getInfo(id);\n    if (!(info & (ARRAYBUFFERVIEW | ARRAY | STATICARRAY))) throw Error(\"not an array: \" + id + \", flags=\" + info);\n    const align = getValueAlign(info);\n    let buf = info & STATICARRAY\n      ? arr\n      : U32[arr + ARRAYBUFFERVIEW_DATASTART_OFFSET >>> 2];\n    const length = info & ARRAY\n      ? U32[arr + ARRAY_LENGTH_OFFSET >>> 2]\n      : U32[buf + SIZE_OFFSET >>> 2] >>> align;\n    return getView(align, info & VAL_SIGNED, info & VAL_FLOAT).subarray(buf >>>= align, buf + length);\n  }\n\n  extendedExports.__getArrayView = __getArrayView;\n\n  /** Copies an array's values from the module's memory. Infers the array type from RTTI. */\n  function __getArray(arr) {\n    const input = __getArrayView(arr);\n    const len = input.length;\n    const out = new Array(len);\n    for (let i = 0; i < len; i++) out[i] = input[i];\n    return out;\n  }\n\n  extendedExports.__getArray = __getArray;\n\n  /** Copies an ArrayBuffer's value from the module's memory. */\n  function __getArrayBuffer(ptr) {\n    const buffer = memory.buffer;\n    const length = new Uint32Array(buffer)[ptr + SIZE_OFFSET >>> 2];\n    return buffer.slice(ptr, ptr + length);\n  }\n\n  extendedExports.__getArrayBuffer = __getArrayBuffer;\n\n  /** Copies a typed array's values from the module's memory. */\n  function getTypedArray(Type, alignLog2, ptr) {\n    return new Type(getTypedArrayView(Type, alignLog2, ptr));\n  }\n\n  /** Gets a live view on a typed array's values in the module's memory. */\n  function getTypedArrayView(Type, alignLog2, ptr) {\n    const buffer = memory.buffer;\n    const U32 = new Uint32Array(buffer);\n    const bufPtr = U32[ptr + ARRAYBUFFERVIEW_DATASTART_OFFSET >>> 2];\n    return new Type(buffer, bufPtr, U32[bufPtr + SIZE_OFFSET >>> 2] >>> alignLog2);\n  }\n\n  /** Attach a set of get TypedArray and View functions to the exports. */\n  function attachTypedArrayFunctions(ctor, name, align) {\n    extendedExports[\"__get\" + name] = getTypedArray.bind(null, ctor, align);\n    extendedExports[\"__get\" + name + \"View\"] = getTypedArrayView.bind(null, ctor, align);\n  }\n\n  [\n    Int8Array,\n    Uint8Array,\n    Uint8ClampedArray,\n    Int16Array,\n    Uint16Array,\n    Int32Array,\n    Uint32Array,\n    Float32Array,\n    Float64Array\n  ].forEach(ctor => {\n    attachTypedArrayFunctions(ctor, ctor.name, 31 - Math.clz32(ctor.BYTES_PER_ELEMENT));\n  });\n\n  if (BIGINT) {\n    [BigUint64Array, BigInt64Array].forEach(ctor => {\n      attachTypedArrayFunctions(ctor, ctor.name.slice(3), 3);\n    });\n  }\n\n  /** Tests whether an object is an instance of the class represented by the specified base id. */\n  function __instanceof(ptr, baseId) {\n    const U32 = new Uint32Array(memory.buffer);\n    let id = U32[(ptr + ID_OFFSET) >>> 2];\n    if (id <= U32[rttiBase >>> 2]) {\n      do {\n        if (id == baseId) return true;\n        id = getBase(id);\n      } while (id);\n    }\n    return false;\n  }\n\n  extendedExports.__instanceof = __instanceof;\n\n  // Pull basic exports to extendedExports so code in preInstantiate can use them\n  extendedExports.memory = extendedExports.memory || memory;\n  extendedExports.table  = extendedExports.table  || table;\n\n  // Demangle exports and provide the usual utility on the prototype\n  return demangle(exports, extendedExports);\n}\n\nfunction isResponse(src) {\n  return typeof Response !== \"undefined\" && src instanceof Response;\n}\n\nfunction isModule(src) {\n  return src instanceof WebAssembly.Module;\n}\n\n/** Asynchronously instantiates an AssemblyScript module from anything that can be instantiated. */\nasync function instantiate(source, imports = {}) {\n  if (isResponse(source = await source)) return instantiateStreaming(source, imports);\n  const module = isModule(source) ? source : await WebAssembly.compile(source);\n  const extended = preInstantiate(imports);\n  const instance = await WebAssembly.instantiate(module, imports);\n  const exports = postInstantiate(extended, instance);\n  return { module, instance, exports };\n}\n\nexports.instantiate = instantiate;\n\n/** Synchronously instantiates an AssemblyScript module from a WebAssembly.Module or binary buffer. */\nfunction instantiateSync(source, imports = {}) {\n  const module = isModule(source) ? source : new WebAssembly.Module(source);\n  const extended = preInstantiate(imports);\n  const instance = new WebAssembly.Instance(module, imports);\n  const exports = postInstantiate(extended, instance);\n  return { module, instance, exports };\n}\n\nexports.instantiateSync = instantiateSync;\n\n/** Asynchronously instantiates an AssemblyScript module from a response, i.e. as obtained by `fetch`. */\nasync function instantiateStreaming(source, imports = {}) {\n  if (!WebAssembly.instantiateStreaming) {\n    return instantiate(\n      isResponse(source = await source)\n        ? source.arrayBuffer()\n        : source,\n      imports\n    );\n  }\n  const extended = preInstantiate(imports);\n  const result = await WebAssembly.instantiateStreaming(source, imports);\n  const exports = postInstantiate(extended, result.instance);\n  return { ...result, exports };\n}\n\nexports.instantiateStreaming = instantiateStreaming;\n\n/** Demangles an AssemblyScript module's exports to a friendly object structure. */\nfunction demangle(exports, extendedExports = {}) {\n  extendedExports = Object.create(extendedExports);\n  const setArgumentsLength = exports[\"__argumentsLength\"]\n    ? length => { exports[\"__argumentsLength\"].value = length; }\n    : exports[\"__setArgumentsLength\"] || exports[\"__setargc\"] || (() => { /* nop */ });\n  for (let internalName in exports) {\n    if (!Object.prototype.hasOwnProperty.call(exports, internalName)) continue;\n    const elem = exports[internalName];\n    let parts = internalName.split(\".\");\n    let curr = extendedExports;\n    while (parts.length > 1) {\n      let part = parts.shift();\n      if (!Object.prototype.hasOwnProperty.call(curr, part)) curr[part] = {};\n      curr = curr[part];\n    }\n    let name = parts[0];\n    let hash = name.indexOf(\"#\");\n    if (hash >= 0) {\n      const className = name.substring(0, hash);\n      const classElem = curr[className];\n      if (typeof classElem === \"undefined\" || !classElem.prototype) {\n        const ctor = function(...args) {\n          return ctor.wrap(ctor.prototype.constructor(0, ...args));\n        };\n        ctor.prototype = {\n          valueOf: function valueOf() {\n            return this[THIS];\n          }\n        };\n        ctor.wrap = function(thisValue) {\n          return Object.create(ctor.prototype, { [THIS]: { value: thisValue, writable: false } });\n        };\n        if (classElem) Object.getOwnPropertyNames(classElem).forEach(name =>\n          Object.defineProperty(ctor, name, Object.getOwnPropertyDescriptor(classElem, name))\n        );\n        curr[className] = ctor;\n      }\n      name = name.substring(hash + 1);\n      curr = curr[className].prototype;\n      if (/^(get|set):/.test(name)) {\n        if (!Object.prototype.hasOwnProperty.call(curr, name = name.substring(4))) {\n          let getter = exports[internalName.replace(\"set:\", \"get:\")];\n          let setter = exports[internalName.replace(\"get:\", \"set:\")];\n          Object.defineProperty(curr, name, {\n            get: function() { return getter(this[THIS]); },\n            set: function(value) { setter(this[THIS], value); },\n            enumerable: true\n          });\n        }\n      } else {\n        if (name === 'constructor') {\n          (curr[name] = (...args) => {\n            setArgumentsLength(args.length);\n            return elem(...args);\n          }).original = elem;\n        } else { // instance method\n          (curr[name] = function(...args) { // !\n            setArgumentsLength(args.length);\n            return elem(this[THIS], ...args);\n          }).original = elem;\n        }\n      }\n    } else {\n      if (/^(get|set):/.test(name)) {\n        if (!Object.prototype.hasOwnProperty.call(curr, name = name.substring(4))) {\n          Object.defineProperty(curr, name, {\n            get: exports[internalName.replace(\"set:\", \"get:\")],\n            set: exports[internalName.replace(\"get:\", \"set:\")],\n            enumerable: true\n          });\n        }\n      } else if (typeof elem === \"function\" && elem !== setArgumentsLength) {\n        (curr[name] = (...args) => {\n          setArgumentsLength(args.length);\n          return elem(...args);\n        }).original = elem;\n      } else {\n        curr[name] = elem;\n      }\n    }\n  }\n  return extendedExports;\n}\n\nexports.demangle = demangle;\n\n\n//# sourceURL=webpack:///./node_modules/@assemblyscript/loader/index.js?");

/***/ })

/******/ });
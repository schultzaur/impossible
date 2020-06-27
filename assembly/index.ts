export { doMove as _doMove, doBestMove as _doBestMove } from "./interop"

export function _timeTest(): i32 {
  var a: i64 = Date.now();
  var c: u64 = 0;

  var i: i32 = 0;
  for(i = 0; i < 1000000000; i += 1)
  {
    c += i;

    if (Date.now() - a >= 1000) {
      break;
    }
  }
  
  return i;
}

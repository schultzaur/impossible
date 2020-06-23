import { Board } from "./Board"
import { AiBoard, minimax } from "./ai"
import { oppositeColor } from "./utils";

export function doMove(piecesStr: string, active: i8, square: i8): string {
    let board: Board = Board.fromString(piecesStr);
    let newBoard = new Board(board.move(active, square));
    return newBoard.toString();
}

export function findBestMove(piecesStr: string, maxColor: i8): i8 {
  let board: Board = Board.fromString(piecesStr);
  var minColor = oppositeColor(maxColor);
  var aiBoard = new AiBoard(board.pieces, -1, maxColor, minColor);
  var mm = minimax(aiBoard, 0);
  return mm.move;
}

export function dateTest(): i32 {
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
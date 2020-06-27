import * as othello from "./othello";

export const Players = {
    Player: 1,
    CPU: 2,
}

export class Game {
    constructor(board, playerColor, turnColor, lastMove) {
        this.board = (typeof board !== 'undefined') ? board : new othello.Board();
        this.player = (typeof playerColor !== 'undefined') ? playerColor : othello.Colors.Black;
        this.turn = (typeof turnColor !== 'undefined') ? turnColor : othello.Colors.Black;
        this.lastMove = (typeof lastMove !== 'undefined') ? lastMove : [-1,-1];
        this.validMovesBoard = this.getValidMovesBoard();
    }

    getValidMovesBoard() {
        var validMoves = othello.getEmptyBoard();

        if (this.turn == othello.Colors.None) {
            return validMoves;
        }

        this.board.validMoves[this.turn].forEach(validMove => {
            validMoves[validMove[0]][validMove[1]] = this.turn;
        })
       
        return validMoves;
    }

    move(row, col) {
        if (this.turn == othello.Colors.None || !othello.isValidMove(this.board.pieces, row, col, this.turn)) {
            return false;
        }

        var oppositeTurn = othello.getOppositeColor(this.turn)
        var newPieces = this.board.move(row, col, this.turn, oppositeTurn);

        if (!newPieces) {
            return false;
        }
        var newBoard = new othello.Board(newPieces);
        var nextTurn = othello.Colors.None;
        if (newBoard.validMoves[oppositeTurn].length > 0) {
            nextTurn = oppositeTurn;
        } else if (newBoard.validMoves[this.turn].length > 0) {
            nextTurn = this.turn;
        }

        return new Game(newBoard, this.player, nextTurn, [row, col]);
    }

    getGameLink() {
        var path;
        if (document.baseURI.indexOf("127.0.0.1") > -1) {
            path = "./renegade.html";
        } else {
            path = "./renegade";
        }

        var pieces = JSON.stringify(this.board.pieces);
        var player = JSON.stringify(this.player);
        var currentPlayer = JSON.stringify(this.turn);
        var lastMove = JSON.stringify(this.lastMove);
        
        path += `?pieces=${pieces}&player=${player}&currentPlayer=${currentPlayer}&lastMove=${lastMove}`

        return new URL(path, document.baseURI).href;
    }

    static fromGameLink(urlParams) {
        try {
            var pieces = JSON.parse(urlParams.get('pieces'));
            var playerColor = JSON.parse(urlParams.get('player'));
            var turnColor = JSON.parse(urlParams.get('currentPlayer'));
            var lastMove = JSON.parse(urlParams.get('lastMove'));

            if (pieces && playerColor && turnColor && lastMove) {
                return new Game(new othello.Board(pieces), playerColor, turnColor, lastMove);
            }
        }
        catch (error) {
            console.log(error);
        }        
        
        return new Game();
    }
}
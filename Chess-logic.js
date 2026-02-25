// Chess piece types
const PIECES = {
    PAWN: 'p',
    KNIGHT: 'n',
    BISHOP: 'b',
    ROOK: 'r',
    QUEEN: 'q',
    KING: 'k'
};

const WHITE = 'white';
const BLACK = 'black';

class ChessGame {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = WHITE;
        this.moveHistory = [];
        this.selectedSquare = null;
        this.validMoves = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameOver = false;
        this.gameOverReason = null;
    }

    initializeBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));

        // Set up white pieces
        board[7][0] = { type: PIECES.ROOK, color: WHITE };
        board[7][1] = { type: PIECES.KNIGHT, color: WHITE };
        board[7][2] = { type: PIECES.BISHOP, color: WHITE };
        board[7][3] = { type: PIECES.QUEEN, color: WHITE };
        board[7][4] = { type: PIECES.KING, color: WHITE };
        board[7][5] = { type: PIECES.BISHOP, color: WHITE };
        board[7][6] = { type: PIECES.KNIGHT, color: WHITE };
        board[7][7] = { type: PIECES.ROOK, color: WHITE };

        for (let i = 0; i < 8; i++) {
            board[6][i] = { type: PIECES.PAWN, color: WHITE };
        }

        // Set up black pieces
        board[0][0] = { type: PIECES.ROOK, color: BLACK };
        board[0][1] = { type: PIECES.KNIGHT, color: BLACK };
        board[0][2] = { type: PIECES.BISHOP, color: BLACK };
        board[0][3] = { type: PIECES.QUEEN, color: BLACK };
        board[0][4] = { type: PIECES.KING, color: BLACK };
        board[0][5] = { type: PIECES.BISHOP, color: BLACK };
        board[0][6] = { type: PIECES.KNIGHT, color: BLACK };
        board[0][7] = { type: PIECES.ROOK, color: BLACK };

        for (let i = 0; i < 8; i++) {
            board[1][i] = { type: PIECES.PAWN, color: BLACK };
        }

        return board;
    }

    getEmojis() {
        const emojis = {
            [WHITE]: {
                [PIECES.PAWN]: '♙',
                [PIECES.KNIGHT]: '♘',
                [PIECES.BISHOP]: '♗',
                [PIECES.ROOK]: '♖',
                [PIECES.QUEEN]: '♕',
                [PIECES.KING]: '♔'
            },
            [BLACK]: {
                [PIECES.PAWN]: '♟',
                [PIECES.KNIGHT]: '♞',
                [PIECES.BISHOP]: '♝',
                [PIECES.ROOK]: '♜',
                [PIECES.QUEEN]: '♛',
                [PIECES.KING]: '♚'
            }
        };
        return emojis;
    }

    getPieceEmoji(piece) {
        if (!piece) return '';
        const emojis = this.getEmojis();
        return emojis[piece.color][piece.type];
    }

    isValidPosition(row, col) {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    getValidMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];

        switch (piece.type) {
            case PIECES.PAWN:
                moves.push(...this.getPawnMoves(row, col, piece.color));
                break;
            case PIECES.KNIGHT:
                moves.push(...this.getKnightMoves(row, col, piece.color));
                break;
            case PIECES.BISHOP:
                moves.push(...this.getBishopMoves(row, col, piece.color));
                break;
            case PIECES.ROOK:
                moves.push(...this.getRookMoves(row, col, piece.color));
                break;
            case PIECES.QUEEN:
                moves.push(...this.getQueenMoves(row, col, piece.color));
                break;
            case PIECES.KING:
                moves.push(...this.getKingMoves(row, col, piece.color));
                break;
        }

        return moves.filter(move => !this.isKingInCheck(piece.color, row, col, move[0], move[1]));
    }

    getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === WHITE ? -1 : 1;
        const startRow = color === WHITE ? 6 : 1;

        const forwardRow = row + direction;
        if (this.isValidPosition(forwardRow, col) && !this.board[forwardRow][col]) {
            moves.push([forwardRow, col]);

            if (row === startRow) {
                const doubleRow = row + 2 * direction;
                if (!this.board[doubleRow][col]) {
                    moves.push([doubleRow, col]);
                }
            }
        }

        const leftCapture = col - 1;
        const rightCapture = col + 1;

        [leftCapture, rightCapture].forEach(c => {
            if (this.isValidPosition(forwardRow, c) && this.board[forwardRow][c]) {
                if (this.board[forwardRow][c].color !== color) {
                    moves.push([forwardRow, c]);
                }
            }
        });

        return moves;
    }

    getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2],
            [1, -2], [1, 2], [2, -1], [2, 1]
        ];

        knightMoves.forEach(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            if (this.isValidPosition(newRow, newCol)) {
                const targetPiece = this.board[newRow][newCol];
                if (!targetPiece || targetPiece.color !== color) {
                    moves.push([newRow, newCol]);
                }
            }
        });

        return moves;
    }

    getBishopMoves(row, col, color) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

        directions.forEach(([dRow, dCol]) => {
            this.getLineMoves(row, col, dRow, dCol, color, moves);
        });

        return moves;
    }

    getRookMoves(row, col, color) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

        directions.forEach(([dRow, dCol]) => {
            this.getLineMoves(row, col, dRow, dCol, color, moves);
        });

        return moves;
    }

    getQueenMoves(row, col, color) {
        return [...this.getBishopMoves(row, col, color), ...this.getRookMoves(row, col, color)];
    }

    getKingMoves(row, col, color) {
        const moves = [];
        for (let dRow = -1; dRow <= 1; dRow++) {
            for (let dCol = -1; dCol <= 1; dCol++) {
                if (dRow === 0 && dCol === 0) continue;
                const newRow = row + dRow;
                const newCol = col + dCol;
                if (this.isValidPosition(newRow, newCol)) {
                    const targetPiece = this.board[newRow][newCol];
                    if (!targetPiece || targetPiece.color !== color) {
                        moves.push([newRow, newCol]);
                    }
                }
            }
        }
        return moves;
    }

    getLineMoves(row, col, dRow, dCol, color, moves) {
        let newRow = row + dRow;
        let newCol = col + dCol;

        while (this.isValidPosition(newRow, newCol)) {
            const targetPiece = this.board[newRow][newCol];
            if (!targetPiece) {
                moves.push([newRow, newCol]);
            } else {
                if (targetPiece.color !== color) {
                    moves.push([newRow, newCol]);
                }
                break;
            }
            newRow += dRow;
            newCol += dCol;
        }
    }

    isKingInCheck(color, fromRow, fromCol, toRow, toCol) {
        const originalPiece = this.board[toRow][toCol];
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;

        let kingRow, kingCol;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.board[r][c] && this.board[r][c].type === PIECES.KING && this.board[r][c].color === color) {
                    kingRow = r;
                    kingCol = c;
                }
            }
        }

        let inCheck = false;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color !== color) {
                    const moves = this.getDirectMoves(r, c);
                    if (moves.some(([mr, mc]) => mr === kingRow && mc === kingCol)) {
                        inCheck = true;
                        break;
                    }
                }
            }
            if (inCheck) break;
        }

        this.board[fromRow][fromCol] = this.board[toRow][toCol];
        this.board[toRow][toCol] = originalPiece;

        return inCheck;
    }

    getDirectMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];

        const moves = [];

        switch (piece.type) {
            case PIECES.PAWN:
                moves.push(...this.getPawnMoves(row, col, piece.color));
                break;
            case PIECES.KNIGHT:
                moves.push(...this.getKnightMoves(row, col, piece.color));
                break;
            case PIECES.BISHOP:
                moves.push(...this.getBishopMoves(row, col, piece.color));
                break;
            case PIECES.ROOK:
                moves.push(...this.getRookMoves(row, col, piece.color));
                break;
            case PIECES.QUEEN:
                moves.push(...this.getQueenMoves(row, col, piece.color));
                break;
            case PIECES.KING:
                moves.push(...this.getKingMoves(row, col, piece.color));
                break;
        }

        return moves;
    }

    makeMove(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        if (!piece) return false;

        const validMoves = this.getValidMoves(fromRow, fromCol);
        if (!validMoves.some(([r, c]) => r === toRow && c === toCol)) {
            return false;
        }

        const captured = this.board[toRow][toCol];
        if (captured) {
            this.capturedPieces[captured.color].push(captured);
        }

        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        const moveNotation = this.getMoveNotation(fromRow, fromCol, toRow, toCol, piece, captured);
        this.moveHistory.push({
            from: [fromRow, fromCol],
            to: [toRow, toCol],
            piece: piece,
            captured: captured,
            notation: moveNotation
        });

        this.currentPlayer = this.currentPlayer === WHITE ? BLACK : WHITE;
        return true;
    }

    getMoveNotation(fromRow, fromCol, toRow, toCol, piece, captured) {
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

        const fromSquare = files[fromCol] + ranks[fromRow];
        const toSquare = files[toCol] + ranks[toRow];

        let notation = '';
        if (piece.type !== PIECES.PAWN) {
            notation = piece.type.toUpperCase();
        }

        if (captured) {
            if (piece.type === PIECES.PAWN) {
                notation = files[fromCol];
            }
            notation += 'x';
        }

        notation += toSquare;

        return notation;
    }

    canCurrentPlayerMove() {
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.board[r][c];
                if (piece && piece.color === this.currentPlayer) {
                    if (this.getValidMoves(r, c).length > 0) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    reset() {
        this.board = this.initializeBoard();
        this.currentPlayer = WHITE;
        this.moveHistory = [];
        this.selectedSquare = null;
        this.validMoves = [];
        this.capturedPieces = { white: [], black: [] };
        this.gameOver = false;
        this.gameOverReason = null;
    }
}

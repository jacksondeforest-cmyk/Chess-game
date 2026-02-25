class ChessBot {
    constructor(game, color = BLACK) {
        this.game = game;
        this.color = color;
        this.depth = 3; // Search depth for minimax
        this.maxTime = 2000; // Max time for bot to think (2 seconds)
    }

    makeMove() {
        const startTime = Date.now();
        const bestMove = this.findBestMove(this.depth, startTime);

        if (bestMove) {
            this.game.makeMove(bestMove[0], bestMove[1], bestMove[2], bestMove[3]);
            return true;
        }
        return false;
    }

    findBestMove(depth, startTime) {
        let bestMove = null;
        let bestScore = -Infinity;

        const moves = this.getAllLegalMoves(this.color);

        // Add some randomness for 800 ELO
        if (Math.random() < 0.3) {
            return moves[Math.floor(Math.random() * moves.length)];
        }

        for (const move of moves) {
            if (Date.now() - startTime > this.maxTime) break;

            this.game.board[move[2]][move[3]] = this.game.board[move[0]][move[1]];
            this.game.board[move[0]][move[1]] = null;

            const score = this.minimax(depth - 1, -Infinity, Infinity, false, startTime);

            this.game.board[move[0]][move[1]] = this.game.board[move[2]][move[3]];
            this.game.board[move[2]][move[3]] = this.game.board[move[0]][move[1]];

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove || moves[Math.floor(Math.random() * moves.length)];
    }

    minimax(depth, alpha, beta, isMaximizing, startTime) {
        if (Date.now() - startTime > this.maxTime) {
            return this.evaluateBoard();
        }

        if (depth === 0) {
            return this.evaluateBoard();
        }

        const moves = this.getAllLegalMoves(isMaximizing ? this.color : this.getOppositeColor(this.color));

        if (moves.length === 0) {
            return isMaximizing ? -Infinity : Infinity;
        }

        if (isMaximizing) {
            let maxScore = -Infinity;
            for (const move of moves) {
                this.game.board[move[2]][move[3]] = this.game.board[move[0]][move[1]];
                this.game.board[move[0]][move[1]] = null;

                const score = this.minimax(depth - 1, alpha, beta, false, startTime);

                this.game.board[move[0]][move[1]] = this.game.board[move[2]][move[3]];
                this.game.board[move[2]][move[3]] = this.game.board[move[0]][move[1]];

                maxScore = Math.max(score, maxScore);
                alpha = Math.max(alpha, score);
                if (beta <= alpha) break;
            }
            return maxScore;
        } else {
            let minScore = Infinity;
            for (const move of moves) {
                this.game.board[move[2]][move[3]] = this.game.board[move[0]][move[1]];
                this.game.board[move[0]][move[1]] = null;

                const score = this.minimax(depth - 1, alpha, beta, true, startTime);

                this.game.board[move[0]][move[1]] = this.game.board[move[2]][move[3]];
                this.game.board[move[2]][move[3]] = this.game.board[move[0]][move[1]];

                minScore = Math.min(score, minScore);
                beta = Math.min(beta, score);
                if (beta <= alpha) break;
            }
            return minScore;
        }
    }

    evaluateBoard() {
        const pieceValues = {
            [PIECES.PAWN]: 1,
            [PIECES.KNIGHT]: 3,
            [PIECES.BISHOP]: 3.3,
            [PIECES.ROOK]: 5,
            [PIECES.QUEEN]: 9,
            [PIECES.KING]: 0
        };

        let score = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.game.board[r][c];
                if (piece) {
                    const value = pieceValues[piece.type];
                    const positionBonus = this.getPositionBonus(piece, r, c);
                    if (piece.color === this.color) {
                        score += value + positionBonus;
                    } else {
                        score -= value + positionBonus;
                    }
                }
            }
        }
        return score;
    }

    getPositionBonus(piece, row, col) {
        const centerRows = [3, 4];
        const centerCols = [3, 4];

        let bonus = 0;

        if (piece.type === PIECES.PAWN) {
            if (centerCols.includes(col)) bonus += 0.3;
        } else if (piece.type === PIECES.KNIGHT || piece.type === PIECES.BISHOP) {
            if (centerRows.includes(row) && centerCols.includes(col)) bonus += 0.5;
        }

        return bonus;
    }

    getAllLegalMoves(color) {
        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.game.board[r][c];
                if (piece && piece.color === color) {
                    const validMoves = this.game.getValidMoves(r, c);
                    for (const move of validMoves) {
                        moves.push([r, c, move[0], move[1]]);
                    }
                }
            }
        }
        return moves;
    }

    getOppositeColor(color) {
        return color === WHITE ? BLACK : WHITE;
    }
}

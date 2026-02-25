class ChessUI {
    constructor() {
        this.game = new ChessGame();
        this.bot = new ChessBot(this.game, BLACK);
        this.boardElement = document.getElementById('board');
        this.gameStatusElement = document.getElementById('gameStatus');
        this.moveCountElement = document.getElementById('moveCount');
        this.movesListElement = document.getElementById('movesList');
        this.resetBtn = document.getElementById('resetBtn');
        this.undoBtn = document.getElementById('undoBtn');
        this.hintsBtn = document.getElementById('hintsBtn');
        this.playerColor = WHITE;

        this.setupEventListeners();
        this.renderBoard();
    }

    setupEventListeners() {
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.undoBtn.addEventListener('click', () => this.undoMove());
        this.hintsBtn.addEventListener('click', () => this.showHint());
        this.boardElement.addEventListener('click', (e) => this.handleSquareClick(e));
    }

    handleSquareClick(e) {
        const square = e.target.closest('.square');
        if (!square || this.game.gameOver) return;

        if (this.game.currentPlayer !== this.playerColor) return;

        const col = parseInt(square.dataset.col);
        const row = parseInt(square.dataset.row);

        if (this.game.selectedSquare) {
            const [selectedRow, selectedCol] = this.game.selectedSquare;

            if (selectedRow === row && selectedCol === col) {
                this.deselectSquare();
                return;
            }

            const validMoves = this.game.getValidMoves(selectedRow, selectedCol);
            const isValidMove = validMoves.some(([r, c]) => r === row && c === col);

            if (isValidMove) {
                this.game.makeMove(selectedRow, selectedCol, row, col);
                this.game.selectedSquare = null;
                this.game.validMoves = [];
                this.renderBoard();
                this.updateUI();

                setTimeout(() => {
                    if (!this.game.gameOver && this.game.currentPlayer === BLACK) {
                        this.bot.makeMove();
                        this.renderBoard();
                        this.updateUI();
                    }
                }, 500);
            } else {
                const piece = this.game.board[row][col];
                if (piece && piece.color === this.playerColor) {
                    this.game.selectedSquare = [row, col];
                    this.game.validMoves = this.game.getValidMoves(row, col);
                    this.renderBoard();
                } else {
                    this.deselectSquare();
                }
            }
        } else {
            const piece = this.game.board[row][col];
            if (piece && piece.color === this.playerColor) {
                this.game.selectedSquare = [row, col];
                this.game.validMoves = this.game.getValidMoves(row, col);
                this.renderBoard();
            }
        }
    }

    deselectSquare() {
        this.game.selectedSquare = null;
        this.game.validMoves = [];
        this.renderBoard();
    }

    renderBoard() {
        this.boardElement.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                const isWhiteSquare = (row + col) % 2 === 0;
                square.className = `square ${isWhiteSquare ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;

                if (this.game.selectedSquare && this.game.selectedSquare[0] === row && this.game.selectedSquare[1] === col) {
                    square.classList.add('selected');
                }

                if (this.game.validMoves.some(([r, c]) => r === row && c === col)) {
                    square.classList.add('valid-move');
                    if (this.game.board[row][col]) {
                        square.classList.add('has-piece');
                    }
                }

                if (this.game.moveHistory.length > 0) {
                    const lastMove = this.game.moveHistory[this.game.moveHistory.length - 1];
                    if ((lastMove.to[0] === row && lastMove.to[1] === col) ||
                        (lastMove.from[0] === row && lastMove.from[1] === col)) {
                        square.classList.add('last-move');
                    }
                }

                const piece = this.game.board[row][col];
                if (piece) {
                    const pieceEmoji = this.game.getPieceEmoji(piece);
                    square.innerHTML = `<span class="piece">${pieceEmoji}</span>`;
                }

                this.boardElement.appendChild(square);
            }
        }
    }

    updateUI() {
        this.moveCountElement.textContent = this.game.moveHistory.length;

        if (this.game.currentPlayer === this.playerColor) {
            this.gameStatusElement.textContent = 'Your Turn';
            this.gameStatusElement.style.color = '#27ae60';
        } else {
            this.gameStatusElement.textContent = 'Bot Thinking...';
            this.gameStatusElement.style.color = '#e74c3c';
        }

        this.updateMovesList();
    }

    updateMovesList() {
        this.movesListElement.innerHTML = '';

        this.game.moveHistory.forEach((move, index) => {
            const moveElement = document.createElement('div');
            moveElement.className = 'move-item';
            if (index % 2 === 1) {
                moveElement.classList.add('bot-move');
            }
            moveElement.textContent = `${Math.floor(index / 2) + 1}. ${move.notation}`;
            this.movesListElement.appendChild(moveElement);
        });

        this.movesListElement.scrollTop = this.movesListElement.scrollHeight;
    }

    undoMove() {
        if (this.game.moveHistory.length < 2) return;

        this.game.moveHistory.pop();
        this.game.moveHistory.pop();

        this.game.board = this.game.initializeBoard();
        this.game.currentPlayer = WHITE;

        for (const move of this.game.moveHistory) {
            this.game.board[move.to[0]][move.to[1]] = move.piece;
            this.game.board[move.from[0]][move.from[1]] = null;
            this.game.currentPlayer = this.game.currentPlayer === WHITE ? BLACK : WHITE;
        }

        this.renderBoard();
        this.updateUI();
    }

    showHint() {
        if (this.game.currentPlayer !== this.playerColor) return;

        const moves = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = this.game.board[r][c];
                if (piece && piece.color === this.playerColor) {
                    const validMoves = this.game.getValidMoves(r, c);
                    for (const move of validMoves) {
                        moves.push([r, c, move[0], move[1]]);
                    }
                }
            }
        }

        if (moves.length === 0) return;

        const hint = moves[Math.floor(Math.random() * moves.length)];
        this.game.selectedSquare = [hint[0], hint[1]];
        this.game.validMoves = this.game.getValidMoves(hint[0], hint[1]);
        this.renderBoard();
    }

    resetGame() {
        this.game.reset();
        this.renderBoard();
        this.updateUI();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ChessUI();
});

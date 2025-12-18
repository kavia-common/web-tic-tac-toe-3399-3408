/* global console */
import './style.css';

/**
 * PUBLIC_INTERFACE
 * Initializes the Tic Tac Toe application.
 * Renders the board, handles game logic, updates status, and provides accessibility.
 */
function initTicTacToe() {
  const app = document.querySelector('#app');

  // App container HTML
  app.innerHTML = `
    <main class="app-container" role="main">
      <header class="app-header">
        <h1 class="title">Tic Tac Toe</h1>
        <p class="subtitle">Ocean Professional</p>
      </header>

      <section class="status-panel" aria-live="polite">
        <div class="turn-indicator" id="turnIndicator" aria-atomic="true">
          Player <span class="badge badge-x" id="currentPlayer">X</span>'s turn
        </div>
        <div class="game-status" id="gameStatus" aria-atomic="true">In progress</div>
      </section>

      <section class="board-wrapper">
        <div
          class="board"
          id="board"
          role="grid"
          aria-label="Tic Tac Toe board"
        >
          ${Array.from({ length: 9 })
            .map(
              (_, i) => `
            <button
              class="cell"
              id="cell-${i}"
              role="gridcell"
              aria-label="Empty cell"
              aria-live="off"
              data-index="${i}"
              data-value=""
              tabindex="${i === 0 ? '0' : '-1'}"
            ></button>`
            )
            .join('')}
        </div>
      </section>

      <section class="controls">
        <button class="btn btn-primary" id="resetBtn" aria-label="Start a new game">
          New Game
        </button>
      </section>

      <footer class="app-footer">
        <small>Keyboard: Use arrow keys to move, Enter/Space to place. X starts.</small>
      </footer>
    </main>
  `;

  // Game state
  let board = Array(9).fill(null);
  let currentPlayer = 'X';
  let gameOver = false;

  // Elements
  const cells = Array.from(document.querySelectorAll('.cell'));
  const turnIndicator = document.getElementById('turnIndicator');
  const currentPlayerEl = document.getElementById('currentPlayer');
  const gameStatus = document.getElementById('gameStatus');
  const resetBtn = document.getElementById('resetBtn');

  // Winning line combinations
  const LINES = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // cols
    [0, 4, 8],
    [2, 4, 6], // diagonals
  ];

  // Helpers
  const setStatus = (text) => {
    gameStatus.textContent = text;
  };

  const updateTurnIndicator = () => {
    currentPlayerEl.textContent = currentPlayer;
    currentPlayerEl.className = `badge ${currentPlayer === 'X' ? 'badge-x' : 'badge-o'}`;
  };

  const checkWinner = () => {
    for (const [a, b, c] of LINES) {
      if (board[a] && board[a] === board[b] && board[b] === board[c]) {
        return { winner: board[a], line: [a, b, c] };
      }
    }
    if (board.every((c) => c !== null)) {
      return { winner: null, line: [] }; // Draw
    }
    return null; // In progress
  };

  const announceResult = (result) => {
    if (result.winner) {
      setStatus(`Player ${result.winner} wins!`);
      turnIndicator.textContent = `Player ${result.winner} wins!`;
    } else {
      setStatus('Draw!');
      turnIndicator.textContent = 'Draw!';
    }
  };

  const highlightWinningLine = (line) => {
    line.forEach((idx) => {
      const cell = document.getElementById(`cell-${idx}`);
      cell.classList.add('cell-win');
      cell.setAttribute('aria-label', `${cell.dataset.value} in winning line`);
    });
  };

  const renderCell = (idx) => {
    const cell = document.getElementById(`cell-${idx}`);
    const value = board[idx];
    cell.dataset.value = value ?? '';
    cell.textContent = value ? value : '';
    cell.setAttribute('aria-label', value ? `Cell with ${value}` : 'Empty cell');
    cell.classList.toggle('cell-x', value === 'X');
    cell.classList.toggle('cell-o', value === 'O');
  };

  const renderBoard = () => {
    for (let i = 0; i < 9; i++) renderCell(i);
  };

  const handleMove = (idx) => {
    if (gameOver || board[idx] !== null) return;

    board[idx] = currentPlayer;
    renderCell(idx);

    const result = checkWinner();
    if (result) {
      gameOver = true;
      if (result.winner) {
        highlightWinningLine(result.line);
      }
      announceResult(result);
      // Disable remaining cells from tabbing
      cells.forEach((c) => c.setAttribute('tabindex', '-1'));
      resetBtn.focus();
      return;
    }

    // Continue game
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    updateTurnIndicator();

    // Manage focus order to next empty cell
    const nextIdx = board.findIndex((v, i) => v === null && i > idx);
    const firstEmpty = board.findIndex((v) => v === null);
    const focusIdx = nextIdx !== -1 ? nextIdx : firstEmpty;
    if (focusIdx !== -1) {
      cells.forEach((c) => c.setAttribute('tabindex', '-1'));
      const nextCell = document.getElementById(`cell-${focusIdx}`);
      nextCell.setAttribute('tabindex', '0');
      nextCell.focus();
    }
  };

  const resetGame = () => {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameOver = false;
    setStatus('In progress');
    updateTurnIndicator();
    cells.forEach((c, i) => {
      c.classList.remove('cell-win');
      c.classList.remove('cell-x', 'cell-o');
      c.dataset.value = '';
      c.textContent = '';
      c.setAttribute('aria-label', 'Empty cell');
      c.setAttribute('tabindex', i === 0 ? '0' : '-1');
    });
    // Restore focus to first cell
    document.getElementById('cell-0').focus();
  };

  // Mouse and keyboard handlers
  cells.forEach((cell) => {
    const idx = Number(cell.dataset.index);

    cell.addEventListener('click', () => handleMove(idx));

    cell.addEventListener('keydown', (e) => {
      // Keyboard navigation within the 3x3 grid
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      let targetIdx = idx;

      switch (e.key) {
        case 'ArrowUp':
          targetIdx = (row > 0 ? (row - 1) : 2) * 3 + col;
          break;
        case 'ArrowDown':
          targetIdx = (row < 2 ? (row + 1) : 0) * 3 + col;
          break;
        case 'ArrowLeft':
          targetIdx = row * 3 + (col > 0 ? (col - 1) : 2);
          break;
        case 'ArrowRight':
          targetIdx = row * 3 + (col < 2 ? (col + 1) : 0);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleMove(idx);
          return;
        default:
          return;
      }

      if (targetIdx !== idx) {
        e.preventDefault();
        cells.forEach((c) => c.setAttribute('tabindex', '-1'));
        const nextCell = document.getElementById(`cell-${targetIdx}`);
        nextCell.setAttribute('tabindex', '0');
        nextCell.focus();
      }
    });
  });

  resetBtn.addEventListener('click', resetGame);

  // Initial render
  renderBoard();
  updateTurnIndicator();

  // Respect environment variables if needed (example of reading without enforcing)
  const env = import.meta?.env || {};
  if (env?.VITE_LOG_LEVEL === 'debug' && typeof console !== 'undefined' && typeof console.debug === 'function') {
    console.debug('Tic Tac Toe initialized', {
      VITE_NODE_ENV: env.VITE_NODE_ENV,
      VITE_FEATURE_FLAGS: env.VITE_FEATURE_FLAGS,
    });
  }
}

// Initialize app
initTicTacToe();

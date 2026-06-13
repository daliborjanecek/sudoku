import { SudokuGame } from './SudokuGame.js';

export { SudokuGame };

if (typeof customElements !== 'undefined' && !customElements.get('sudoku-game')) {
  customElements.define('sudoku-game', SudokuGame);
}

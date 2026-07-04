// CSS injected into the shadow root. Fully scoped — no leakage to the host page.

export const styles = `
:host {
  /*
   * Public theming hooks are read once into private variables with fallbacks.
   * Using distinct names (--_x reads --sudoku-x) avoids self-referential
   * cycles, so host pages can override any --sudoku-* property reliably.
   */
  --_accent: var(--sudoku-accent, #006cb9);
  --_user: var(--sudoku-user-color, #006cb9);
  --_conflict: var(--sudoku-conflict-color, #cc3c00);
  --_win: var(--sudoku-win-color, #af8b08);
  --_font: var(--sudoku-font, "Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif);

  --_bg: var(--sudoku-bg, #ffffff);
  --_grid-line: var(--sudoku-grid-line, #cbd5e1);
  --_block-line: var(--sudoku-grid-block-line, #1e293b);
  --_given: var(--sudoku-given-color, #0f172a);
  --_cell-bg: var(--sudoku-cell-bg, #ffffff);
  --_selected-bg: var(--sudoku-selected-bg, #d9ebf8);
  --_conflict-bg: var(--sudoku-conflict-bg, #fbe4d9);
  --_btn-bg: var(--sudoku-btn-bg, #f1f5f9);
  --_btn-text: var(--sudoku-btn-text, #0f172a);

  container-type: inline-size;
  display: block;
  width: 100%;
  box-sizing: border-box;
  font-family: var(--_font);
  color: var(--_given);
  -webkit-tap-highlight-color: transparent;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.wrap {
  position: relative;
  width: 100%;
  background: var(--_bg);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ---------- Top bar ---------- */
.topbar {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.timer {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: clamp(16px, 5cqw, 22px);
  padding: 6px 10px;
  background: var(--_btn-bg);
  border-radius: 8px;
  min-width: 64px;
  text-align: center;
}

.spacer { flex: 1 1 auto; }

button {
  font-family: inherit;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  background: var(--_btn-bg);
  color: var(--_btn-text);
  font-size: clamp(13px, 3.5cqw, 15px);
  padding: 8px 12px;
  min-height: 40px;
  transition: background 0.15s, transform 0.05s;
}
button:hover { filter: brightness(0.96); }
button:active { transform: scale(0.97); }
button:focus-visible {
  outline: 2px solid var(--_accent);
  outline-offset: 2px;
}

.btn-confirm {
  background: var(--_conflict);
  color: #fff;
}

/* ---------- Grid ---------- */
.grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-template-rows: repeat(9, 1fr);
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 2px solid var(--_block-line);
  border-radius: 4px;
  overflow: hidden;
  user-select: none;
  touch-action: manipulation;
}

.cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 1 / 1;
  background: var(--_cell-bg);
  border-right: 1px solid var(--_grid-line);
  border-bottom: 1px solid var(--_grid-line);
  font-size: clamp(14px, 6cqw, 30px);
  font-weight: 500;
  color: var(--_user);
  cursor: pointer;
  line-height: 1;
}

.cell.given {
  color: var(--_given);
  font-weight: 700;
  cursor: default;
}

/* Thicker block separators (every 3rd column/row). */
.cell:nth-child(9n) { border-right: none; }
.cell:nth-child(3n):not(:nth-child(9n)) {
  border-right: 2px solid var(--_block-line);
}
.cell.row-block {
  border-bottom: 2px solid var(--_block-line);
}
.cell.last-row { border-bottom: none; }

.cell.selectable:hover {
  background: var(--_selected-bg);
}
.cell.selected {
  background: var(--_selected-bg);
  box-shadow: inset 0 0 0 2px var(--_accent);
  z-index: 1;
}
.cell.conflict {
  background: var(--_conflict-bg);
  color: var(--_conflict);
}
.cell.given.conflict {
  color: var(--_conflict);
}
.cell.selected.conflict {
  background: var(--_conflict-bg);
}

/* ---------- Keypad ---------- */
.keypad {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}
.keypad button {
  min-height: 44px;
  min-width: 44px;
  font-size: clamp(16px, 5cqw, 22px);
  font-weight: 600;
}
.keypad .key-erase {
  grid-column: span 5;
  background: var(--_btn-bg);
}

@container (min-width: 360px) {
  .keypad {
    grid-template-columns: repeat(10, 1fr);
  }
  .keypad .key-erase {
    grid-column: span 1;
  }
}

/* ---------- Overlay ---------- */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.55);
  border-radius: 4px;
  z-index: 10;
  padding: 16px;
}
.overlay-card {
  background: var(--_bg);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  max-width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}
.overlay-card h2 {
  margin: 0 0 8px;
  font-size: clamp(20px, 6cqw, 28px);
  color: var(--_win);
}
.overlay-card p {
  margin: 0 0 16px;
  font-size: clamp(14px, 4cqw, 18px);
  color: var(--_given);
}
.overlay-card .big-time {
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--_win);
}
.overlay-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}
.overlay-actions .btn-primary {
  background: var(--_win);
  color: #fff;
}
`;

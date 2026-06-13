# Sudoku Web Component

An embeddable Sudoku widget built as a native Web Component (custom element) in
TypeScript. No framework, no runtime dependencies — the output is a single
self-contained JS file you can drop into any page.

## Embed

```html
<script src="https://example.com/sudoku.iife.js"></script>
<sudoku-game difficulty="3"></sudoku-game>
```

### Attributes

| Attribute     | Required | Default        | Description                                  |
| ------------- | -------- | -------------- | -------------------------------------------- |
| `difficulty`  | yes      | `3`            | Number 1–5. Invalid/missing falls back to 3. |
| `storage-key` | no       | `sudoku-game`  | localStorage key for saved progress.         |

Multiple instances on one page run independently — all state lives on the
element instance, never in module scope.

## Features

- Full grid generation via randomized backtracking; unique-solution guarantee
  verified by a counting solver with early exit.
- Difficulty maps to a target range of empty cells (1: 30–35 … 5: 52–56).
- Click/tap to select an editable cell, then a keypad digit (or physical
  keyboard: arrows to move, 1–9 to write, Backspace/Delete/0 to erase).
- Given numbers are black; user numbers are blue.
- Live conflict detection: any row, column, or 3×3 block containing a repeated
  digit is highlighted red, and the highlight clears as soon as it is resolved.
- Timer (mm:ss) that stores elapsed seconds, pauses on inactive tabs
  (Page Visibility API), and resets with the game.
- **Reset** and **New game** buttons with inline confirmation (no
  `window.confirm`).
- Completion overlay with the solve time.
- Progress persisted to localStorage after every move; restored on load.
  Gracefully runs without persistence when storage is unavailable.

## Theming

Styling is isolated in the shadow DOM. Override these CSS custom properties on
the element (each has a built-in fallback):

| Property                  | Default      |
| ------------------------- | ------------ |
| `--sudoku-accent`         | blue         |
| `--sudoku-user-color`     | blue         |
| `--sudoku-conflict-color` | red          |
| `--sudoku-font`           | system stack |

Additional surface colors (`--sudoku-bg`, `--sudoku-cell-bg`,
`--sudoku-btn-bg`, …) are listed in `src/styles.ts`.

```css
sudoku-game {
  --sudoku-accent: #7c3aed;
}
```

The widget adapts to its parent's width using container queries (no viewport
media queries), and keypad buttons keep a 44×44 px minimum touch target.

## Development

```bash
npm install
npm run dev      # Vite dev server with the demo (index.html)
npm test         # Vitest unit tests (generator/solver + component smoke tests)
npm run build    # Type-check + bundle to dist/ (es + iife) + .d.ts
```

The demo `index.html` mounts three instances with different difficulties,
storage keys, and a custom theme for manual testing.

## Project structure

```
src/
  index.ts        # customElements.define('sudoku-game', SudokuGame)
  SudokuGame.ts   # custom element: render, interaction, persistence, timer
  generator.ts    # generator + solver (pure functions, no DOM)
  styles.ts       # CSS string injected into the shadow root
vite.config.ts    # library mode, formats es + iife, name SudokuGame
```

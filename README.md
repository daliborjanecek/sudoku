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

Styling is isolated in the shadow DOM — nothing leaks in or out. The only way
to restyle the widget is through its public CSS custom properties, set on the
element itself (each has a built-in fallback, so you only need to override
what you actually want to change):

```css
sudoku-game {
  --sudoku-accent: #7c3aed;
  --sudoku-user-color: #7c3aed;
}
```

Or inline: `<sudoku-game style="--sudoku-accent: #7c3aed">`.

### Colors

| Property                   | Default   | Role                                                                                                    |
| --------------------------- | --------- | --------------------------------------------------------------------------------------------------------- |
| `--sudoku-accent`          | `#006cb9` | selection outline, primary buttons                                                                       |
| `--sudoku-user-color`      | `#006cb9` | numbers typed in by the player                                                                            |
| `--sudoku-given-color`     | `#1c1e1f` | numbers pre-filled by the puzzle                                                                          |
| `--sudoku-conflict-color`  | `#cc3c00` | text color of conflicting numbers                                                                         |
| `--sudoku-win-color`       | `#af8b08` | "Hotovo" heading and time in the win card                                                                 |
| `--sudoku-bg`              | `#ffffff` | background of the whole widget (topbar, grid frame, keypad area)                                          |
| `--sudoku-overlay-bg`      | `#ffffff` | background of the win card — independent of `--sudoku-bg`, so it stays solid even if the widget background is transparent |
| `--sudoku-cell-bg`         | `#ffffff` | default cell background                                                                                   |
| `--sudoku-hover-bg`        | `#eef9ff` | cell background on hover                                                                                   |
| `--sudoku-selected-bg`     | `#d9ebf8` | selected cell background                                                                                   |
| `--sudoku-conflict-bg`     | `#fbe4d9` | background of conflicting cells                                                                            |
| `--sudoku-grid-line`       | `#cbd5e1` | thin lines between cells                                                                                   |
| `--sudoku-grid-block-line` | `#1e293b` | thick lines between 3×3 blocks, and the grid's outer border                                                |
| `--sudoku-btn-bg`          | `#f1f5f9` | Reset / New game / keypad button background                                                                |
| `--sudoku-btn-text`        | `#1c1e1f` | button text color                                                                                          |

### Font

| Property       | Default                                                                                  | Role       |
| --------------- | ------------------------------------------------------------------------------------------ | ---------- |
| `--sudoku-font` | `"Open Sans", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | font stack |

The default stack prefers **Open Sans** and falls back to the system font if
it isn't available. The widget makes **no external requests**; load Open Sans
on the host page (the demo does so via Google Fonts) or self-host it to
guarantee it renders — otherwise the fallback is used.

### Blending into a page

To make the widget's chrome (timer, buttons, keypad) sit on a colored page
background instead of white, set `--sudoku-bg: transparent`. The grid cells
stay white (from `--sudoku-cell-bg`, styled independently) and the win card
stays solid white (from `--sudoku-overlay-bg`), so both remain legible
regardless of what's behind the widget:

```css
.article-callout sudoku-game {
  --sudoku-bg: transparent;
  --sudoku-btn-bg: #ffffff;
}
```

### Layout

The widget adapts to its parent's width using container queries (no viewport
media queries), and keypad buttons keep a 44×44 px minimum touch target.

## Development

```bash
npm install
npm run dev      # Vite dev server with the demo (index.html)
npm test         # Vitest unit tests (generator/solver + component smoke tests)
npm run build    # Type-check + bundle to dist/ (es + iife) + .d.ts
```

`index.html` is a demo page (currently a mock newspaper article) used to try
the widget in a realistic embed while developing.

## GitHub Pages demo

The demo is served as a prebuilt static site from `docs/`:

```bash
npm run build:pages   # bundles index.html into docs/ (base './', + .nojekyll)
```

Commit `docs/` and, in **Settings → Pages → Build and deployment**, choose
**Source: Deploy from a branch**, branch **main**, folder **/docs**. The site
then lives at `https://<user>.github.io/<repo>/`. Rebuild and commit `docs/`
whenever the demo changes.

## Project structure

```
src/
  index.ts        # customElements.define('sudoku-game', SudokuGame)
  SudokuGame.ts   # custom element: render, interaction, persistence, timer
  generator.ts    # generator + solver (pure functions, no DOM)
  styles.ts       # CSS string injected into the shadow root
vite.config.ts    # library mode, formats es + iife, name SudokuGame
```

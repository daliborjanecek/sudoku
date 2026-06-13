// Pure Sudoku generator + solver. No DOM access — fully testable.

export const SIZE = 9;
export const CELLS = 81;
export const EMPTY = '.';

export interface Puzzle {
  /** 81-char string, '.' for an empty cell. */
  puzzle: string;
  /** 81-char string, fully solved grid. */
  solution: string;
}

/** Difficulty -> [minEmpty, maxEmpty] target range of empty cells. */
const DIFFICULTY_RANGES: Record<number, [number, number]> = {
  1: [30, 35],
  2: [36, 41],
  3: [42, 46],
  4: [47, 51],
  5: [52, 56],
};

export function clampDifficulty(value: number): number {
  if (!Number.isFinite(value)) return 3;
  const n = Math.trunc(value);
  if (n < 1) return 1;
  if (n > 5) return 5;
  return n;
}

export function emptyCellRange(difficulty: number): [number, number] {
  return DIFFICULTY_RANGES[clampDifficulty(difficulty)];
}

/** Fisher–Yates shuffle in place. */
function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Can `value` be placed at index `pos` in the numeric grid without conflict? */
function canPlace(grid: Int8Array, pos: number, value: number): boolean {
  const row = Math.floor(pos / SIZE);
  const col = pos % SIZE;
  const boxRow = row - (row % 3);
  const boxCol = col - (col % 3);

  for (let i = 0; i < SIZE; i++) {
    if (grid[row * SIZE + i] === value) return false;
    if (grid[i * SIZE + col] === value) return false;
  }
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (grid[(boxRow + r) * SIZE + (boxCol + c)] === value) return false;
    }
  }
  return true;
}

/** Fill an empty grid with a complete valid solution via randomized backtracking. */
function fillGrid(grid: Int8Array): boolean {
  let pos = -1;
  for (let i = 0; i < CELLS; i++) {
    if (grid[i] === 0) {
      pos = i;
      break;
    }
  }
  if (pos === -1) return true; // grid full

  const candidates = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const value of candidates) {
    if (canPlace(grid, pos, value)) {
      grid[pos] = value;
      if (fillGrid(grid)) return true;
      grid[pos] = 0;
    }
  }
  return false;
}

const ALL_DIGITS = 0b1111111110; // bits 1..9 set

function popcount(n: number): number {
  let c = 0;
  while (n) {
    n &= n - 1;
    c++;
  }
  return c;
}

const boxOf = (row: number, col: number): number =>
  Math.floor(row / 3) * 3 + Math.floor(col / 3);

/** Used-digit bitmasks for an in-progress grid. */
function buildMasks(grid: Int8Array): {
  rows: Int16Array;
  cols: Int16Array;
  boxes: Int16Array;
} {
  const rows = new Int16Array(SIZE);
  const cols = new Int16Array(SIZE);
  const boxes = new Int16Array(SIZE);
  for (let i = 0; i < CELLS; i++) {
    const v = grid[i];
    if (v !== 0) {
      const r = Math.floor(i / SIZE);
      const c = i % SIZE;
      const bit = 1 << v;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[boxOf(r, c)] |= bit;
    }
  }
  return { rows, cols, boxes };
}

/**
 * MRV (minimum-remaining-values) backtracking core. Counts solutions, stopping
 * early once `limit` is reached. The same routine powers both uniqueness checks
 * (limit = 2) and single-solution solving (limit = 1).
 */
function countSolutions(grid: Int8Array, limit: number): number {
  const { rows, cols, boxes } = buildMasks(grid);
  let count = 0;

  const recurse = (): void => {
    // Pick the empty cell with the fewest candidates.
    let best = -1;
    let bestCount = 10;
    let bestMask = 0;
    for (let i = 0; i < CELLS; i++) {
      if (grid[i] !== 0) continue;
      const r = Math.floor(i / SIZE);
      const c = i % SIZE;
      const avail = ALL_DIGITS & ~(rows[r] | cols[c] | boxes[boxOf(r, c)]);
      if (avail === 0) return; // dead end
      const cnt = popcount(avail);
      if (cnt < bestCount) {
        bestCount = cnt;
        best = i;
        bestMask = avail;
        if (cnt === 1) break;
      }
    }

    if (best === -1) {
      count++; // no empty cell left -> a complete solution
      return;
    }

    const r = Math.floor(best / SIZE);
    const c = best % SIZE;
    const b = boxOf(r, c);
    let m = bestMask;
    while (m !== 0) {
      const bit = m & -m;
      m ^= bit;
      const v = 31 - Math.clz32(bit);
      grid[best] = v;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[b] |= bit;
      recurse();
      grid[best] = 0;
      rows[r] ^= bit;
      cols[c] ^= bit;
      boxes[b] ^= bit;
      if (count >= limit) return;
    }
  };

  recurse();
  return count;
}

function gridToString(grid: Int8Array): string {
  let s = '';
  for (let i = 0; i < CELLS; i++) {
    s += grid[i] === 0 ? EMPTY : String(grid[i]);
  }
  return s;
}

function stringToGrid(s: string): Int8Array {
  const grid = new Int8Array(CELLS);
  for (let i = 0; i < CELLS; i++) {
    const ch = s[i];
    grid[i] = ch === EMPTY || ch === undefined ? 0 : Number(ch);
  }
  return grid;
}

/** True if the pre-filled clues already contain a duplicate in any unit. */
function hasInitialConflict(grid: Int8Array): boolean {
  const rows = new Int16Array(SIZE);
  const cols = new Int16Array(SIZE);
  const boxes = new Int16Array(SIZE);
  for (let i = 0; i < CELLS; i++) {
    const v = grid[i];
    if (v === 0) continue;
    const r = Math.floor(i / SIZE);
    const c = i % SIZE;
    const b = boxOf(r, c);
    const bit = 1 << v;
    if ((rows[r] & bit) || (cols[c] & bit) || (boxes[b] & bit)) return true;
    rows[r] |= bit;
    cols[c] |= bit;
    boxes[b] |= bit;
  }
  return false;
}

/** Solve a puzzle string; returns the solution string or null if unsolvable. */
export function solve(puzzle: string): string | null {
  const grid = stringToGrid(puzzle);
  if (hasInitialConflict(grid)) return null;
  if (fillFromConstraints(grid)) {
    return gridToString(grid);
  }
  return null;
}

/** MRV backtracking solver that respects pre-filled cells. */
function fillFromConstraints(grid: Int8Array): boolean {
  const { rows, cols, boxes } = buildMasks(grid);

  const recurse = (): boolean => {
    let best = -1;
    let bestCount = 10;
    let bestMask = 0;
    for (let i = 0; i < CELLS; i++) {
      if (grid[i] !== 0) continue;
      const r = Math.floor(i / SIZE);
      const c = i % SIZE;
      const avail = ALL_DIGITS & ~(rows[r] | cols[c] | boxes[boxOf(r, c)]);
      if (avail === 0) return false;
      const cnt = popcount(avail);
      if (cnt < bestCount) {
        bestCount = cnt;
        best = i;
        bestMask = avail;
        if (cnt === 1) break;
      }
    }

    if (best === -1) return true;

    const r = Math.floor(best / SIZE);
    const c = best % SIZE;
    const b = boxOf(r, c);
    let m = bestMask;
    while (m !== 0) {
      const bit = m & -m;
      m ^= bit;
      const v = 31 - Math.clz32(bit);
      grid[best] = v;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[b] |= bit;
      if (recurse()) return true;
      grid[best] = 0;
      rows[r] ^= bit;
      cols[c] ^= bit;
      boxes[b] ^= bit;
    }
    return false;
  };

  return recurse();
}

/** True if the puzzle has exactly one solution. */
export function hasUniqueSolution(puzzle: string): boolean {
  const grid = stringToGrid(puzzle);
  if (hasInitialConflict(grid)) return false;
  return countSolutions(grid, 2) === 1;
}

/**
 * Generate a puzzle of the given difficulty. Removes cells in random order,
 * keeping a unique solution. Stops early if the target can't be reached.
 */
export function generate(difficulty: number): Puzzle {
  const full = new Int8Array(CELLS);
  fillGrid(full);
  const solution = gridToString(full);

  const [minEmpty, maxEmpty] = emptyCellRange(difficulty);
  const targetEmpty = minEmpty + Math.floor(Math.random() * (maxEmpty - minEmpty + 1));

  const working = full.slice();
  const order = shuffle(Array.from({ length: CELLS }, (_, i) => i));
  let removed = 0;

  for (const pos of order) {
    if (removed >= targetEmpty) break;
    const backup = working[pos];
    if (backup === 0) continue;

    working[pos] = 0;
    // If removing this cell breaks uniqueness, restore it.
    if (countSolutions(working.slice(), 2) === 1) {
      removed++;
    } else {
      working[pos] = backup;
    }
  }

  return { puzzle: gridToString(working), solution };
}

/** Validate that a string is a complete, valid 9x9 solution. */
export function isValidSolution(s: string): boolean {
  if (s.length !== CELLS) return false;
  const grid = stringToGrid(s);
  for (let i = 0; i < CELLS; i++) {
    const value = grid[i];
    if (value < 1 || value > 9) return false;
    grid[i] = 0;
    if (!canPlace(grid, i, value)) {
      grid[i] = value;
      return false;
    }
    grid[i] = value;
  }
  return true;
}

/** Count empty ('.') cells in a puzzle string. */
export function countEmpty(puzzle: string): number {
  let n = 0;
  for (let i = 0; i < puzzle.length; i++) {
    if (puzzle[i] === EMPTY) n++;
  }
  return n;
}

import { describe, it, expect } from 'vitest';
import {
  generate,
  solve,
  hasUniqueSolution,
  isValidSolution,
  countEmpty,
  emptyCellRange,
  clampDifficulty,
  CELLS,
} from './generator.js';

describe('clampDifficulty', () => {
  it('clamps out-of-range and invalid values', () => {
    expect(clampDifficulty(0)).toBe(1);
    expect(clampDifficulty(6)).toBe(5);
    expect(clampDifficulty(NaN)).toBe(3);
    expect(clampDifficulty(3.9)).toBe(3);
    expect(clampDifficulty(2)).toBe(2);
  });
});

describe('generate', () => {
  for (let difficulty = 1; difficulty <= 5; difficulty++) {
    it(`difficulty ${difficulty}: produces a valid, uniquely solvable puzzle`, () => {
      const { puzzle, solution } = generate(difficulty);

      expect(puzzle).toHaveLength(CELLS);
      expect(solution).toHaveLength(CELLS);

      // The solution is a fully valid grid.
      expect(isValidSolution(solution)).toBe(true);

      // The puzzle has exactly one solution...
      expect(hasUniqueSolution(puzzle)).toBe(true);

      // ...and that solution matches the reported solution.
      expect(solve(puzzle)).toBe(solution);

      // Every given cell agrees with the solution.
      for (let i = 0; i < CELLS; i++) {
        if (puzzle[i] !== '.') {
          expect(puzzle[i]).toBe(solution[i]);
        }
      }
    });
  }

  it('respects the empty-cell target range per difficulty', () => {
    for (let difficulty = 1; difficulty <= 5; difficulty++) {
      const [min, max] = emptyCellRange(difficulty);
      // Generation may stop early, so empties must not exceed the max,
      // and should generally reach the band — assert <= max strictly and
      // allow a small shortfall below min.
      for (let trial = 0; trial < 3; trial++) {
        const { puzzle } = generate(difficulty);
        const empties = countEmpty(puzzle);
        expect(empties).toBeLessThanOrEqual(max);
        expect(empties).toBeGreaterThan(0);
        // In practice the generator reaches the target band reliably.
        expect(empties).toBeGreaterThanOrEqual(min - 5);
      }
    }
  });
});

describe('solve', () => {
  it('solves a known puzzle', () => {
    const puzzle =
      '53..7....6..195....98....6.8...6...34..8.3..17...2...6.6....28....419..5....8..79';
    const solution = solve(puzzle);
    expect(solution).not.toBeNull();
    expect(isValidSolution(solution as string)).toBe(true);
  });

  it('returns null for an unsolvable puzzle', () => {
    // Two 5s in the first row makes it unsolvable.
    const bad = '55' + '.'.repeat(CELLS - 2);
    expect(solve(bad)).toBeNull();
  });
});

describe('hasUniqueSolution', () => {
  it('detects multiple solutions', () => {
    // Empty grid has many solutions.
    expect(hasUniqueSolution('.'.repeat(CELLS))).toBe(false);
  });
});

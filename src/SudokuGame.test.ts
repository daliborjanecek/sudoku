// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { SudokuGame } from './SudokuGame.js';

if (!customElements.get('sudoku-game')) {
  customElements.define('sudoku-game', SudokuGame);
}

function mount(attrs: Record<string, string> = {}): {
  el: SudokuGame;
  cells: () => HTMLDivElement[];
} {
  const el = document.createElement('sudoku-game') as SudokuGame;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  const cells = () =>
    Array.from(el.shadowRoot!.querySelectorAll<HTMLDivElement>('.cell'));
  return { el, cells };
}

describe('SudokuGame component', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    try {
      localStorage.clear();
    } catch {
      /* ignore */
    }
  });

  it('renders 81 cells and a keypad into the shadow root', () => {
    const { el, cells } = mount({ difficulty: '1', 'storage-key': 'test-a' });
    expect(el.shadowRoot).toBeTruthy();
    expect(cells()).toHaveLength(81);
    const keys = el.shadowRoot!.querySelectorAll('.keypad button');
    expect(keys).toHaveLength(10); // 1-9 plus erase
  });

  it('marks given cells and forbids selecting them', () => {
    const { el, cells } = mount({ difficulty: '1', 'storage-key': 'test-b' });
    const all = cells();
    const given = all.find((c) => c.classList.contains('given'))!;
    const empty = all.find((c) => c.classList.contains('selectable'))!;

    given.click();
    expect(given.classList.contains('selected')).toBe(false);

    empty.click();
    expect(empty.classList.contains('selected')).toBe(true);
    void el;
  });

  it('writes a user value via the keypad and can erase it', () => {
    const { el, cells } = mount({ difficulty: '1', 'storage-key': 'test-c' });
    const empty = cells().find((c) => c.classList.contains('selectable'))!;
    empty.click();

    const one = el.shadowRoot!.querySelector<HTMLButtonElement>(
      '.keypad button',
    )!; // first key is "1"
    one.click();
    expect(empty.textContent).toBe('1');

    const erase =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.key-erase')!;
    erase.click();
    expect(empty.textContent).toBe('');
  });

  it('keeps two instances independent', () => {
    const a = mount({ difficulty: '1', 'storage-key': 'indep-a' });
    const b = mount({ difficulty: '1', 'storage-key': 'indep-b' });
    const ea = a.cells().find((c) => c.classList.contains('selectable'))!;
    ea.click();
    a.el.shadowRoot!.querySelector<HTMLButtonElement>('.keypad button')!.click();

    // The other instance has no selection or new entry from this interaction.
    const selectedInB = b
      .cells()
      .some((c) => c.classList.contains('selected'));
    expect(selectedInB).toBe(false);
  });
});

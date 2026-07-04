import { styles } from './styles.js';
import {
  generate,
  clampDifficulty,
  CELLS,
  SIZE,
  EMPTY,
} from './generator.js';

const STORAGE_VERSION = 1;
const DEFAULT_STORAGE_KEY = 'sudoku-game';

interface SaveData {
  version: number;
  puzzle: string;
  solution: string;
  entries: string;
  difficulty: number;
  elapsed: number;
  savedAt: number;
}

type PendingConfirm = 'reset' | 'new' | null;

export class SudokuGame extends HTMLElement {
  // --- game state (kept per-instance, never in module scope) ---
  private puzzle = '';
  private solution = '';
  private entries = '';
  private elapsed = 0;
  private selected: number | null = null;
  private completed = false;
  private pending: PendingConfirm = null;

  // --- runtime ---
  private root: ShadowRoot;
  private cells: HTMLDivElement[] = [];
  private timerEl!: HTMLDivElement;
  private actionsEl!: HTMLDivElement;
  private gridEl!: HTMLDivElement;
  private wrapEl!: HTMLDivElement;
  private overlayEl: HTMLDivElement | null = null;
  private intervalId: number | null = null;
  private sinceSave = 0;
  private built = false;

  // bound handlers for clean removal
  private readonly onVisibility = () => this.handleVisibility();
  private readonly onKeyDown = (e: KeyboardEvent) => this.handleKeyDown(e);

  constructor() {
    super();
    this.root = this.attachShadow({ mode: 'open' });
  }

  // ---------------------------------------------------------------- lifecycle
  connectedCallback(): void {
    // Build and seed the game only on first connect. If the element is moved
    // around the DOM, connectedCallback can fire again — keep existing state.
    if (!this.built) {
      this.buildSkeleton();
      this.built = true;
      if (!this.restore()) {
        this.newGame(false);
      }
      this.renderAll();
    }
    if (!this.completed) this.startTimer();
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  disconnectedCallback(): void {
    this.stopTimer();
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.save();
  }

  // ----------------------------------------------------------------- getters
  private get difficulty(): number {
    const raw = this.getAttribute('difficulty');
    const n = raw === null ? NaN : Number(raw);
    return clampDifficulty(Number.isFinite(n) ? n : 3);
  }

  private get storageKey(): string {
    return this.getAttribute('storage-key') || DEFAULT_STORAGE_KEY;
  }

  // ------------------------------------------------------------------ skeleton
  private buildSkeleton(): void {
    const style = document.createElement('style');
    style.textContent = styles;
    this.root.appendChild(style);

    const wrap = document.createElement('div');
    wrap.className = 'wrap';
    wrap.tabIndex = 0;
    wrap.addEventListener('keydown', this.onKeyDown);
    this.wrapEl = wrap;

    // top bar
    const topbar = document.createElement('div');
    topbar.className = 'topbar';
    this.timerEl = document.createElement('div');
    this.timerEl.className = 'timer';
    this.timerEl.textContent = '00:00';
    const spacer = document.createElement('div');
    spacer.className = 'spacer';
    this.actionsEl = document.createElement('div');
    this.actionsEl.className = 'actions';
    this.actionsEl.style.display = 'flex';
    this.actionsEl.style.gap = '8px';
    topbar.append(this.timerEl, spacer, this.actionsEl);

    // grid
    this.gridEl = document.createElement('div');
    this.gridEl.className = 'grid';
    this.cells = [];
    for (let i = 0; i < CELLS; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      const row = Math.floor(i / SIZE);
      if (row % 3 === 2 && row !== SIZE - 1) cell.classList.add('row-block');
      if (row === SIZE - 1) cell.classList.add('last-row');
      cell.dataset.index = String(i);
      this.gridEl.appendChild(cell);
      this.cells.push(cell);
    }
    this.gridEl.addEventListener('click', (e) => {
      const target = (e.target as HTMLElement).closest('.cell') as HTMLElement | null;
      if (!target || target.dataset.index === undefined) return;
      this.selectCell(Number(target.dataset.index));
    });

    // keypad
    const keypad = document.createElement('div');
    keypad.className = 'keypad';
    for (let n = 1; n <= 9; n++) {
      const btn = document.createElement('button');
      btn.textContent = String(n);
      btn.type = 'button';
      btn.addEventListener('click', () => this.inputValue(n));
      keypad.appendChild(btn);
    }
    const erase = document.createElement('button');
    erase.type = 'button';
    erase.className = 'key-erase';
    erase.setAttribute('aria-label', 'Smazat');
    erase.textContent = '⌫';
    erase.addEventListener('click', () => this.eraseValue());
    keypad.appendChild(erase);

    wrap.append(topbar, this.gridEl, keypad);
    this.root.appendChild(wrap);
    this.renderActions();
  }

  // ------------------------------------------------------------------ rendering
  private renderActions(): void {
    this.actionsEl.replaceChildren();
    if (this.pending === null) {
      const reset = this.button('Reset', () => this.requestConfirm('reset'));
      const fresh = this.button('Nová sudoku', () => this.requestConfirm('new'));
      this.actionsEl.append(reset, fresh);
    } else {
      const label = this.pending === 'reset' ? 'Resetovat?' : 'Nová hra?';
      const text = document.createElement('span');
      text.textContent = label;
      text.style.alignSelf = 'center';
      text.style.fontSize = '14px';
      const yes = this.button('Ano', () => this.confirmYes());
      yes.className = 'btn-confirm';
      const no = this.button('Ne', () => this.confirmNo());
      this.actionsEl.append(text, yes, no);
    }
  }

  private button(text: string, onClick: () => void): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = text;
    b.addEventListener('click', onClick);
    return b;
  }

  private renderAll(): void {
    this.renderActions();
    this.renderGrid();
    this.renderTimer();
    this.renderOverlay();
  }

  private renderGrid(): void {
    const board = this.board();
    const conflicts = this.computeConflicts(board);

    for (let i = 0; i < CELLS; i++) {
      const cell = this.cells[i];
      const given = this.puzzle[i] !== EMPTY;
      const value = board[i];

      cell.textContent = value === EMPTY ? '' : value;
      cell.classList.toggle('given', given);
      cell.classList.toggle('selectable', !given);
      cell.classList.toggle('selected', this.selected === i);
      cell.classList.toggle('conflict', conflicts[i]);
    }
  }

  private renderTimer(): void {
    this.timerEl.textContent = formatTime(this.elapsed);
  }

  private renderOverlay(): void {
    this.wrapEl.classList.toggle('completed', this.completed);
    if (this.completed) {
      this.showCompletionOverlay();
    } else if (this.overlayEl) {
      this.overlayEl.remove();
      this.overlayEl = null;
    }
  }

  private showCompletionOverlay(): void {
    if (this.overlayEl) return;
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    const card = document.createElement('div');
    card.className = 'overlay-card';
    const h2 = document.createElement('h2');
    h2.textContent = 'Hotovo';
    const p = document.createElement('p');
    p.append('Vyřešeno za ');
    const time = document.createElement('span');
    time.className = 'big-time';
    time.textContent = formatTime(this.elapsed);
    p.append(time);
    const actions = document.createElement('div');
    actions.className = 'overlay-actions';
    const again = this.button('Nová hra', () => this.newGame(true));
    again.className = 'btn-primary';
    actions.appendChild(again);
    card.append(h2, p, actions);
    overlay.appendChild(card);
    this.wrapEl.appendChild(overlay);
    this.overlayEl = overlay;
  }

  // ------------------------------------------------------------------ board helpers
  /** Merged current board: given cells overlaid with user entries. */
  private board(): string {
    let s = '';
    for (let i = 0; i < CELLS; i++) {
      s += this.puzzle[i] !== EMPTY ? this.puzzle[i] : this.entries[i];
    }
    return s;
  }

  /**
   * Conflict map: a cell is flagged if it sits in a row, column, or 3x3 box
   * that contains a repeated digit. Whole conflicting regions are highlighted.
   */
  private computeConflicts(board: string): boolean[] {
    const flags = new Array<boolean>(CELLS).fill(false);

    const markGroup = (indices: number[]) => {
      const seen = new Map<string, number[]>();
      for (const idx of indices) {
        const v = board[idx];
        if (v === EMPTY) continue;
        const list = seen.get(v);
        if (list) list.push(idx);
        else seen.set(v, [idx]);
      }
      let hasDup = false;
      for (const list of seen.values()) {
        if (list.length > 1) hasDup = true;
      }
      if (hasDup) {
        for (const idx of indices) flags[idx] = true;
      }
    };

    for (let r = 0; r < SIZE; r++) {
      const row: number[] = [];
      for (let c = 0; c < SIZE; c++) row.push(r * SIZE + c);
      markGroup(row);
    }
    for (let c = 0; c < SIZE; c++) {
      const col: number[] = [];
      for (let r = 0; r < SIZE; r++) col.push(r * SIZE + c);
      markGroup(col);
    }
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        const box: number[] = [];
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            box.push((br * 3 + r) * SIZE + (bc * 3 + c));
          }
        }
        markGroup(box);
      }
    }
    return flags;
  }

  // ------------------------------------------------------------------ interaction
  private selectCell(index: number): void {
    if (this.completed) return;
    if (this.puzzle[index] !== EMPTY) return; // given cells aren't selectable
    this.selected = index;
    this.wrapEl.focus();
    this.renderGrid();
  }

  private inputValue(n: number): void {
    if (this.completed || this.selected === null) return;
    const i = this.selected;
    if (this.puzzle[i] !== EMPTY) return;
    this.entries = replaceAt(this.entries, i, String(n));
    this.afterMove();
  }

  private eraseValue(): void {
    if (this.completed || this.selected === null) return;
    const i = this.selected;
    if (this.puzzle[i] !== EMPTY) return;
    if (this.entries[i] === EMPTY) return;
    this.entries = replaceAt(this.entries, i, EMPTY);
    this.afterMove();
  }

  private afterMove(): void {
    this.renderGrid();
    if (this.checkComplete()) {
      this.completed = true;
      this.stopTimer();
      this.clearSaved();
      this.renderOverlay();
      return;
    }
    this.save();
  }

  private checkComplete(): boolean {
    return this.board() === this.solution;
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (this.completed) return;
    const key = e.key;
    if (key >= '1' && key <= '9') {
      this.inputValue(Number(key));
      e.preventDefault();
      return;
    }
    if (key === 'Backspace' || key === 'Delete' || key === '0') {
      this.eraseValue();
      e.preventDefault();
      return;
    }
    if (key.startsWith('Arrow')) {
      this.moveSelection(key);
      e.preventDefault();
    }
  }

  private moveSelection(arrow: string): void {
    if (this.selected === null) {
      this.selectFirstSelectable();
      return;
    }
    const dr = arrow === 'ArrowUp' ? -1 : arrow === 'ArrowDown' ? 1 : 0;
    const dc = arrow === 'ArrowLeft' ? -1 : arrow === 'ArrowRight' ? 1 : 0;
    let row = Math.floor(this.selected / SIZE);
    let col = this.selected % SIZE;

    // step in the chosen direction until a selectable cell or the edge
    for (let step = 0; step < SIZE; step++) {
      row += dr;
      col += dc;
      if (row < 0 || row >= SIZE || col < 0 || col >= SIZE) return;
      const idx = row * SIZE + col;
      if (this.puzzle[idx] === EMPTY) {
        this.selected = idx;
        this.renderGrid();
        return;
      }
    }
  }

  private selectFirstSelectable(): void {
    for (let i = 0; i < CELLS; i++) {
      if (this.puzzle[i] === EMPTY) {
        this.selected = i;
        this.renderGrid();
        return;
      }
    }
  }

  // ------------------------------------------------------------------ confirm flow
  private requestConfirm(kind: Exclude<PendingConfirm, null>): void {
    this.pending = kind;
    this.renderActions();
  }

  private confirmNo(): void {
    this.pending = null;
    this.renderActions();
  }

  private confirmYes(): void {
    const kind = this.pending;
    this.pending = null;
    if (kind === 'reset') this.reset();
    else if (kind === 'new') this.newGame(true);
    this.renderActions();
  }

  private reset(): void {
    this.entries = EMPTY.repeat(CELLS);
    this.elapsed = 0;
    this.selected = null;
    this.completed = false;
    this.renderAll();
    this.startTimer();
    this.save();
  }

  private newGame(restartTimer: boolean): void {
    const { puzzle, solution } = generate(this.difficulty);
    this.puzzle = puzzle;
    this.solution = solution;
    this.entries = EMPTY.repeat(CELLS);
    this.elapsed = 0;
    this.selected = null;
    this.completed = false;
    if (this.overlayEl) {
      this.overlayEl.remove();
      this.overlayEl = null;
    }
    this.renderAll();
    if (restartTimer) this.startTimer();
    this.save();
  }

  // ------------------------------------------------------------------ timer
  private startTimer(): void {
    this.stopTimer();
    this.intervalId = window.setInterval(() => this.tick(), 1000);
  }

  private stopTimer(): void {
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private tick(): void {
    if (this.completed || document.hidden) return;
    this.elapsed++;
    this.renderTimer();
    if (++this.sinceSave >= 5) {
      this.sinceSave = 0;
      this.save();
    }
  }

  private handleVisibility(): void {
    if (document.hidden) this.save();
  }

  // ------------------------------------------------------------------ persistence
  private save(): void {
    if (this.completed) return;
    const data: SaveData = {
      version: STORAGE_VERSION,
      puzzle: this.puzzle,
      solution: this.solution,
      entries: this.entries,
      difficulty: this.difficulty,
      elapsed: this.elapsed,
      savedAt: Date.now(),
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch {
      // localStorage unavailable (private mode / disabled) — run without persistence.
    }
  }

  private clearSaved(): void {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
      /* ignore */
    }
  }

  /** Returns true if a valid in-progress game was restored. */
  private restore(): boolean {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(this.storageKey);
    } catch {
      return false;
    }
    if (!raw) return false;

    let data: unknown;
    try {
      data = JSON.parse(raw);
    } catch {
      return false;
    }

    if (!isValidSave(data)) {
      this.clearSaved();
      return false;
    }

    // Difficulty mismatch is fine — restore the in-progress game anyway.
    this.puzzle = data.puzzle;
    this.solution = data.solution;
    this.entries = data.entries;
    this.elapsed = data.elapsed;
    this.selected = null;
    this.completed = false;
    return true;
  }
}

// ---------------------------------------------------------------- utilities
function replaceAt(s: string, index: number, ch: string): string {
  return s.slice(0, index) + ch + s.slice(index + 1);
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function isValidSave(data: unknown): data is SaveData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;
  return (
    d.version === STORAGE_VERSION &&
    typeof d.puzzle === 'string' &&
    d.puzzle.length === CELLS &&
    typeof d.solution === 'string' &&
    d.solution.length === CELLS &&
    typeof d.entries === 'string' &&
    d.entries.length === CELLS &&
    typeof d.difficulty === 'number' &&
    typeof d.elapsed === 'number' &&
    typeof d.savedAt === 'number'
  );
}

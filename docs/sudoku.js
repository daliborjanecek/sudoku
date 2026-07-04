var _ = Object.defineProperty;
var A = (i, n, e) => n in i ? _(i, n, { enumerable: !0, configurable: !0, writable: !0, value: e }) : i[n] = e;
var d = (i, n, e) => A(i, typeof n != "symbol" ? n + "" : n, e);
const N = `
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
  --_given: var(--sudoku-given-color, #1c1e1f);
  --_cell-bg: var(--sudoku-cell-bg, #ffffff);
  --_hover-bg: var(--sudoku-hover-bg, #eef9ff);
  --_selected-bg: var(--sudoku-selected-bg, #d9ebf8);
  --_conflict-bg: var(--sudoku-conflict-bg, #fbe4d9);
  --_btn-bg: var(--sudoku-btn-bg, #f1f5f9);
  --_btn-text: var(--sudoku-btn-text, #1c1e1f);

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

.cell.selectable:not(.selected):hover {
  background: var(--_hover-bg);
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
const f = ".", Z = {
  1: [30, 35],
  2: [36, 41],
  3: [42, 46],
  4: [47, 51],
  5: [52, 56]
};
function C(i) {
  if (!Number.isFinite(i)) return 3;
  const n = Math.trunc(i);
  return n < 1 ? 1 : n > 5 ? 5 : n;
}
function M(i) {
  return Z[C(i)];
}
function I(i) {
  for (let n = i.length - 1; n > 0; n--) {
    const e = Math.floor(Math.random() * (n + 1));
    [i[n], i[e]] = [i[e], i[n]];
  }
  return i;
}
function T(i, n, e) {
  const t = Math.floor(n / 9), r = n % 9, o = t - t % 3, l = r - r % 3;
  for (let s = 0; s < 9; s++)
    if (i[t * 9 + s] === e || i[s * 9 + r] === e) return !1;
  for (let s = 0; s < 3; s++)
    for (let a = 0; a < 3; a++)
      if (i[(o + s) * 9 + (l + a)] === e) return !1;
  return !0;
}
function L(i) {
  let n = -1;
  for (let t = 0; t < 81; t++)
    if (i[t] === 0) {
      n = t;
      break;
    }
  if (n === -1) return !0;
  const e = I([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  for (const t of e)
    if (T(i, n, t)) {
      if (i[n] = t, L(i)) return !0;
      i[n] = 0;
    }
  return !1;
}
const G = 1022;
function D(i) {
  let n = 0;
  for (; i; )
    i &= i - 1, n++;
  return n;
}
const y = (i, n) => Math.floor(i / 3) * 3 + Math.floor(n / 3);
function V(i) {
  const n = new Int16Array(9), e = new Int16Array(9), t = new Int16Array(9);
  for (let r = 0; r < 81; r++) {
    const o = i[r];
    if (o !== 0) {
      const l = Math.floor(r / 9), s = r % 9, a = 1 << o;
      n[l] |= a, e[s] |= a, t[y(l, s)] |= a;
    }
  }
  return { rows: n, cols: e, boxes: t };
}
function O(i, n) {
  const { rows: e, cols: t, boxes: r } = V(i);
  let o = 0;
  const l = () => {
    let s = -1, a = 10, c = 0;
    for (let h = 0; h < 81; h++) {
      if (i[h] !== 0) continue;
      const m = Math.floor(h / 9), x = h % 9, v = G & ~(e[m] | t[x] | r[y(m, x)]);
      if (v === 0) return;
      const g = D(v);
      if (g < a && (a = g, s = h, c = v, g === 1))
        break;
    }
    if (s === -1) {
      o++;
      return;
    }
    const u = Math.floor(s / 9), b = s % 9, E = y(u, b);
    let p = c;
    for (; p !== 0; ) {
      const h = p & -p;
      p ^= h;
      const m = 31 - Math.clz32(h);
      if (i[s] = m, e[u] |= h, t[b] |= h, r[E] |= h, l(), i[s] = 0, e[u] ^= h, t[b] ^= h, r[E] ^= h, o >= n) return;
    }
  };
  return l(), o;
}
function S(i) {
  let n = "";
  for (let e = 0; e < 81; e++)
    n += i[e] === 0 ? f : String(i[e]);
  return n;
}
function q(i) {
  const n = new Int8Array(81);
  L(n);
  const e = S(n), [t, r] = M(i), o = t + Math.floor(Math.random() * (r - t + 1)), l = n.slice(), s = I(Array.from({ length: 81 }, (c, u) => u));
  let a = 0;
  for (const c of s) {
    if (a >= o) break;
    const u = l[c];
    u !== 0 && (l[c] = 0, O(l.slice(), 2) === 1 ? a++ : l[c] = u);
  }
  return { puzzle: S(l), solution: e };
}
const z = 1, K = "sudoku-game";
class R extends HTMLElement {
  constructor() {
    super();
    // --- game state (kept per-instance, never in module scope) ---
    d(this, "puzzle", "");
    d(this, "solution", "");
    d(this, "entries", "");
    d(this, "elapsed", 0);
    d(this, "selected", null);
    d(this, "completed", !1);
    d(this, "pending", null);
    // --- runtime ---
    d(this, "root");
    d(this, "cells", []);
    d(this, "timerEl");
    d(this, "actionsEl");
    d(this, "gridEl");
    d(this, "overlayEl", null);
    d(this, "intervalId", null);
    d(this, "sinceSave", 0);
    d(this, "built", !1);
    // bound handlers for clean removal
    d(this, "onVisibility", () => this.handleVisibility());
    d(this, "onKeyDown", (e) => this.handleKeyDown(e));
    this.root = this.attachShadow({ mode: "open" });
  }
  // ---------------------------------------------------------------- lifecycle
  connectedCallback() {
    this.built || (this.buildSkeleton(), this.built = !0, this.restore() || this.newGame(!1), this.renderAll()), this.completed || this.startTimer(), document.addEventListener("visibilitychange", this.onVisibility);
  }
  disconnectedCallback() {
    this.stopTimer(), document.removeEventListener("visibilitychange", this.onVisibility), this.save();
  }
  // ----------------------------------------------------------------- getters
  get difficulty() {
    const e = this.getAttribute("difficulty"), t = e === null ? NaN : Number(e);
    return C(Number.isFinite(t) ? t : 3);
  }
  get storageKey() {
    return this.getAttribute("storage-key") || K;
  }
  // ------------------------------------------------------------------ skeleton
  buildSkeleton() {
    const e = document.createElement("style");
    e.textContent = N, this.root.appendChild(e);
    const t = document.createElement("div");
    t.className = "wrap", t.tabIndex = 0, t.addEventListener("keydown", this.onKeyDown);
    const r = document.createElement("div");
    r.className = "topbar", this.timerEl = document.createElement("div"), this.timerEl.className = "timer", this.timerEl.textContent = "00:00";
    const o = document.createElement("div");
    o.className = "spacer", this.actionsEl = document.createElement("div"), this.actionsEl.className = "actions", this.actionsEl.style.display = "flex", this.actionsEl.style.gap = "8px", r.append(this.timerEl, o, this.actionsEl), this.gridEl = document.createElement("div"), this.gridEl.className = "grid", this.cells = [];
    for (let a = 0; a < 81; a++) {
      const c = document.createElement("div");
      c.className = "cell";
      const u = Math.floor(a / 9);
      u % 3 === 2 && u !== 8 && c.classList.add("row-block"), u === 8 && c.classList.add("last-row"), c.dataset.index = String(a), this.gridEl.appendChild(c), this.cells.push(c);
    }
    this.gridEl.addEventListener("click", (a) => {
      const c = a.target.closest(".cell");
      !c || c.dataset.index === void 0 || this.selectCell(Number(c.dataset.index));
    });
    const l = document.createElement("div");
    l.className = "keypad";
    for (let a = 1; a <= 9; a++) {
      const c = document.createElement("button");
      c.textContent = String(a), c.type = "button", c.addEventListener("click", () => this.inputValue(a)), l.appendChild(c);
    }
    const s = document.createElement("button");
    s.type = "button", s.className = "key-erase", s.setAttribute("aria-label", "Smazat"), s.textContent = "⌫", s.addEventListener("click", () => this.eraseValue()), l.appendChild(s), t.append(r, this.gridEl, l), this.root.appendChild(t), this.renderActions();
  }
  // ------------------------------------------------------------------ rendering
  renderActions() {
    if (this.actionsEl.replaceChildren(), this.pending === null) {
      const e = this.button("Reset", () => this.requestConfirm("reset")), t = this.button("Nová sudoku", () => this.requestConfirm("new"));
      this.actionsEl.append(e, t);
    } else {
      const e = this.pending === "reset" ? "Resetovat?" : "Nová hra?", t = document.createElement("span");
      t.textContent = e, t.style.alignSelf = "center", t.style.fontSize = "14px";
      const r = this.button("Ano", () => this.confirmYes());
      r.className = "btn-confirm";
      const o = this.button("Ne", () => this.confirmNo());
      this.actionsEl.append(t, r, o);
    }
  }
  button(e, t) {
    const r = document.createElement("button");
    return r.type = "button", r.textContent = e, r.addEventListener("click", t), r;
  }
  renderAll() {
    this.renderActions(), this.renderGrid(), this.renderTimer(), this.renderOverlay();
  }
  renderGrid() {
    const e = this.board(), t = this.computeConflicts(e);
    for (let r = 0; r < 81; r++) {
      const o = this.cells[r], l = this.puzzle[r] !== f, s = e[r];
      o.textContent = s === f ? "" : s, o.classList.toggle("given", l), o.classList.toggle("selectable", !l), o.classList.toggle("selected", this.selected === r), o.classList.toggle("conflict", t[r]);
    }
  }
  renderTimer() {
    this.timerEl.textContent = w(this.elapsed);
  }
  renderOverlay() {
    this.completed ? this.showCompletionOverlay() : this.overlayEl && (this.overlayEl.remove(), this.overlayEl = null);
  }
  showCompletionOverlay() {
    var c;
    if (this.overlayEl) return;
    const e = document.createElement("div");
    e.className = "overlay";
    const t = document.createElement("div");
    t.className = "overlay-card";
    const r = document.createElement("h2");
    r.textContent = "Hotovo";
    const o = document.createElement("p");
    o.append("Vyřešeno za ");
    const l = document.createElement("span");
    l.className = "big-time", l.textContent = w(this.elapsed), o.append(l);
    const s = document.createElement("div");
    s.className = "overlay-actions";
    const a = this.button("Nová hra", () => this.newGame(!0));
    a.className = "btn-primary", s.appendChild(a), t.append(r, o, s), e.appendChild(t), (c = this.root.querySelector(".wrap")) == null || c.appendChild(e), this.overlayEl = e;
  }
  // ------------------------------------------------------------------ board helpers
  /** Merged current board: given cells overlaid with user entries. */
  board() {
    let e = "";
    for (let t = 0; t < 81; t++)
      e += this.puzzle[t] !== f ? this.puzzle[t] : this.entries[t];
    return e;
  }
  /**
   * Conflict map: a cell is flagged if it sits in a row, column, or 3x3 box
   * that contains a repeated digit. Whole conflicting regions are highlighted.
   */
  computeConflicts(e) {
    const t = new Array(81).fill(!1), r = (o) => {
      const l = /* @__PURE__ */ new Map();
      for (const a of o) {
        const c = e[a];
        if (c === f) continue;
        const u = l.get(c);
        u ? u.push(a) : l.set(c, [a]);
      }
      let s = !1;
      for (const a of l.values())
        a.length > 1 && (s = !0);
      if (s)
        for (const a of o) t[a] = !0;
    };
    for (let o = 0; o < 9; o++) {
      const l = [];
      for (let s = 0; s < 9; s++) l.push(o * 9 + s);
      r(l);
    }
    for (let o = 0; o < 9; o++) {
      const l = [];
      for (let s = 0; s < 9; s++) l.push(s * 9 + o);
      r(l);
    }
    for (let o = 0; o < 3; o++)
      for (let l = 0; l < 3; l++) {
        const s = [];
        for (let a = 0; a < 3; a++)
          for (let c = 0; c < 3; c++)
            s.push((o * 3 + a) * 9 + (l * 3 + c));
        r(s);
      }
    return t;
  }
  // ------------------------------------------------------------------ interaction
  selectCell(e) {
    var t;
    this.completed || this.puzzle[e] === f && (this.selected = e, (t = this.root.querySelector(".wrap")) == null || t.focus(), this.renderGrid());
  }
  inputValue(e) {
    if (this.completed || this.selected === null) return;
    const t = this.selected;
    this.puzzle[t] === f && (this.entries = k(this.entries, t, String(e)), this.afterMove());
  }
  eraseValue() {
    if (this.completed || this.selected === null) return;
    const e = this.selected;
    this.puzzle[e] === f && this.entries[e] !== f && (this.entries = k(this.entries, e, f), this.afterMove());
  }
  afterMove() {
    if (this.renderGrid(), this.checkComplete()) {
      this.completed = !0, this.stopTimer(), this.clearSaved(), this.renderOverlay();
      return;
    }
    this.save();
  }
  checkComplete() {
    return this.board() === this.solution;
  }
  handleKeyDown(e) {
    if (this.completed) return;
    const t = e.key;
    if (t >= "1" && t <= "9") {
      this.inputValue(Number(t)), e.preventDefault();
      return;
    }
    if (t === "Backspace" || t === "Delete" || t === "0") {
      this.eraseValue(), e.preventDefault();
      return;
    }
    t.startsWith("Arrow") && (this.moveSelection(t), e.preventDefault());
  }
  moveSelection(e) {
    if (this.selected === null) {
      this.selectFirstSelectable();
      return;
    }
    const t = e === "ArrowUp" ? -1 : e === "ArrowDown" ? 1 : 0, r = e === "ArrowLeft" ? -1 : e === "ArrowRight" ? 1 : 0;
    let o = Math.floor(this.selected / 9), l = this.selected % 9;
    for (let s = 0; s < 9; s++) {
      if (o += t, l += r, o < 0 || o >= 9 || l < 0 || l >= 9) return;
      const a = o * 9 + l;
      if (this.puzzle[a] === f) {
        this.selected = a, this.renderGrid();
        return;
      }
    }
  }
  selectFirstSelectable() {
    for (let e = 0; e < 81; e++)
      if (this.puzzle[e] === f) {
        this.selected = e, this.renderGrid();
        return;
      }
  }
  // ------------------------------------------------------------------ confirm flow
  requestConfirm(e) {
    this.pending = e, this.renderActions();
  }
  confirmNo() {
    this.pending = null, this.renderActions();
  }
  confirmYes() {
    const e = this.pending;
    this.pending = null, e === "reset" ? this.reset() : e === "new" && this.newGame(!0), this.renderActions();
  }
  reset() {
    this.entries = f.repeat(81), this.elapsed = 0, this.selected = null, this.completed = !1, this.renderAll(), this.startTimer(), this.save();
  }
  newGame(e) {
    const { puzzle: t, solution: r } = q(this.difficulty);
    this.puzzle = t, this.solution = r, this.entries = f.repeat(81), this.elapsed = 0, this.selected = null, this.completed = !1, this.overlayEl && (this.overlayEl.remove(), this.overlayEl = null), this.renderAll(), e && this.startTimer(), this.save();
  }
  // ------------------------------------------------------------------ timer
  startTimer() {
    this.stopTimer(), this.intervalId = window.setInterval(() => this.tick(), 1e3);
  }
  stopTimer() {
    this.intervalId !== null && (window.clearInterval(this.intervalId), this.intervalId = null);
  }
  tick() {
    this.completed || document.hidden || (this.elapsed++, this.renderTimer(), ++this.sinceSave >= 5 && (this.sinceSave = 0, this.save()));
  }
  handleVisibility() {
    document.hidden && this.save();
  }
  // ------------------------------------------------------------------ persistence
  save() {
    if (this.completed) return;
    const e = {
      version: z,
      puzzle: this.puzzle,
      solution: this.solution,
      entries: this.entries,
      difficulty: this.difficulty,
      elapsed: this.elapsed,
      savedAt: Date.now()
    };
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(e));
    } catch {
    }
  }
  clearSaved() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch {
    }
  }
  /** Returns true if a valid in-progress game was restored. */
  restore() {
    let e = null;
    try {
      e = localStorage.getItem(this.storageKey);
    } catch {
      return !1;
    }
    if (!e) return !1;
    let t;
    try {
      t = JSON.parse(e);
    } catch {
      return !1;
    }
    return F(t) ? (this.puzzle = t.puzzle, this.solution = t.solution, this.entries = t.entries, this.elapsed = t.elapsed, this.selected = null, this.completed = !1, !0) : (this.clearSaved(), !1);
  }
}
function k(i, n, e) {
  return i.slice(0, n) + e + i.slice(n + 1);
}
function w(i) {
  const n = Math.floor(i / 60), e = i % 60;
  return `${String(n).padStart(2, "0")}:${String(e).padStart(2, "0")}`;
}
function F(i) {
  if (typeof i != "object" || i === null) return !1;
  const n = i;
  return n.version === z && typeof n.puzzle == "string" && n.puzzle.length === 81 && typeof n.solution == "string" && n.solution.length === 81 && typeof n.entries == "string" && n.entries.length === 81 && typeof n.difficulty == "number" && typeof n.elapsed == "number" && typeof n.savedAt == "number";
}
typeof customElements < "u" && !customElements.get("sudoku-game") && customElements.define("sudoku-game", R);
export {
  R as SudokuGame
};

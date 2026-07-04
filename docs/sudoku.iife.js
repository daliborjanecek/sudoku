var SudokuGame=function(p){"use strict";var j=Object.defineProperty;var U=(p,m,b)=>m in p?j(p,m,{enumerable:!0,configurable:!0,writable:!0,value:b}):p[m]=b;var d=(p,m,b)=>U(p,typeof m!="symbol"?m+"":m,b);const m=`
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
  --_overlay-bg: var(--sudoku-overlay-bg, #ffffff);
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
  transition: opacity 0.2s ease;
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
  transition: opacity 0.2s ease;
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
  transition: opacity 0.2s ease;
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

/* ---------- Completion state ---------- */
/* The board and controls fade to 45% opacity behind the win overlay,
   instead of being dimmed by a dark scrim on top of them. */
.wrap.completed > .topbar,
.wrap.completed > .grid,
.wrap.completed > .keypad {
  opacity: 0.45;
  pointer-events: none;
}

/* ---------- Overlay ---------- */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  z-index: 10;
  padding: 16px;
}
.overlay-card {
  background: var(--_overlay-bg);
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
`,f=".",M={1:[30,35],2:[36,41],3:[42,46],4:[47,51],5:[52,56]};function k(s){if(!Number.isFinite(s))return 3;const i=Math.trunc(s);return i<1?1:i>5?5:i}function T(s){return M[k(s)]}function w(s){for(let i=s.length-1;i>0;i--){const e=Math.floor(Math.random()*(i+1));[s[i],s[e]]=[s[e],s[i]]}return s}function G(s,i,e){const t=Math.floor(i/9),r=i%9,o=t-t%3,l=r-r%3;for(let n=0;n<9;n++)if(s[t*9+n]===e||s[n*9+r]===e)return!1;for(let n=0;n<3;n++)for(let a=0;a<3;a++)if(s[(o+n)*9+(l+a)]===e)return!1;return!0}function C(s){let i=-1;for(let t=0;t<81;t++)if(s[t]===0){i=t;break}if(i===-1)return!0;const e=w([1,2,3,4,5,6,7,8,9]);for(const t of e)if(G(s,i,t)){if(s[i]=t,C(s))return!0;s[i]=0}return!1}const D=1022;function O(s){let i=0;for(;s;)s&=s-1,i++;return i}const y=(s,i)=>Math.floor(s/3)*3+Math.floor(i/3);function V(s){const i=new Int16Array(9),e=new Int16Array(9),t=new Int16Array(9);for(let r=0;r<81;r++){const o=s[r];if(o!==0){const l=Math.floor(r/9),n=r%9,a=1<<o;i[l]|=a,e[n]|=a,t[y(l,n)]|=a}}return{rows:i,cols:e,boxes:t}}function K(s,i){const{rows:e,cols:t,boxes:r}=V(s);let o=0;const l=()=>{let n=-1,a=10,c=0;for(let h=0;h<81;h++){if(s[h]!==0)continue;const g=Math.floor(h/9),Z=h%9,x=D&~(e[g]|t[Z]|r[y(g,Z)]);if(x===0)return;const S=O(x);if(S<a&&(a=S,n=h,c=x,S===1))break}if(n===-1){o++;return}const u=Math.floor(n/9),E=n%9,N=y(u,E);let v=c;for(;v!==0;){const h=v&-v;v^=h;const g=31-Math.clz32(h);if(s[n]=g,e[u]|=h,t[E]|=h,r[N]|=h,l(),s[n]=0,e[u]^=h,t[E]^=h,r[N]^=h,o>=i)return}};return l(),o}function L(s){let i="";for(let e=0;e<81;e++)i+=s[e]===0?f:String(s[e]);return i}function R(s){const i=new Int8Array(81);C(i);const e=L(i),[t,r]=T(s),o=t+Math.floor(Math.random()*(r-t+1)),l=i.slice(),n=w(Array.from({length:81},(c,u)=>u));let a=0;for(const c of n){if(a>=o)break;const u=l[c];u!==0&&(l[c]=0,K(l.slice(),2)===1?a++:l[c]=u)}return{puzzle:L(l),solution:e}}const I=1,q="sudoku-game";class _ extends HTMLElement{constructor(){super();d(this,"puzzle","");d(this,"solution","");d(this,"entries","");d(this,"elapsed",0);d(this,"selected",null);d(this,"completed",!1);d(this,"pending",null);d(this,"root");d(this,"cells",[]);d(this,"timerEl");d(this,"actionsEl");d(this,"gridEl");d(this,"wrapEl");d(this,"overlayEl",null);d(this,"intervalId",null);d(this,"sinceSave",0);d(this,"built",!1);d(this,"onVisibility",()=>this.handleVisibility());d(this,"onKeyDown",e=>this.handleKeyDown(e));this.root=this.attachShadow({mode:"open"})}connectedCallback(){this.built||(this.buildSkeleton(),this.built=!0,this.restore()||this.newGame(!1),this.renderAll()),this.completed||this.startTimer(),document.addEventListener("visibilitychange",this.onVisibility)}disconnectedCallback(){this.stopTimer(),document.removeEventListener("visibilitychange",this.onVisibility),this.save()}get difficulty(){const e=this.getAttribute("difficulty"),t=e===null?NaN:Number(e);return k(Number.isFinite(t)?t:3)}get storageKey(){return this.getAttribute("storage-key")||q}buildSkeleton(){const e=document.createElement("style");e.textContent=m,this.root.appendChild(e);const t=document.createElement("div");t.className="wrap",t.tabIndex=0,t.addEventListener("keydown",this.onKeyDown),this.wrapEl=t;const r=document.createElement("div");r.className="topbar",this.timerEl=document.createElement("div"),this.timerEl.className="timer",this.timerEl.textContent="00:00";const o=document.createElement("div");o.className="spacer",this.actionsEl=document.createElement("div"),this.actionsEl.className="actions",this.actionsEl.style.display="flex",this.actionsEl.style.gap="8px",r.append(this.timerEl,o,this.actionsEl),this.gridEl=document.createElement("div"),this.gridEl.className="grid",this.cells=[];for(let a=0;a<81;a++){const c=document.createElement("div");c.className="cell";const u=Math.floor(a/9);u%3===2&&u!==8&&c.classList.add("row-block"),u===8&&c.classList.add("last-row"),c.dataset.index=String(a),this.gridEl.appendChild(c),this.cells.push(c)}this.gridEl.addEventListener("click",a=>{const c=a.target.closest(".cell");!c||c.dataset.index===void 0||this.selectCell(Number(c.dataset.index))});const l=document.createElement("div");l.className="keypad";for(let a=1;a<=9;a++){const c=document.createElement("button");c.textContent=String(a),c.type="button",c.addEventListener("click",()=>this.inputValue(a)),l.appendChild(c)}const n=document.createElement("button");n.type="button",n.className="key-erase",n.setAttribute("aria-label","Smazat"),n.textContent="⌫",n.addEventListener("click",()=>this.eraseValue()),l.appendChild(n),t.append(r,this.gridEl,l),this.root.appendChild(t),this.renderActions()}renderActions(){if(this.actionsEl.replaceChildren(),this.pending===null){const e=this.button("Reset",()=>this.requestConfirm("reset")),t=this.button("Nová sudoku",()=>this.requestConfirm("new"));this.actionsEl.append(e,t)}else{const e=this.pending==="reset"?"Resetovat?":"Nová hra?",t=document.createElement("span");t.textContent=e,t.style.alignSelf="center",t.style.fontSize="14px";const r=this.button("Ano",()=>this.confirmYes());r.className="btn-confirm";const o=this.button("Ne",()=>this.confirmNo());this.actionsEl.append(t,r,o)}}button(e,t){const r=document.createElement("button");return r.type="button",r.textContent=e,r.addEventListener("click",t),r}renderAll(){this.renderActions(),this.renderGrid(),this.renderTimer(),this.renderOverlay()}renderGrid(){const e=this.board(),t=this.computeConflicts(e);for(let r=0;r<81;r++){const o=this.cells[r],l=this.puzzle[r]!==f,n=e[r];o.textContent=n===f?"":n,o.classList.toggle("given",l),o.classList.toggle("selectable",!l),o.classList.toggle("selected",this.selected===r),o.classList.toggle("conflict",t[r])}}renderTimer(){this.timerEl.textContent=A(this.elapsed)}renderOverlay(){this.wrapEl.classList.toggle("completed",this.completed),this.completed?this.showCompletionOverlay():this.overlayEl&&(this.overlayEl.remove(),this.overlayEl=null)}showCompletionOverlay(){if(this.overlayEl)return;const e=document.createElement("div");e.className="overlay";const t=document.createElement("div");t.className="overlay-card";const r=document.createElement("h2");r.textContent="Hotovo";const o=document.createElement("p");o.append("Vyřešeno za ");const l=document.createElement("span");l.className="big-time",l.textContent=A(this.elapsed),o.append(l);const n=document.createElement("div");n.className="overlay-actions";const a=this.button("Nová hra",()=>this.newGame(!0));a.className="btn-primary",n.appendChild(a),t.append(r,o,n),e.appendChild(t),this.wrapEl.appendChild(e),this.overlayEl=e}board(){let e="";for(let t=0;t<81;t++)e+=this.puzzle[t]!==f?this.puzzle[t]:this.entries[t];return e}computeConflicts(e){const t=new Array(81).fill(!1),r=o=>{const l=new Map;for(const a of o){const c=e[a];if(c===f)continue;const u=l.get(c);u?u.push(a):l.set(c,[a])}let n=!1;for(const a of l.values())a.length>1&&(n=!0);if(n)for(const a of o)t[a]=!0};for(let o=0;o<9;o++){const l=[];for(let n=0;n<9;n++)l.push(o*9+n);r(l)}for(let o=0;o<9;o++){const l=[];for(let n=0;n<9;n++)l.push(n*9+o);r(l)}for(let o=0;o<3;o++)for(let l=0;l<3;l++){const n=[];for(let a=0;a<3;a++)for(let c=0;c<3;c++)n.push((o*3+a)*9+(l*3+c));r(n)}return t}selectCell(e){this.completed||this.puzzle[e]===f&&(this.selected=e,this.wrapEl.focus(),this.renderGrid())}inputValue(e){if(this.completed||this.selected===null)return;const t=this.selected;this.puzzle[t]===f&&(this.entries=z(this.entries,t,String(e)),this.afterMove())}eraseValue(){if(this.completed||this.selected===null)return;const e=this.selected;this.puzzle[e]===f&&this.entries[e]!==f&&(this.entries=z(this.entries,e,f),this.afterMove())}afterMove(){if(this.renderGrid(),this.checkComplete()){this.completed=!0,this.stopTimer(),this.clearSaved(),this.renderOverlay();return}this.save()}checkComplete(){return this.board()===this.solution}handleKeyDown(e){if(this.completed)return;const t=e.key;if(t>="1"&&t<="9"){this.inputValue(Number(t)),e.preventDefault();return}if(t==="Backspace"||t==="Delete"||t==="0"){this.eraseValue(),e.preventDefault();return}t.startsWith("Arrow")&&(this.moveSelection(t),e.preventDefault())}moveSelection(e){if(this.selected===null){this.selectFirstSelectable();return}const t=e==="ArrowUp"?-1:e==="ArrowDown"?1:0,r=e==="ArrowLeft"?-1:e==="ArrowRight"?1:0;let o=Math.floor(this.selected/9),l=this.selected%9;for(let n=0;n<9;n++){if(o+=t,l+=r,o<0||o>=9||l<0||l>=9)return;const a=o*9+l;if(this.puzzle[a]===f){this.selected=a,this.renderGrid();return}}}selectFirstSelectable(){for(let e=0;e<81;e++)if(this.puzzle[e]===f){this.selected=e,this.renderGrid();return}}requestConfirm(e){this.pending=e,this.renderActions()}confirmNo(){this.pending=null,this.renderActions()}confirmYes(){const e=this.pending;this.pending=null,e==="reset"?this.reset():e==="new"&&this.newGame(!0),this.renderActions()}reset(){this.entries=f.repeat(81),this.elapsed=0,this.selected=null,this.completed=!1,this.renderAll(),this.startTimer(),this.save()}newGame(e){const{puzzle:t,solution:r}=R(this.difficulty);this.puzzle=t,this.solution=r,this.entries=f.repeat(81),this.elapsed=0,this.selected=null,this.completed=!1,this.overlayEl&&(this.overlayEl.remove(),this.overlayEl=null),this.renderAll(),e&&this.startTimer(),this.save()}startTimer(){this.stopTimer(),this.intervalId=window.setInterval(()=>this.tick(),1e3)}stopTimer(){this.intervalId!==null&&(window.clearInterval(this.intervalId),this.intervalId=null)}tick(){this.completed||document.hidden||(this.elapsed++,this.renderTimer(),++this.sinceSave>=5&&(this.sinceSave=0,this.save()))}handleVisibility(){document.hidden&&this.save()}save(){if(this.completed)return;const e={version:I,puzzle:this.puzzle,solution:this.solution,entries:this.entries,difficulty:this.difficulty,elapsed:this.elapsed,savedAt:Date.now()};try{localStorage.setItem(this.storageKey,JSON.stringify(e))}catch{}}clearSaved(){try{localStorage.removeItem(this.storageKey)}catch{}}restore(){let e=null;try{e=localStorage.getItem(this.storageKey)}catch{return!1}if(!e)return!1;let t;try{t=JSON.parse(e)}catch{return!1}return F(t)?(this.puzzle=t.puzzle,this.solution=t.solution,this.entries=t.entries,this.elapsed=t.elapsed,this.selected=null,this.completed=!1,!0):(this.clearSaved(),!1)}}function z(s,i,e){return s.slice(0,i)+e+s.slice(i+1)}function A(s){const i=Math.floor(s/60),e=s%60;return`${String(i).padStart(2,"0")}:${String(e).padStart(2,"0")}`}function F(s){if(typeof s!="object"||s===null)return!1;const i=s;return i.version===I&&typeof i.puzzle=="string"&&i.puzzle.length===81&&typeof i.solution=="string"&&i.solution.length===81&&typeof i.entries=="string"&&i.entries.length===81&&typeof i.difficulty=="number"&&typeof i.elapsed=="number"&&typeof i.savedAt=="number"}return typeof customElements<"u"&&!customElements.get("sudoku-game")&&customElements.define("sudoku-game",_),p.SudokuGame=_,Object.defineProperty(p,Symbol.toStringTag,{value:"Module"}),p}({});

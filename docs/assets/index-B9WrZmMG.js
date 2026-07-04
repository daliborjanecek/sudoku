var M=Object.defineProperty;var I=(r,i,e)=>i in r?M(r,i,{enumerable:!0,configurable:!0,writable:!0,value:e}):r[i]=e;var u=(r,i,e)=>I(r,typeof i!="symbol"?i+"":i,e);(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))t(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const l of s.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&t(l)}).observe(document,{childList:!0,subtree:!0});function e(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function t(n){if(n.ep)return;n.ep=!0;const s=e(n);fetch(n.href,s)}})();const T=`
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
`,d=9,f=81,m=".",O={1:[30,35],2:[36,41],3:[42,46],4:[47,51],5:[52,56]};function C(r){if(!Number.isFinite(r))return 3;const i=Math.trunc(r);return i<1?1:i>5?5:i}function G(r){return O[C(r)]}function A(r){for(let i=r.length-1;i>0;i--){const e=Math.floor(Math.random()*(i+1));[r[i],r[e]]=[r[e],r[i]]}return r}function D(r,i,e){const t=Math.floor(i/d),n=i%d,s=t-t%3,l=n-n%3;for(let o=0;o<d;o++)if(r[t*d+o]===e||r[o*d+n]===e)return!1;for(let o=0;o<3;o++)for(let c=0;c<3;c++)if(r[(s+o)*d+(l+c)]===e)return!1;return!0}function N(r){let i=-1;for(let t=0;t<f;t++)if(r[t]===0){i=t;break}if(i===-1)return!0;const e=A([1,2,3,4,5,6,7,8,9]);for(const t of e)if(D(r,i,t)){if(r[i]=t,N(r))return!0;r[i]=0}return!1}const V=1022;function q(r){let i=0;for(;r;)r&=r-1,i++;return i}const w=(r,i)=>Math.floor(r/3)*3+Math.floor(i/3);function K(r){const i=new Int16Array(d),e=new Int16Array(d),t=new Int16Array(d);for(let n=0;n<f;n++){const s=r[n];if(s!==0){const l=Math.floor(n/d),o=n%d,c=1<<s;i[l]|=c,e[o]|=c,t[w(l,o)]|=c}}return{rows:i,cols:e,boxes:t}}function R(r,i){const{rows:e,cols:t,boxes:n}=K(r);let s=0;const l=()=>{let o=-1,c=10,a=0;for(let p=0;p<f;p++){if(r[p]!==0)continue;const g=Math.floor(p/d),E=p%d,y=V&~(e[g]|t[E]|n[w(g,E)]);if(y===0)return;const x=q(y);if(x<c&&(c=x,o=p,a=y,x===1))break}if(o===-1){s++;return}const h=Math.floor(o/d),v=o%d,k=w(h,v);let b=a;for(;b!==0;){const p=b&-b;b^=p;const g=31-Math.clz32(p);if(r[o]=g,e[h]|=p,t[v]|=p,n[k]|=p,l(),r[o]=0,e[h]^=p,t[v]^=p,n[k]^=p,s>=i)return}};return l(),s}function z(r){let i="";for(let e=0;e<f;e++)i+=r[e]===0?m:String(r[e]);return i}function F(r){const i=new Int8Array(f);N(i);const e=z(i),[t,n]=G(r),s=t+Math.floor(Math.random()*(n-t+1)),l=i.slice(),o=A(Array.from({length:f},(a,h)=>h));let c=0;for(const a of o){if(c>=s)break;const h=l[a];h!==0&&(l[a]=0,R(l.slice(),2)===1?c++:l[a]=h)}return{puzzle:z(l),solution:e}}const L=1,P="sudoku-game";class j extends HTMLElement{constructor(){super();u(this,"puzzle","");u(this,"solution","");u(this,"entries","");u(this,"elapsed",0);u(this,"selected",null);u(this,"completed",!1);u(this,"pending",null);u(this,"root");u(this,"cells",[]);u(this,"timerEl");u(this,"actionsEl");u(this,"gridEl");u(this,"overlayEl",null);u(this,"intervalId",null);u(this,"sinceSave",0);u(this,"built",!1);u(this,"onVisibility",()=>this.handleVisibility());u(this,"onKeyDown",e=>this.handleKeyDown(e));this.root=this.attachShadow({mode:"open"})}connectedCallback(){this.built||(this.buildSkeleton(),this.built=!0,this.restore()||this.newGame(!1),this.renderAll()),this.completed||this.startTimer(),document.addEventListener("visibilitychange",this.onVisibility)}disconnectedCallback(){this.stopTimer(),document.removeEventListener("visibilitychange",this.onVisibility),this.save()}get difficulty(){const e=this.getAttribute("difficulty"),t=e===null?NaN:Number(e);return C(Number.isFinite(t)?t:3)}get storageKey(){return this.getAttribute("storage-key")||P}buildSkeleton(){const e=document.createElement("style");e.textContent=T,this.root.appendChild(e);const t=document.createElement("div");t.className="wrap",t.tabIndex=0,t.addEventListener("keydown",this.onKeyDown);const n=document.createElement("div");n.className="topbar",this.timerEl=document.createElement("div"),this.timerEl.className="timer",this.timerEl.textContent="00:00";const s=document.createElement("div");s.className="spacer",this.actionsEl=document.createElement("div"),this.actionsEl.className="actions",this.actionsEl.style.display="flex",this.actionsEl.style.gap="8px",n.append(this.timerEl,s,this.actionsEl),this.gridEl=document.createElement("div"),this.gridEl.className="grid",this.cells=[];for(let c=0;c<f;c++){const a=document.createElement("div");a.className="cell";const h=Math.floor(c/d);h%3===2&&h!==d-1&&a.classList.add("row-block"),h===d-1&&a.classList.add("last-row"),a.dataset.index=String(c),this.gridEl.appendChild(a),this.cells.push(a)}this.gridEl.addEventListener("click",c=>{const a=c.target.closest(".cell");!a||a.dataset.index===void 0||this.selectCell(Number(a.dataset.index))});const l=document.createElement("div");l.className="keypad";for(let c=1;c<=9;c++){const a=document.createElement("button");a.textContent=String(c),a.type="button",a.addEventListener("click",()=>this.inputValue(c)),l.appendChild(a)}const o=document.createElement("button");o.type="button",o.className="key-erase",o.setAttribute("aria-label","Smazat"),o.textContent="⌫",o.addEventListener("click",()=>this.eraseValue()),l.appendChild(o),t.append(n,this.gridEl,l),this.root.appendChild(t),this.renderActions()}renderActions(){if(this.actionsEl.replaceChildren(),this.pending===null){const e=this.button("Reset",()=>this.requestConfirm("reset")),t=this.button("Nová sudoku",()=>this.requestConfirm("new"));this.actionsEl.append(e,t)}else{const e=this.pending==="reset"?"Resetovat?":"Nová hra?",t=document.createElement("span");t.textContent=e,t.style.alignSelf="center",t.style.fontSize="14px";const n=this.button("Ano",()=>this.confirmYes());n.className="btn-confirm";const s=this.button("Ne",()=>this.confirmNo());this.actionsEl.append(t,n,s)}}button(e,t){const n=document.createElement("button");return n.type="button",n.textContent=e,n.addEventListener("click",t),n}renderAll(){this.renderActions(),this.renderGrid(),this.renderTimer(),this.renderOverlay()}renderGrid(){const e=this.board(),t=this.computeConflicts(e);for(let n=0;n<f;n++){const s=this.cells[n],l=this.puzzle[n]!==m,o=e[n];s.textContent=o===m?"":o,s.classList.toggle("given",l),s.classList.toggle("selectable",!l),s.classList.toggle("selected",this.selected===n),s.classList.toggle("conflict",t[n])}}renderTimer(){this.timerEl.textContent=S(this.elapsed)}renderOverlay(){this.completed?this.showCompletionOverlay():this.overlayEl&&(this.overlayEl.remove(),this.overlayEl=null)}showCompletionOverlay(){var a;if(this.overlayEl)return;const e=document.createElement("div");e.className="overlay";const t=document.createElement("div");t.className="overlay-card";const n=document.createElement("h2");n.textContent="Hotovo";const s=document.createElement("p");s.append("Vyřešeno za ");const l=document.createElement("span");l.className="big-time",l.textContent=S(this.elapsed),s.append(l);const o=document.createElement("div");o.className="overlay-actions";const c=this.button("Nová hra",()=>this.newGame(!0));c.className="btn-primary",o.appendChild(c),t.append(n,s,o),e.appendChild(t),(a=this.root.querySelector(".wrap"))==null||a.appendChild(e),this.overlayEl=e}board(){let e="";for(let t=0;t<f;t++)e+=this.puzzle[t]!==m?this.puzzle[t]:this.entries[t];return e}computeConflicts(e){const t=new Array(f).fill(!1),n=s=>{const l=new Map;for(const c of s){const a=e[c];if(a===m)continue;const h=l.get(a);h?h.push(c):l.set(a,[c])}let o=!1;for(const c of l.values())c.length>1&&(o=!0);if(o)for(const c of s)t[c]=!0};for(let s=0;s<d;s++){const l=[];for(let o=0;o<d;o++)l.push(s*d+o);n(l)}for(let s=0;s<d;s++){const l=[];for(let o=0;o<d;o++)l.push(o*d+s);n(l)}for(let s=0;s<3;s++)for(let l=0;l<3;l++){const o=[];for(let c=0;c<3;c++)for(let a=0;a<3;a++)o.push((s*3+c)*d+(l*3+a));n(o)}return t}selectCell(e){var t;this.completed||this.puzzle[e]===m&&(this.selected=e,(t=this.root.querySelector(".wrap"))==null||t.focus(),this.renderGrid())}inputValue(e){if(this.completed||this.selected===null)return;const t=this.selected;this.puzzle[t]===m&&(this.entries=_(this.entries,t,String(e)),this.afterMove())}eraseValue(){if(this.completed||this.selected===null)return;const e=this.selected;this.puzzle[e]===m&&this.entries[e]!==m&&(this.entries=_(this.entries,e,m),this.afterMove())}afterMove(){if(this.renderGrid(),this.checkComplete()){this.completed=!0,this.stopTimer(),this.clearSaved(),this.renderOverlay();return}this.save()}checkComplete(){return this.board()===this.solution}handleKeyDown(e){if(this.completed)return;const t=e.key;if(t>="1"&&t<="9"){this.inputValue(Number(t)),e.preventDefault();return}if(t==="Backspace"||t==="Delete"||t==="0"){this.eraseValue(),e.preventDefault();return}t.startsWith("Arrow")&&(this.moveSelection(t),e.preventDefault())}moveSelection(e){if(this.selected===null){this.selectFirstSelectable();return}const t=e==="ArrowUp"?-1:e==="ArrowDown"?1:0,n=e==="ArrowLeft"?-1:e==="ArrowRight"?1:0;let s=Math.floor(this.selected/d),l=this.selected%d;for(let o=0;o<d;o++){if(s+=t,l+=n,s<0||s>=d||l<0||l>=d)return;const c=s*d+l;if(this.puzzle[c]===m){this.selected=c,this.renderGrid();return}}}selectFirstSelectable(){for(let e=0;e<f;e++)if(this.puzzle[e]===m){this.selected=e,this.renderGrid();return}}requestConfirm(e){this.pending=e,this.renderActions()}confirmNo(){this.pending=null,this.renderActions()}confirmYes(){const e=this.pending;this.pending=null,e==="reset"?this.reset():e==="new"&&this.newGame(!0),this.renderActions()}reset(){this.entries=m.repeat(f),this.elapsed=0,this.selected=null,this.completed=!1,this.renderAll(),this.startTimer(),this.save()}newGame(e){const{puzzle:t,solution:n}=F(this.difficulty);this.puzzle=t,this.solution=n,this.entries=m.repeat(f),this.elapsed=0,this.selected=null,this.completed=!1,this.overlayEl&&(this.overlayEl.remove(),this.overlayEl=null),this.renderAll(),e&&this.startTimer(),this.save()}startTimer(){this.stopTimer(),this.intervalId=window.setInterval(()=>this.tick(),1e3)}stopTimer(){this.intervalId!==null&&(window.clearInterval(this.intervalId),this.intervalId=null)}tick(){this.completed||document.hidden||(this.elapsed++,this.renderTimer(),++this.sinceSave>=5&&(this.sinceSave=0,this.save()))}handleVisibility(){document.hidden&&this.save()}save(){if(this.completed)return;const e={version:L,puzzle:this.puzzle,solution:this.solution,entries:this.entries,difficulty:this.difficulty,elapsed:this.elapsed,savedAt:Date.now()};try{localStorage.setItem(this.storageKey,JSON.stringify(e))}catch{}}clearSaved(){try{localStorage.removeItem(this.storageKey)}catch{}}restore(){let e=null;try{e=localStorage.getItem(this.storageKey)}catch{return!1}if(!e)return!1;let t;try{t=JSON.parse(e)}catch{return!1}return U(t)?(this.puzzle=t.puzzle,this.solution=t.solution,this.entries=t.entries,this.elapsed=t.elapsed,this.selected=null,this.completed=!1,!0):(this.clearSaved(),!1)}}function _(r,i,e){return r.slice(0,i)+e+r.slice(i+1)}function S(r){const i=Math.floor(r/60),e=r%60;return`${String(i).padStart(2,"0")}:${String(e).padStart(2,"0")}`}function U(r){if(typeof r!="object"||r===null)return!1;const i=r;return i.version===L&&typeof i.puzzle=="string"&&i.puzzle.length===f&&typeof i.solution=="string"&&i.solution.length===f&&typeof i.entries=="string"&&i.entries.length===f&&typeof i.difficulty=="number"&&typeof i.elapsed=="number"&&typeof i.savedAt=="number"}typeof customElements<"u"&&!customElements.get("sudoku-game")&&customElements.define("sudoku-game",j);

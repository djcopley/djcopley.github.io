// Tiny window manager.
// Usage:
//   import { wm } from './wm.js';
//   wm.open({ id, title, icon, content, width, height, x, y, body }) -> WindowHandle

const desktopEl = () => document.getElementById('desktop');

let zCounter = 100;
const windows = new Map();
const listeners = new Set();

function emit(event, win) { listeners.forEach(fn => fn(event, win)); }

function clampToViewport(x, y, w, h) {
  const dEl = desktopEl();
  const maxX = Math.max(0, dEl.clientWidth - 40);
  const maxY = Math.max(0, dEl.clientHeight - 22);
  return {
    x: Math.min(Math.max(0, x), maxX),
    y: Math.min(Math.max(0, y), maxY),
  };
}

function focusWindow(win) {
  zCounter += 1;
  win.el.style.zIndex = String(zCounter);
  for (const w of windows.values()) w.el.classList.remove('focused');
  win.el.classList.add('focused');
  win.focused = true;
  emit('focus', win);
}

function unfocusAll() {
  for (const w of windows.values()) {
    w.el.classList.remove('focused');
    w.focused = false;
  }
}

function makeWin({ id, title, icon = '', content, body = '', width = 480, height = 320, x, y, bodyClass = '' }) {
  if (windows.has(id)) {
    const existing = windows.get(id);
    existing.restore();
    focusWindow(existing);
    return existing;
  }

  const dEl = desktopEl();
  const dW = dEl.clientWidth;
  const dH = dEl.clientHeight;
  const w = Math.min(width, dW - 20);
  const h = Math.min(height, dH - 20);
  // Cascade if not specified
  const offset = (windows.size % 8) * 24;
  const finalX = x != null ? x : Math.max(20, Math.min(60 + offset, dW - w - 20));
  const finalY = y != null ? y : Math.max(20, Math.min(40 + offset, dH - h - 20));

  const el = document.createElement('div');
  el.className = 'win focused';
  el.style.width = w + 'px';
  el.style.height = h + 'px';
  el.style.left = finalX + 'px';
  el.style.top = finalY + 'px';

  el.innerHTML = `
    <div class="win-titlebar">
      ${icon ? `<span class="win-titlebar-icon">${icon}</span>` : ''}
      <span class="win-title-text">${title}</span>
      <div class="win-titlebar-buttons">
        <button class="btn-min" aria-label="Minimize" title="Minimize">_</button>
        <button class="btn-max" aria-label="Maximize" title="Maximize">▢</button>
        <button class="btn-close" aria-label="Close" title="Close">×</button>
      </div>
    </div>
    <div class="win-body ${bodyClass}"></div>
    <div class="win-resize" aria-hidden="true"></div>
  `;

  const bodyEl = el.querySelector('.win-body');
  if (content instanceof Node) bodyEl.appendChild(content);
  else if (typeof content === 'string') bodyEl.innerHTML = content;
  else if (body) bodyEl.innerHTML = body;

  dEl.appendChild(el);

  const win = {
    id, title, icon, el, bodyEl,
    focused: true,
    minimized: false,
    maximized: false,
    prevRect: null,
    close() {
      windows.delete(id);
      el.remove();
      emit('close', win);
      // Focus the topmost remaining window
      const remaining = [...windows.values()].filter(w => !w.minimized);
      if (remaining.length) {
        remaining.sort((a, b) => Number(a.el.style.zIndex) - Number(b.el.style.zIndex));
        focusWindow(remaining[remaining.length - 1]);
      }
    },
    minimize() {
      this.minimized = true;
      el.classList.add('minimized');
      unfocusAll();
      emit('minimize', win);
    },
    restore() {
      this.minimized = false;
      el.classList.remove('minimized');
      emit('restore', win);
    },
    toggleMax() {
      if (this.maximized) {
        this.maximized = false;
        el.classList.remove('maximized');
        if (this.prevRect) {
          el.style.width = this.prevRect.w + 'px';
          el.style.height = this.prevRect.h + 'px';
          el.style.left = this.prevRect.x + 'px';
          el.style.top = this.prevRect.y + 'px';
        }
      } else {
        this.prevRect = {
          w: el.offsetWidth, h: el.offsetHeight,
          x: el.offsetLeft, y: el.offsetTop,
        };
        this.maximized = true;
        el.classList.add('maximized');
      }
    },
    focus() { focusWindow(win); },
  };
  windows.set(id, win);

  // Wire title bar buttons
  el.querySelector('.btn-close').addEventListener('click', (e) => { e.stopPropagation(); win.close(); });
  el.querySelector('.btn-min').addEventListener('click', (e) => { e.stopPropagation(); win.minimize(); });
  el.querySelector('.btn-max').addEventListener('click', (e) => { e.stopPropagation(); win.toggleMax(); });

  // Focus on any pointerdown
  el.addEventListener('pointerdown', () => focusWindow(win));

  // Drag from title bar
  const titleEl = el.querySelector('.win-titlebar');
  let dragging = null;
  titleEl.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    if (win.maximized) return;
    dragging = {
      pid: e.pointerId,
      ox: e.clientX - el.offsetLeft,
      oy: e.clientY - el.offsetTop,
    };
    titleEl.setPointerCapture(e.pointerId);
  });
  titleEl.addEventListener('pointermove', (e) => {
    if (!dragging || dragging.pid !== e.pointerId) return;
    const { x, y } = clampToViewport(e.clientX - dragging.ox, e.clientY - dragging.oy, el.offsetWidth, el.offsetHeight);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  });
  const endDrag = (e) => {
    if (dragging && dragging.pid === e.pointerId) {
      try { titleEl.releasePointerCapture(e.pointerId); } catch (_) {}
      dragging = null;
    }
  };
  titleEl.addEventListener('pointerup', endDrag);
  titleEl.addEventListener('pointercancel', endDrag);

  // Double-click title to maximize
  titleEl.addEventListener('dblclick', (e) => {
    if (e.target.closest('button')) return;
    win.toggleMax();
  });

  // Resize grip
  const gripEl = el.querySelector('.win-resize');
  let resizing = null;
  gripEl.addEventListener('pointerdown', (e) => {
    if (win.maximized) return;
    resizing = {
      pid: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startW: el.offsetWidth,
      startH: el.offsetHeight,
    };
    gripEl.setPointerCapture(e.pointerId);
    e.stopPropagation();
  });
  gripEl.addEventListener('pointermove', (e) => {
    if (!resizing || resizing.pid !== e.pointerId) return;
    const w = Math.max(200, resizing.startW + (e.clientX - resizing.startX));
    const h = Math.max(120, resizing.startH + (e.clientY - resizing.startY));
    el.style.width = w + 'px';
    el.style.height = h + 'px';
  });
  const endResize = (e) => {
    if (resizing && resizing.pid === e.pointerId) {
      try { gripEl.releasePointerCapture(e.pointerId); } catch (_) {}
      resizing = null;
    }
  };
  gripEl.addEventListener('pointerup', endResize);
  gripEl.addEventListener('pointercancel', endResize);

  focusWindow(win);
  emit('open', win);
  return win;
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    const focused = [...windows.values()].find(w => w.focused && !w.minimized);
    if (focused) focused.close();
  }
});

export const wm = {
  open: makeWin,
  get(id) { return windows.get(id); },
  all() { return [...windows.values()]; },
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
};

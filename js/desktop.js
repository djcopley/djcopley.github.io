import { wm } from './wm.js';
import {
  readmeIcon, computerIcon, blogIcon, terminalIcon, recycleIcon, startIcon,
} from './icons.js';
import { openAbout } from './apps/about.js';
import { openProjects } from './apps/projects.js';
import { openBlog } from './apps/blog.js';
import { openTerminal } from './apps/terminal.js';
import { openRecycle } from './apps/recycle.js';

const DESKTOP_ITEMS = [
  { id: 'about',     label: 'README.txt',  icon: readmeIcon,   open: openAbout },
  { id: 'projects',  label: 'My Computer', icon: computerIcon, open: openProjects },
  { id: 'blog',      label: 'Blog',        icon: blogIcon,     open: openBlog },
  { id: 'terminal',  label: 'Terminal',    icon: terminalIcon, open: openTerminal },
  { id: 'recycle',   label: 'Recycle Bin', icon: recycleIcon,  open: openRecycle },
];

function renderDesktopIcons() {
  const desktop = document.getElementById('desktop');
  const wrap = document.createElement('div');
  wrap.className = 'desktop-icons';
  for (const item of DESKTOP_ITEMS) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'desktop-icon';
    el.setAttribute('data-app', item.id);
    el.innerHTML = `
      ${item.icon}
      <span class="label-bg">${item.label}</span>
    `;
    el.addEventListener('dblclick', () => item.open());
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') item.open(); });
    el.addEventListener('click', (e) => {
      document.querySelectorAll('.desktop-icon').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
      e.stopPropagation();
    });
    wrap.appendChild(el);
  }
  desktop.appendChild(wrap);

  desktop.addEventListener('click', () => {
    document.querySelectorAll('.desktop-icon').forEach(x => x.classList.remove('selected'));
    closeStartMenu();
  });
}

function renderStartMenu() {
  const menu = document.getElementById('start-menu');
  menu.innerHTML = `
    <div class="start-banner"><span><b>djcopley</b>95</span></div>
    <ul>
      ${DESKTOP_ITEMS.map(i => `<li data-app="${i.id}">${i.icon}<span>${i.label}</span></li>`).join('')}
      <li class="sep"></li>
      <li data-href="https://github.com/djcopley"><span>🌐</span><span>GitHub Profile</span></li>
    </ul>
  `;
  menu.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    const app = li.dataset.app;
    if (app) {
      const found = DESKTOP_ITEMS.find(i => i.id === app);
      if (found) found.open();
      closeStartMenu();
    } else if (li.dataset.href) {
      window.open(li.dataset.href, '_blank', 'noopener');
      closeStartMenu();
    }
  });
}

function openStartMenu() {
  document.getElementById('start-menu').classList.add('open');
  document.getElementById('start-btn').classList.add('pressed');
}
function closeStartMenu() {
  document.getElementById('start-menu').classList.remove('open');
  document.getElementById('start-btn').classList.remove('pressed');
}
function toggleStartMenu() {
  const open = document.getElementById('start-menu').classList.contains('open');
  if (open) closeStartMenu(); else openStartMenu();
}

function renderTaskbar() {
  const startBtn = document.getElementById('start-btn');
  startBtn.innerHTML = `${startIcon}<span>Start</span>`;
  startBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleStartMenu();
  });

  // Close start menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#start-menu') && !e.target.closest('#start-btn')) {
      closeStartMenu();
    }
  });

  const tray = document.getElementById('taskbar-tray');
  const updateClock = () => {
    const d = new Date();
    const h = d.getHours().toString().padStart(2, '0');
    const m = d.getMinutes().toString().padStart(2, '0');
    tray.textContent = `${h}:${m}`;
  };
  updateClock();
  setInterval(updateClock, 30 * 1000);

  const winsEl = document.getElementById('taskbar-windows');

  function rebuild() {
    winsEl.innerHTML = '';
    for (const w of wm.all()) {
      const tab = document.createElement('button');
      tab.type = 'button';
      tab.className = 'taskbar-window' + (w.focused && !w.minimized ? ' active' : '');
      tab.innerHTML = `${w.icon || ''}<span class="label">${w.title}</span>`;
      tab.addEventListener('click', () => {
        if (w.minimized) { w.restore(); w.focus(); }
        else if (w.focused) { w.minimize(); }
        else { w.focus(); }
        rebuild();
      });
      winsEl.appendChild(tab);
    }
  }

  wm.onChange(rebuild);
}

export function bootDesktop() {
  renderDesktopIcons();
  renderStartMenu();
  renderTaskbar();
  // Auto-open README on first visit per session
  if (!sessionStorage.getItem('booted')) {
    sessionStorage.setItem('booted', '1');
    setTimeout(() => openAbout(), 400);
  }
}

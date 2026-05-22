import { wm } from '../wm.js';
import { computerIcon, folderIcon } from '../icons.js';
import { fetchRepos } from '../github.js';

async function loadProjects() {
  const res = await fetch('data/projects.json');
  return res.json();
}

function fmtStars(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

export async function openProjects() {
  const win = wm.open({
    id: 'projects',
    title: 'My Computer - Projects',
    icon: computerIcon,
    content: `<div class="loading">Loading projects…</div>`,
    width: 540,
    height: 400,
    bodyClass: 'flush',
  });

  const projects = await loadProjects();
  const repos = await fetchRepos(projects.map(p => p.repo));

  const merged = projects.map((p, i) => ({ ...p, ...repos[i] }));

  const grid = document.createElement('div');
  grid.className = 'file-grid';
  for (const item of merged) {
    const el = document.createElement('div');
    el.className = 'file-item';
    el.tabIndex = 0;
    el.innerHTML = `
      <div>${folderIcon}</div>
      <span class="file-label">${item.repo}<br/><small style="color:#555">★ ${fmtStars(item.stars)}</small></span>
    `;
    el.addEventListener('dblclick', () => openProjectProps(item));
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter') openProjectProps(item); });
    el.addEventListener('click', () => {
      grid.querySelectorAll('.file-item').forEach(x => x.classList.remove('selected'));
      el.classList.add('selected');
    });
    grid.appendChild(el);
  }

  win.bodyEl.innerHTML = '';
  win.bodyEl.appendChild(grid);
  return win;
}

function openProjectProps(item) {
  const body = `
    <div class="project-props">
      <h2>${item.repo}</h2>
      <div class="meta">
        <span class="stars">★ ${fmtStars(item.stars)}</span>
        ${item.language ? `<span>· ${item.language}</span>` : ''}
        ${item.fromCache ? `<span style="color:#888">· cached</span>` : ''}
      </div>
      <p class="desc">${(item.description || item.blurb || '').replace(/</g, '&lt;')}</p>
      <p><a class="btn" style="display:inline-block;text-decoration:none" href="${item.url}" target="_blank" rel="noopener">Open on GitHub</a></p>
    </div>
  `;
  return wm.open({
    id: 'project-' + item.repo,
    title: item.repo + ' Properties',
    icon: folderIcon,
    content: body,
    width: 420,
    height: 260,
  });
}

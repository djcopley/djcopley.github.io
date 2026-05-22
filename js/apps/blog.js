import { wm } from '../wm.js';
import { blogIcon } from '../icons.js';
import { render as renderMd } from '../markdown.js';

async function loadIndex() {
  const res = await fetch('posts/index.json');
  return res.json();
}

async function loadPost(slug) {
  const res = await fetch(`posts/${slug}.md`);
  return res.text();
}

export async function openBlog() {
  const win = wm.open({
    id: 'blog',
    title: 'Blog',
    icon: blogIcon,
    content: `<div class="loading">Loading posts…</div>`,
    width: 480,
    height: 340,
    bodyClass: 'inset',
  });

  const posts = await loadIndex();
  const list = document.createElement('div');
  list.className = 'list-view';
  for (const p of posts) {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <span>📝</span>
      <span><strong>${p.title}</strong><br/><small style="color:#555">${p.summary || ''}</small></span>
      <span class="meta">${p.date}</span>
    `;
    item.addEventListener('click', () => {
      list.querySelectorAll('.list-item').forEach(x => x.classList.remove('selected'));
      item.classList.add('selected');
    });
    item.addEventListener('dblclick', () => openPost(p));
    list.appendChild(item);
  }
  win.bodyEl.innerHTML = '';
  win.bodyEl.appendChild(list);
  return win;
}

async function openPost(p) {
  const win = wm.open({
    id: 'post-' + p.slug,
    title: p.title + ' - Notepad',
    icon: blogIcon,
    content: `<div class="loading">Loading…</div>`,
    width: 640,
    height: 520,
    bodyClass: 'inset',
  });
  const md = await loadPost(p.slug);
  win.bodyEl.innerHTML = `<article class="post-body">${renderMd(md)}</article>`;
  return win;
}

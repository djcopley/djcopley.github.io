import { render as renderMd } from './markdown.js';
import { fetchRepos } from './github.js';

async function loadJson(url) { return (await fetch(url)).json(); }
async function loadText(url) { return (await fetch(url)).text(); }

function fmtStars(n) {
  if (n == null) return '—';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return String(n);
}

async function showPost(slug, title, date) {
  const md = await loadText(`posts/${slug}.md`);
  const root = document.getElementById('mobile');
  root.innerHTML = `
    <a href="#" class="m-back" id="m-back">‹ Back</a>
    <article class="m-post-body">${renderMd(md)}</article>
  `;
  document.getElementById('m-back').addEventListener('click', (e) => {
    e.preventDefault();
    history.back();
  });
  history.pushState({ post: slug }, '', '#' + slug);
}

export async function bootMobile() {
  const root = document.getElementById('mobile');
  root.style.display = 'block';
  root.innerHTML = `<div class="loading">Loading…</div>`;

  const [about, projectsConfig, posts] = await Promise.all([
    loadJson('data/about.json'),
    loadJson('data/projects.json'),
    loadJson('posts/index.json'),
  ]);

  const repos = await fetchRepos(projectsConfig.map(p => p.repo));
  const merged = projectsConfig.map((p, i) => ({ ...p, ...repos[i] }));

  root.innerHTML = `
    <header class="m-hero">
      <div class="avatar" style="background-image:url('assets/avatar.svg')"></div>
      <div>
        <h1>${about.name}</h1>
        <p>${about.headline}</p>
      </div>
    </header>

    <section class="m-section">
      <div class="m-section-title">About</div>
      <div class="m-section-body">
        ${about.bio.map(p => `<p style="margin:6px 0">${p}</p>`).join('')}
        <p style="margin-top:8px">${about.links.map(l => `<a href="${l.url}">${l.label}</a>`).join(' · ')}</p>
      </div>
    </section>

    <section class="m-section">
      <div class="m-section-title">Projects</div>
      <div class="m-section-body">
        <div class="m-projects">
          ${merged.map(p => `
            <a class="m-project" href="${p.url}" target="_blank" rel="noopener">
              <div class="head"><span class="name">${p.repo}</span><span class="stars">★ ${fmtStars(p.stars)}</span></div>
              <div class="desc">${(p.description || p.blurb || '').replace(/</g, '&lt;')}</div>
            </a>`).join('')}
        </div>
      </div>
    </section>

    <section class="m-section">
      <div class="m-section-title">Blog</div>
      <div class="m-section-body">
        <div class="m-posts">
          ${posts.map(p => `
            <a class="m-post" href="#${p.slug}" data-slug="${p.slug}">
              <div class="title">${p.title}</div>
              <div class="date">${p.date}</div>
              <div class="summary">${p.summary || ''}</div>
            </a>`).join('')}
        </div>
      </div>
    </section>
  `;

  document.querySelectorAll('.m-post').forEach(a => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const slug = a.dataset.slug;
      showPost(slug);
    });
  });

  window.addEventListener('popstate', () => {
    // re-render mobile root
    bootMobile();
  });
}

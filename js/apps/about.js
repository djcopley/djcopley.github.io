import { wm } from '../wm.js';
import { readmeIcon } from '../icons.js';

let aboutData = null;
async function loadAbout() {
  if (aboutData) return aboutData;
  const res = await fetch('data/about.json');
  aboutData = await res.json();
  return aboutData;
}

export async function openAbout() {
  const about = await loadAbout();
  const linkHtml = about.links
    .map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}</a>`)
    .join(' · ');
  const body = `
    <div class="about">
      <div class="avatar" style="background-image: url('assets/avatar.svg')"></div>
      <div>
        <h2>${about.name}</h2>
        <p><em>${about.headline}</em></p>
        ${about.bio.map(p => `<p style="margin-top:8px">${p}</p>`).join('')}
        <ul class="links" style="margin-top:12px">${linkHtml}</ul>
      </div>
    </div>
  `;
  return wm.open({
    id: 'about',
    title: 'README.txt - Notepad',
    icon: readmeIcon,
    content: body,
    width: 520,
    height: 360,
  });
}

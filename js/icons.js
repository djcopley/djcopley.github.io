// Inline SVG icons in chunky Win95 pixel style.
// Each export returns an SVG string sized 32x32 (scales fine for taskbar 14-16px).

const px = (rects) => rects.map(r => `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" fill="${r[4]}"/>`).join('');

export const readmeIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">
  <rect x="6" y="3" width="20" height="26" fill="#ffffff" stroke="#000" stroke-width="1"/>
  <rect x="6" y="3" width="20" height="3" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
  <rect x="9" y="9" width="14" height="1" fill="#000"/>
  <rect x="9" y="12" width="14" height="1" fill="#000"/>
  <rect x="9" y="15" width="14" height="1" fill="#000"/>
  <rect x="9" y="18" width="10" height="1" fill="#000"/>
  <rect x="9" y="21" width="14" height="1" fill="#000"/>
  <rect x="9" y="24" width="8" height="1" fill="#000"/>
  <polygon points="20,3 26,3 26,9" fill="#808080"/>
  <polygon points="20,3 20,9 26,9" fill="#ffffff"/>
  <rect x="20" y="9" width="6" height="1" fill="#000"/>
  <rect x="20" y="3" width="1" height="6" fill="#000"/>
</svg>`;

export const folderIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">
  <path d="M3 9 h8 l2 2 h16 v17 H3 z" fill="#ffcc66" stroke="#000" stroke-width="1"/>
  <path d="M3 9 h8 l2 2 h16 v2 H3 z" fill="#ffeeaa" stroke="#000" stroke-width="1"/>
</svg>`;

export const computerIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">
  <rect x="3" y="4" width="26" height="18" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
  <rect x="5" y="6" width="22" height="13" fill="#0a4d75"/>
  <rect x="6" y="7" width="20" height="11" fill="#338cb3"/>
  <rect x="3" y="22" width="26" height="4" fill="#a0a0a0" stroke="#000" stroke-width="1"/>
  <rect x="12" y="26" width="8" height="3" fill="#808080" stroke="#000" stroke-width="1"/>
  <rect x="8" y="29" width="16" height="1" fill="#000"/>
</svg>`;

export const blogIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">
  <rect x="5" y="4" width="22" height="24" fill="#ffffff" stroke="#000" stroke-width="1"/>
  <rect x="5" y="4" width="22" height="4" fill="#000080"/>
  <rect x="8" y="11" width="16" height="1" fill="#000"/>
  <rect x="8" y="14" width="16" height="1" fill="#000"/>
  <rect x="8" y="17" width="16" height="1" fill="#000"/>
  <rect x="8" y="20" width="11" height="1" fill="#000"/>
  <polygon points="22,22 28,26 24,26 22,28" fill="#c0c0c0" stroke="#000" stroke-width="1"/>
</svg>`;

export const terminalIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">
  <rect x="3" y="5" width="26" height="22" fill="#000" stroke="#000" stroke-width="1"/>
  <rect x="3" y="5" width="26" height="3" fill="#c0c0c0"/>
  <text x="6" y="20" fill="#fff" font-family="Consolas, monospace" font-size="10">&gt;_</text>
</svg>`;

export const recycleIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">
  <rect x="7" y="6" width="18" height="4" fill="#808080" stroke="#000" stroke-width="1"/>
  <path d="M9 10 h14 l-2 18 h-10 z" fill="#a0a0a0" stroke="#000" stroke-width="1"/>
  <rect x="12" y="13" width="1" height="13" fill="#000"/>
  <rect x="16" y="13" width="1" height="13" fill="#000"/>
  <rect x="20" y="13" width="1" height="13" fill="#000"/>
</svg>`;

export const startIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32" shape-rendering="crispEdges">
  <rect x="3"  y="3"  width="12" height="12" fill="#ff0000"/>
  <rect x="17" y="3"  width="12" height="12" fill="#00ff00"/>
  <rect x="3"  y="17" width="12" height="12" fill="#0000ff"/>
  <rect x="17" y="17" width="12" height="12" fill="#ffff00"/>
</svg>`;

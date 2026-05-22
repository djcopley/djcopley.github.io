// Markdown rendering. Uses globally-loaded `marked` from CDN; falls back to
// a very tiny renderer if marked is unavailable.

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function tinyMarkdown(md) {
  const lines = md.split('\n');
  const out = [];
  let inCode = false;
  let para = [];
  const flush = () => { if (para.length) { out.push('<p>' + para.join(' ') + '</p>'); para = []; } };

  for (const raw of lines) {
    if (raw.startsWith('```')) {
      flush();
      if (inCode) { out.push('</code></pre>'); inCode = false; }
      else { out.push('<pre><code>'); inCode = true; }
      continue;
    }
    if (inCode) { out.push(escapeHtml(raw)); continue; }
    if (/^#\s+/.test(raw)) { flush(); out.push('<h1>' + escapeHtml(raw.replace(/^#\s+/, '')) + '</h1>'); continue; }
    if (/^##\s+/.test(raw)) { flush(); out.push('<h2>' + escapeHtml(raw.replace(/^##\s+/, '')) + '</h2>'); continue; }
    if (/^###\s+/.test(raw)) { flush(); out.push('<h3>' + escapeHtml(raw.replace(/^###\s+/, '')) + '</h3>'); continue; }
    if (/^-\s+/.test(raw)) { flush(); out.push('<li>' + inline(escapeHtml(raw.replace(/^-\s+/, ''))) + '</li>'); continue; }
    if (raw.trim() === '') { flush(); continue; }
    para.push(inline(escapeHtml(raw)));
  }
  flush();
  if (inCode) out.push('</code></pre>');
  return out.join('\n');
}

function inline(s) {
  return s
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|\s)\*([^*]+)\*/g, '$1<em>$2</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

export function render(md) {
  if (window.marked && typeof window.marked.parse === 'function') {
    try { return window.marked.parse(md, { breaks: false, gfm: true }); } catch (_) {}
  }
  return tinyMarkdown(md);
}

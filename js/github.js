// GitHub repo data with localStorage cache (1 hour TTL).

const TTL_MS = 60 * 60 * 1000;
const USER = 'djcopley';

function cacheKey(repo) { return `gh:${USER}/${repo}`; }

function readCache(repo) {
  try {
    const raw = localStorage.getItem(cacheKey(repo));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (_) { return null; }
}

function writeCache(repo, data) {
  try { localStorage.setItem(cacheKey(repo), JSON.stringify(data)); } catch (_) {}
}

export async function fetchRepo(repo) {
  const cached = readCache(repo);
  const now = Date.now();
  if (cached && cached.fetchedAt && (now - cached.fetchedAt) < TTL_MS) {
    return { ...cached, fromCache: true };
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${USER}/${repo}`);
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const j = await res.json();
    const data = {
      name: j.name,
      description: j.description || '',
      stars: j.stargazers_count ?? 0,
      forks: j.forks_count ?? 0,
      language: j.language || '',
      url: j.html_url,
      updatedAt: j.updated_at,
      fetchedAt: Date.now(),
    };
    writeCache(repo, data);
    return { ...data, fromCache: false };
  } catch (err) {
    // Fall back to (possibly stale) cache or a stub.
    if (cached) return { ...cached, fromCache: true, stale: true };
    return {
      name: repo,
      description: '',
      stars: null,
      forks: null,
      language: '',
      url: `https://github.com/${USER}/${repo}`,
      updatedAt: null,
      fetchedAt: null,
      error: String(err.message || err),
    };
  }
}

export async function fetchRepos(repoNames) {
  return Promise.all(repoNames.map(fetchRepo));
}

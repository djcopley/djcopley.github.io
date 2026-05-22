# Personal Site as a Retro OS Desktop

**Date:** 2026-05-21
**Owner:** Daniel Copley
**Domain:** daniel.copley.dev
**Status:** Approved (auto-mode, /goal-driven)

## Goal

Replace the current Jekyll site at `daniel.copley.dev` with a from-scratch
static site themed as a Windows 95/98 desktop. The site has one blog post and a
project showcase whose star counts update live from the GitHub API without
requiring a rebuild. Site is hosted on GitHub Pages from the repo root.

## Non-goals

- Window snapping, multi-desktop, full file-system simulation.
- Tag/category systems for the blog.
- Comments, analytics, RSS, PWA.
- A build step or framework — must run with zero tooling locally.

## User experience

### Desktop (≥ 769 px)

1. Page loads to a desktop wallpaper (Win95 teal `#008080`) with a row of
   left-aligned icons: **README.txt**, **My Computer**, **Blog**, **Terminal**,
   **Recycle Bin**.
2. A taskbar pinned to the bottom holds a **Start** button, a tray of open
   windows, and a live clock.
3. README.txt auto-opens once per session on first load.
4. Icons open windows on double-click (desktop) or single tap (mobile-ish
   tablet). Windows can be dragged by the title bar, resized from the
   bottom-right grip, minimized to the taskbar, maximized, or closed.
5. Z-order updates on window focus.
6. Pressing `Esc` closes the focused window.

### Mobile (≤ 768 px)

No window manager. Page renders as a stacked single-column layout that reuses
the same data sources and Win95 visual primitives (chunky beveled borders,
system font, button styles) but presents content as sections: hero → about →
projects → blog. Tapping a project opens its GitHub link in a new tab. Tapping
a blog post navigates to a full-page post view.

### Apps (windows)

| Window         | Purpose                                                    |
|----------------|------------------------------------------------------------|
| README.txt     | About me, photo/avatar, contact links.                     |
| My Computer    | Folder window listing pinned projects; each has icon + name + live star count. |
| Project props  | Sub-window opened from a project icon: description, stars, language, "Open on GitHub" button. |
| Blog           | List of posts (one). Click to open a Notepad-styled post window. |
| Terminal.exe   | Toy shell: `help`, `whoami`, `ls`, `cat README`, `clear`, `sudo make me a sandwich`. |
| Recycle Bin    | Empty window for vibes.                                    |

## Architecture

### Stack

- Plain HTML, CSS, vanilla JS (ES modules). No bundler. No framework.
- One CDN script: `marked` for Markdown rendering in the Blog app.
- Hosted on GitHub Pages from the repo root. `.nojekyll` disables Jekyll.

### File layout

```
index.html              # desktop shell, loads modules
404.html                # styled 404 inside a Win95 window
CNAME                   # daniel.copley.dev (kept)
.nojekyll               # disable Jekyll on Pages
favicon.ico             # kept

css/
  reset.css
  win95.css             # window chrome, buttons, scrollbars, form controls
  desktop.css           # desktop, icons, taskbar, start menu
  mobile.css            # stacked layout @media (max-width: 768px)

js/
  main.js               # entry: viewport check → boot desktop or mobile
  wm.js                 # window manager (create, focus, drag, resize, close)
  desktop.js            # desktop icons, taskbar, start menu, clock
  mobile.js             # stacked mobile layout renderer
  github.js             # fetch + cache repo data
  markdown.js           # marked wrapper, sanitizes & renders
  apps/
    about.js
    projects.js
    blog.js
    terminal.js
    recycle.js

data/
  projects.json         # curated list of repos to feature
  about.json            # bio strings, links, headline

posts/
  2026-05-21-hello.md   # the one blog post
  index.json            # [{ slug, title, date, summary }]

assets/
  avatar.png            # placeholder until user supplies real
  icons/
    folder.png
    readme.png
    blog.png
    terminal.png
    recycle.png
    computer.png
    start.png
```

### Window manager (`js/wm.js`)

Tiny module with one exported factory: `createWindow({ id, title, icon, content, width, height, x, y })`.

- Maintains a `Map<id, WindowState>` and a z-order array.
- Creates a DOM element with title bar (icon + title + min/max/close buttons)
  and a body slot. Inserts into `#desktop`.
- Drag handler: `pointerdown` on title bar → track pointer deltas → update
  `style.left/top`. Snaps to viewport bounds.
- Resize handler: bottom-right grip uses same pointer logic on width/height.
- Focus: clicking anywhere in a window raises it (z-index bump) and updates the
  active-window state.
- Public methods: `open()`, `close()`, `minimize()`, `restore()`, `focus()`.
- Emits events (`window:open`, `window:close`, `window:focus`) for desktop.js
  to update the taskbar.

### GitHub data (`js/github.js`)

```
fetchRepo(name) -> Promise<{ name, description, stars, language, url, fetchedAt }>
```

- Looks up `localStorage[`gh:${name}`]`. If present and < 1 h old, returns it.
- Otherwise `fetch("https://api.github.com/repos/djcopley/" + name)`, maps the
  response, writes back to cache, returns.
- On HTTP error or network error: returns stale cache if any, else
  `{ stars: null, description: null, ... }`. UI shows "—" for unknown stars.
- All repo fetches in projects.js are issued in parallel with `Promise.all`.

### Projects list

`data/projects.json` is the source of truth for what shows in My Computer:

```json
[
  { "repo": "claude-coverage", "blurb": "..." },
  { "repo": "another-repo", "blurb": "..." }
]
```

Order in the file is order in the window. To feature new work the user edits
this file and commits. Stars never need a commit — they refresh client-side.

### Blog

- `posts/index.json` lists post metadata for the Blog window's list view.
- Post bodies are Markdown in `posts/*.md`. The Blog app fetches the markdown,
  pipes through `marked` configured for safety (no raw HTML), and renders into
  a Notepad-styled window body.
- One post for now: `posts/2026-05-21-hello.md` — a brief "new site, here's
  who I am" intro.

### Mobile renderer

`js/mobile.js` runs when `window.innerWidth <= 768`. It builds the same
content from the same data files but inserts plain semantic HTML
(`<header>`, `<section>`, `<article>`) into the page body. No window manager
loads at all on mobile, so the JS payload stays small. CSS in `mobile.css`
gives it Win95-flavored visuals without the chrome.

## Hosting

- GitHub Pages, Branch = `main`, Folder = `/`.
- `CNAME` keeps custom domain.
- `.nojekyll` so files aren't processed by Jekyll.
- No build, no Actions needed.

## Migration

Remove from the repo:

- `_config.yml`, `_data/`, `_includes/`, `_layouts/`, `_posts/`, `_sass/`
- `Gemfile`, `Gemfile.lock` (if present)
- `assets/styles.scss`, `test.js`
- `index.html` (replaced)

Keep: `CNAME`, `LICENSE.txt`, `.gitignore`, `favicon.ico`.

Add: `.nojekyll`.

## Testing (manual)

- Boot: desktop renders, README opens by default once.
- Each app opens, closes, drags, resizes, focuses. Two open windows update
  taskbar; close one — taskbar updates.
- Start menu opens, clicking outside closes it.
- Projects window: first open shows stars from network; refresh page within
  1 h shows stars from cache (verify via DevTools network panel showing no
  GitHub request).
- Disable network → Projects window still renders with cached or "—" values
  and does not throw.
- Esc closes focused window.
- Resize browser to 600 px width → page reloads as stacked mobile layout (or
  switches without reload — TBD acceptable either way).
- Lighthouse: no console errors; keyboard navigates between windows; color
  contrast adequate.

## Risks / open questions

- **GitHub rate limit (60/hr unauth, per IP)**: with up to 9 pinned repos per
  visit and 1 h cache, a single visitor uses 9 requests then 0 for the next
  hour. Comfortable for personal-site traffic.
- **Mobile detection edge cases**: rotating tablets across the 768 px
  threshold currently requires a refresh to switch modes. Acceptable.
- **Marked CDN availability**: if the CDN is down, Blog post renders raw
  Markdown. Acceptable degradation; could vendor the library later.

## Out of scope (post-launch ideas)

- Add a guestbook app (would need a backend or third-party service).
- Snake / Solitaire as additional apps.
- Boot animation / startup sound (would need user gesture to play audio).
- Service-worker offline cache.

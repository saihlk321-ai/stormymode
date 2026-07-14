/* ============================================================
   Waypoint — a story writing & reading PWA
   Data lives entirely in IndexedDB, one record per story, so
   each story is an independent unit that can also be exported
   to its own .json file on request.
   ============================================================ */

/* ---------- tiny icon set (inline SVG strings) ---------- */
const ICON = {
  back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>`,
  people: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6"/><circle cx="17" cy="9" r="2.4"/><path d="M15.5 14.2c2.4.4 4.5 2.4 4.5 5.8"/></svg>`,
  map: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4L3 6.5v14L9 18l6 2.5 6-2.5v-14L15 6.5 9 4z"/><path d="M9 4v14M15 6.5v14"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13M7 11l5 5 5-5M4 20h16"/></svg>`,
  upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V7M7 12l5-5 5 5M4 20h16"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0l-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7"/></svg>`,
  chevronL: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 6l-6 6 6 6"/></svg>`,
  chevronR: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 6l6 6-6 6"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`,
  book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5C4 4.7 4.7 4 5.5 4H12v16H5.5A1.5 1.5 0 014 18.5v-13z"/><path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H12v16h6.5A1.5 1.5 0 0020 18.5v-13z"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12h2.5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8.5 8.5 0 119.5 4a7 7 0 0010.5 10.5z"/></svg>`,
  move: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v18M3 12h18M6 7l-3 5 3 5M18 7l3 5-3 5M7 6l5-3 5 3M7 18l5 3 5-3"/></svg>`,
  link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8.2 8.2l7.6 7.6"/></svg>`,
  minus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/></svg>`,
  frame: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>`,
  chevronDown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>`,
  wand: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20L15 9"/><path d="M17 3l.9 1.9L20 5.8l-2.1.9L17 8.6l-.9-1.9L14 5.8l2.1-.9L17 3z"/><path d="M18.5 13.5l.6 1.3 1.3.6-1.3.6-.6 1.3-.6-1.3-1.3-.6 1.3-.6.6-1.3z"/></svg>`,
  branch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="5" r="2.3"/><circle cx="6" cy="19" r="2.3"/><circle cx="18" cy="12" r="2.3"/><path d="M6 7.3V16.7M6 10c0 3 3 2 5.5 2H14"/></svg>`,
  image: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="M20 15.5l-5-4.5-3.5 3-2-1.5L4 16"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3"/><path d="M18 3v4.5h-4.5M6 21v-4.5h4.5"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="9" rx="2"/><path d="M8 10.5V7a4 4 0 018 0v3.5"/></svg>`,
  unlock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="10.5" width="14" height="9" rx="2"/><path d="M8 10.5V7a4 4 0 017.8-1.5"/></svg>`,
};

/* ---------- utils ---------- */
const uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
const escapeHtml = (s) => (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
function slugify(name, existingIds) {
  let base = (name || "char").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 16) || "char";
  let id = base, n = 2;
  while (existingIds.includes(id)) id = base + n++;
  return id;
}
function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function wordCount(story) {
  return (story.chapters || []).reduce((sum, c) => sum + (c.text || "").trim().split(/\s+/).filter(Boolean).length, 0);
}
function tokenRegex() { return /\{\{([^{}]+)\}\}/g; }
function resolveCharacterToken(raw, chars) {
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  return chars.find((c) => c.id.toLowerCase() === key) ||
         chars.find((c) => (c.name || "").trim().toLowerCase() === key) ||
         null;
}
function resolveMediaToken(raw, story) {
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  const slots = story.media || [];
  const slot = slots.find((m) => m.id.toLowerCase() === key) ||
               slots.find((m) => (m.name || "").trim().toLowerCase() === key);
  if (!slot || !slot.libraryImageId) return null;
  return libraryCache.find((img) => img.id === slot.libraryImageId) || null;
}
function renderTokensHTML(text, story) {
  const chars = story.characters || [];
  const src = text || "";
  const re = tokenRegex();
  let out = "", lastIndex = 0, m;
  while ((m = re.exec(src))) {
    out += escapeHtml(src.slice(lastIndex, m.index));
    const raw = m[1];
    if (/^img:/i.test(raw.trim())) {
      const item = storyCanUseLibrary(story) ? resolveMediaToken(raw.trim().slice(4), story) : null;
      out += item
        ? `<span class="reader-image-block"><img class="reader-image" src="${item.dataUrl}" alt="${escapeHtml(item.name)}" loading="lazy"></span>`
        : "";
    } else {
      const c = resolveCharacterToken(raw, chars);
      out += c ? `<span class="reader-token">${escapeHtml(c.name)}</span>` : `<span class="reader-token">[deleted]</span>`;
    }
    lastIndex = re.lastIndex;
  }
  out += escapeHtml(src.slice(lastIndex));
  return out;
}

/* ---------- IndexedDB ---------- */
const DB_NAME = "waypoint-db", DB_VERSION = 2, STORE = "stories", LIBRARY_STORE = "library";
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      if (!db.objectStoreNames.contains(LIBRARY_STORE)) db.createObjectStore(LIBRARY_STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbGetAll(store = STORE) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
async function dbGet(id, store = STORE) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(store, "readonly").objectStore(store).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
async function dbPut(record, store = STORE) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function dbDelete(id, store = STORE) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ---------- shared image library (used across every story) ---------- */
let libraryCache = [];
async function refreshLibraryCache() {
  libraryCache = (await dbGetAll(LIBRARY_STORE)).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return libraryCache;
}
async function libraryPut(item) { await dbPut(item, LIBRARY_STORE); await refreshLibraryCache(); }
async function libraryDelete(id) { await dbDelete(id, LIBRARY_STORE); await refreshLibraryCache(); }

/* ---------- model factories ---------- */
function makeChapter(title, x, y) {
  return { id: uid(), title: title || "Untitled chapter", text: "", x, y, choices: [], collapsed: false };
}
function makeStory(title, type) {
  const now = Date.now();
  const ch = makeChapter(type === "cyoa" ? "The Beginning" : "Chapter 1", 120, 220);
  return {
    id: uid(),
    title: title || "Untitled story",
    type: type === "cyoa" ? "cyoa" : "linear",
    createdAt: now,
    updatedAt: now,
    lastReadChapterId: ch.id,
    characters: [],
    media: [],
    chapters: [ch],
  };
}

/* ---------- app state ---------- */
const state = { current: null, drawerOpen: false, drawerTab: "characters", drawerStandalone: false, saveTimer: null, unlocked: false };
const app = document.getElementById("app");
let readerHistory = [];

/* the shared image library is a privacy-adjacent feature: by default only
   locked (hidden) stories may use it, unless the "accessible to all" switch
   is turned on from the privacy area */
function libraryAccessibleToAll() {
  return localStorage.getItem("waypoint-library-accessible-to-all") === "1";
}
function storyCanUseLibrary(story) {
  return !!(story && story.hidden) || libraryAccessibleToAll();
}

/* ---------- theme (light / dark) ---------- */
function currentTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try { localStorage.setItem("waypoint-theme", theme); } catch (e) {}
}
function toggleTheme() {
  applyTheme(currentTheme() === "dark" ? "light" : "dark");
  document.querySelectorAll(".theme-toggle").forEach(paintThemeButton);
}
function paintThemeButton(btn) {
  btn.innerHTML = currentTheme() === "dark" ? ICON.sun : ICON.moon;
  btn.title = currentTheme() === "dark" ? "Switch to light mode" : "Switch to dark mode";
}
function wireThemeButton(btn) {
  if (!btn) return;
  btn.classList.add("theme-toggle");
  paintThemeButton(btn);
  btn.onclick = toggleTheme;
}

/* ---------- text size (applies to reading and editing text) ---------- */
const TEXT_SCALES = [0.85, 0.92, 1, 1.1, 1.22, 1.36, 1.5];
function currentTextScale() {
  const v = parseFloat(localStorage.getItem("waypoint-text-scale"));
  return TEXT_SCALES.includes(v) ? v : 1;
}
function applyTextScale(scale) {
  document.documentElement.style.setProperty("--text-scale", scale);
  try { localStorage.setItem("waypoint-text-scale", scale); } catch (e) {}
}
function stepTextScale(dir) {
  const cur = currentTextScale();
  let idx = TEXT_SCALES.indexOf(cur);
  if (idx === -1) idx = TEXT_SCALES.indexOf(1);
  idx = clamp(idx + dir, 0, TEXT_SCALES.length - 1);
  applyTextScale(TEXT_SCALES[idx]);
}
function toggleTextSizeMenu(anchorBtn) {
  const existing = document.querySelector(".textsize-pop");
  if (existing) { existing.remove(); document.removeEventListener("pointerdown", outsideTextSizeHandler); return; }
  const pop = document.createElement("div");
  pop.className = "textsize-pop";
  pop.innerHTML = `
    <button id="tsMinus" title="Smaller text">A−</button>
    <span id="tsLabel">${Math.round(currentTextScale() * 100)}%</span>
    <button id="tsPlus" title="Larger text">A+</button>`;
  document.body.appendChild(pop);
  const rect = anchorBtn.getBoundingClientRect();
  pop.style.top = (rect.bottom + 8) + "px";
  pop.style.right = (window.innerWidth - rect.right) + "px";
  const label = pop.querySelector("#tsLabel");
  pop.querySelector("#tsMinus").onclick = () => { stepTextScale(-1); label.textContent = Math.round(currentTextScale() * 100) + "%"; };
  pop.querySelector("#tsPlus").onclick = () => { stepTextScale(1); label.textContent = Math.round(currentTextScale() * 100) + "%"; };
  setTimeout(() => document.addEventListener("pointerdown", outsideTextSizeHandler), 0);
}
function outsideTextSizeHandler(e) {
  const pop = document.querySelector(".textsize-pop");
  if (pop && !pop.contains(e.target) && e.target.id !== "btnTextSize") {
    pop.remove();
    document.removeEventListener("pointerdown", outsideTextSizeHandler);
  }
}

/* ---------- checking for app updates ---------- */
function showUpdateBanner() {
  if (document.querySelector(".update-banner")) return;
  const bar = document.createElement("div");
  bar.className = "update-banner";
  bar.innerHTML = `<span>${ICON.refresh} A new version is ready.</span><button id="updateReloadBtn">Reload</button>`;
  document.body.appendChild(bar);
  document.getElementById("updateReloadBtn").onclick = () => location.reload();
}
async function checkForUpdates() {
  if (!("serviceWorker" in navigator)) { toast("This browser doesn't support updates"); return; }
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) { toast("Nothing installed yet to update"); return; }
  toast("Checking for updates…");
  try {
    await reg.update();
  } catch (e) {
    toast("Couldn't check — check your connection");
    return;
  }
  setTimeout(() => {
    if (!reg.installing && !reg.waiting && !document.querySelector(".update-banner")) {
      toast("You're on the latest version");
    }
  }, 1500);
}

function toast(msg) {
  let el = document.querySelector(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; document.body.appendChild(el); }
  el.textContent = msg;
  el.classList.add("toast--show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("toast--show"), 1800);
}

const scheduleSave = debounce(async () => {
  if (!state.current) return;
  state.current.updatedAt = Date.now();
  await dbPut(state.current);
  const ind = document.querySelector(".save-indicator");
  if (ind) { ind.innerHTML = `<i></i>`; ind.title = "saved"; }
}, 450);

function markDirty() {
  const ind = document.querySelector(".save-indicator");
  if (ind) { ind.innerHTML = `<i style="background:var(--gold)"></i>`; ind.title = "saving…"; }
  scheduleSave();
}

/* ---------- router ---------- */
function parseHash() {
  const h = location.hash.replace(/^#\/?/, "");
  const [pathPart, queryPart] = h.split("?");
  const parts = pathPart.split("/").filter(Boolean);
  const q = Object.fromEntries(new URLSearchParams(queryPart || ""));
  if (parts[0] === "story" && parts[1]) {
    return { view: parts[2] || "edit", storyId: parts[1], chapterId: q.chapter || null, mode: q.mode || null };
  }
  return { view: "library" };
}
function navigate(hash) { location.hash = hash; }
window.addEventListener("hashchange", route);

async function route() {
  const r = parseHash();
  state.drawerOpen = false;
  if (r.view === "library") { state.current = null; return renderLibrary(); }

  if (!state.current || state.current.id !== r.storyId) {
    const s = await dbGet(r.storyId);
    if (!s) { navigate("#/"); return; }
    if (s.hidden && !state.unlocked) { navigate("#/"); return; }
    normalizeStory(s);
    await migrateStoryMediaToLibrary(s);
    state.current = s;
    readerHistory = [];
  }
  if (r.view === "edit") return renderEditor(r.chapterId);
  if (r.view === "read") return renderReader(r.chapterId);
  if (r.view === "map") return renderMap(r.mode || "read");
  renderLibrary();
}

function normalizeStory(s) {
  s.characters = s.characters || [];
  s.media = s.media || [];
  s.hidden = !!s.hidden;
  s.chapters = s.chapters || [];
  s.chapters.forEach((c, i) => {
    if (typeof c.x !== "number") c.x = 120 + (i % 4) * 150;
    if (typeof c.y !== "number") c.y = 120 + Math.floor(i / 4) * 150;
    c.choices = c.choices || [];
    c.collapsed = !!c.collapsed;
  });
}

/* older stories embedded each image's data URL directly on the slot; move
   that data into the shared library once, and leave the slot pointing at it */
async function migrateStoryMediaToLibrary(s) {
  let changed = false;
  for (const slot of s.media) {
    if (slot.dataUrl && !slot.libraryImageId) {
      const libItem = { id: uid(), name: slot.name || "Imported image", dataUrl: slot.dataUrl, createdAt: Date.now() };
      await libraryPut(libItem);
      slot.libraryImageId = libItem.id;
      delete slot.dataUrl;
      changed = true;
    }
  }
  if (changed) await dbPut(s);
}

/* ================= LIBRARY ================= */
async function renderLibrary() {
  const all = (await dbGetAll()).sort((a, b) => b.updatedAt - a.updatedAt);
  const stories = state.unlocked ? all : all.filter((s) => !s.hidden);
  const lockSetUp = !!localStorage.getItem("waypoint-lock-hash");
  app.innerHTML = `
    <div class="topbar">
      <div class="topbar__title" id="libTitle">Waypoint</div>
      <div class="topbar__actions">
        <button class="topbar__icon-btn" id="btnTheme" title="Toggle theme"></button>
        <button class="topbar__icon-btn" id="btnCheckUpdates" title="Check for updates">${ICON.refresh}</button>
        <button class="topbar__icon-btn" id="btnImport" title="Import story">${ICON.upload}</button>
      </div>
    </div>
    <div class="library">
      ${stories.length === 0 ? `
        <div class="library__empty">
          <h2>No stories yet</h2>
          <p>Write a straight-through story, or a choose-your-own-adventure with branching chapters.</p>
        </div>` : `
        <div class="storygrid">
          ${stories.map((s) => storyCardHTML(s, lockSetUp)).join("")}
        </div>`}
    </div>
    <div class="fab-row">
      <button class="btn btn--primary btn--block" id="btnNew">${ICON.plus} New story</button>
    </div>
    <input type="file" id="importFile" accept="application/json" style="display:none">
  `;
  document.getElementById("btnNew").onclick = () => openNewStoryModal();
  wireThemeButton(document.getElementById("btnTheme"));
  document.getElementById("btnCheckUpdates").onclick = checkForUpdates;
  document.getElementById("btnImport").onclick = () => document.getElementById("importFile").click();
  document.getElementById("importFile").onchange = handleImportFile;
  document.getElementById("libTitle").addEventListener("click", handleTitleTap);
  app.querySelectorAll("[data-open]").forEach((el) => el.addEventListener("click", () => navigate(`#/story/${el.dataset.open}/read`)));
  app.querySelectorAll("[data-editcard]").forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); navigate(`#/story/${el.dataset.editcard}/edit`); }));
  app.querySelectorAll("[data-export]").forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); exportStoryById(el.dataset.export); }));
  app.querySelectorAll("[data-delete]").forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); deleteStoryCard(el.dataset.delete); }));
  app.querySelectorAll("[data-lock]").forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); toggleStoryLock(el.dataset.lock); }));
}

function storyCardHTML(s, lockSetUp) {
  const words = wordCount(s);
  return `
    <div class="storycard storycard--${s.type}" data-open="${s.id}">
      <div class="storycard__badge">${s.type === "cyoa" ? "Choose your adventure" : "Story"} · ${s.chapters.length} ch</div>
      <div class="storycard__title">${escapeHtml(s.title)}${s.hidden ? ` <span class="storycard__lockbadge" title="Locked">${ICON.lock}</span>` : ""}</div>
      <div class="storycard__meta"><span>${words} words</span><span>${formatDate(s.updatedAt)}</span></div>
      <div class="storycard__actions">
        <button class="btn btn--sm" data-editcard="${s.id}">Edit</button>
        <button class="btn btn--sm btn--ghost" data-export="${s.id}" title="Export as file">${ICON.download}</button>
        ${lockSetUp ? `<button class="btn btn--sm btn--ghost" data-lock="${s.id}" title="${s.hidden ? "Unlock" : "Lock"} this story">${s.hidden ? ICON.unlock : ICON.lock}</button>` : ""}
        <button class="btn btn--sm btn--ghost" data-delete="${s.id}" title="Delete">${ICON.trash}</button>
      </div>
    </div>`;
}

/* ---- privacy lock: tap the title 5 times to reach the passcode panel ---- */
let titleTapCount = 0, titleTapTimer = null;
function handleTitleTap() {
  titleTapCount++;
  clearTimeout(titleTapTimer);
  titleTapTimer = setTimeout(() => { titleTapCount = 0; }, 1800);
  if (titleTapCount >= 5) {
    titleTapCount = 0;
    openPrivacyModal();
  }
}
async function toggleStoryLock(id) {
  const s = await dbGet(id);
  if (!s) return;
  s.hidden = !s.hidden;
  await dbPut(s);
  toast(s.hidden ? "Story locked — hidden until you unlock" : "Story unlocked and visible");
  renderLibrary();
}
async function sha256Hex(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function openPrivacyModal() {
  const hasPasscode = !!localStorage.getItem("waypoint-lock-hash");
  const scrim = document.createElement("div");
  scrim.className = "modal-scrim";
  scrim.addEventListener("click", (e) => { if (e.target === scrim) scrim.remove(); });

  if (!hasPasscode) {
    scrim.innerHTML = `
      <div class="modal">
        <h3>${ICON.lock} Set up a privacy passcode</h3>
        <p class="hint">Stories you lock disappear from the library for anyone who doesn't enter this passcode. Nothing on screen hints there's anything hidden.</p>
        <input type="password" id="pc1" placeholder="Choose a passcode" autocomplete="off">
        <input type="password" id="pc2" placeholder="Confirm passcode" autocomplete="off">
        <div class="modal-actions">
          <button class="btn" id="pcCancel">Cancel</button>
          <button class="btn btn--primary" id="pcSave">Set passcode</button>
        </div>
      </div>`;
    document.body.appendChild(scrim);
    scrim.querySelector("#pcCancel").onclick = () => scrim.remove();
    scrim.querySelector("#pcSave").onclick = async () => {
      const p1 = scrim.querySelector("#pc1").value, p2 = scrim.querySelector("#pc2").value;
      if (!p1 || p1.length < 4) { alert("Use at least 4 characters."); return; }
      if (p1 !== p2) { alert("Those don't match."); return; }
      localStorage.setItem("waypoint-lock-hash", await sha256Hex(p1));
      state.unlocked = true;
      scrim.remove();
      toast("Passcode set — lock any story from its card");
      renderLibrary();
    };
    return;
  }

  if (!state.unlocked) {
    scrim.innerHTML = `
      <div class="modal">
        <h3>${ICON.lock} Enter passcode</h3>
        <p class="hint">Unlock to see and manage your locked stories.</p>
        <input type="password" id="pcEnter" placeholder="Passcode" autocomplete="off">
        <div class="modal-actions">
          <button class="btn" id="pcCancel">Cancel</button>
          <button class="btn btn--primary" id="pcUnlock">Unlock</button>
        </div>
      </div>`;
    document.body.appendChild(scrim);
    scrim.querySelector("#pcCancel").onclick = () => scrim.remove();
    const tryUnlock = async () => {
      const val = scrim.querySelector("#pcEnter").value;
      const hash = await sha256Hex(val);
      if (hash === localStorage.getItem("waypoint-lock-hash")) {
        state.unlocked = true;
        scrim.remove();
        toast("Unlocked");
        renderLibrary();
      } else {
        toast("Incorrect passcode");
      }
    };
    scrim.querySelector("#pcUnlock").onclick = tryUnlock;
    scrim.querySelector("#pcEnter").addEventListener("keydown", (e) => { if (e.key === "Enter") tryUnlock(); });
    return;
  }

  const hiddenCount = (await dbGetAll()).filter((s) => s.hidden).length;
  scrim.innerHTML = `
    <div class="modal">
      <h3>${ICON.unlock} Privacy lock</h3>
      <p class="hint">${hiddenCount} ${hiddenCount === 1 ? "story is" : "stories are"} currently locked. Toggle the lock icon on any story card to lock or unlock it.</p>

      <button class="btn btn--block" id="pcOpenLibrary">${ICON.book} Manage image library</button>
      <label class="toggle-row">
        <input type="checkbox" id="pcLibToggle" ${libraryAccessibleToAll() ? "checked" : ""}>
        <span>Make the image library available to every story, not just locked ones</span>
      </label>

      <div class="modal-actions">
        <button class="btn" id="pcChangeCode">Change passcode</button>
        <button class="btn btn--primary" id="pcLockNow">Lock now</button>
      </div>
      <div class="modal-actions">
        <button class="btn btn--danger btn--block" id="pcTurnOff">Turn off privacy lock</button>
      </div>
    </div>`;
  document.body.appendChild(scrim);
  scrim.querySelector("#pcOpenLibrary").onclick = () => { scrim.remove(); openStandaloneLibrary(); };
  scrim.querySelector("#pcLibToggle").onchange = (e) => {
    localStorage.setItem("waypoint-library-accessible-to-all", e.target.checked ? "1" : "0");
    toast(e.target.checked ? "Library now available to every story" : "Library restricted to locked stories only");
    refreshUnderlyingTextIfVisible();
  };
  scrim.querySelector("#pcLockNow").onclick = () => { state.unlocked = false; scrim.remove(); toast("Locked"); renderLibrary(); };
  scrim.querySelector("#pcChangeCode").onclick = () => { localStorage.removeItem("waypoint-lock-hash"); scrim.remove(); openPrivacyModal(); };
  scrim.querySelector("#pcTurnOff").onclick = async () => {
    if (!confirm("Turn off the privacy lock? Any locked stories will become visible to anyone using the app.")) return;
    localStorage.removeItem("waypoint-lock-hash");
    const all = await dbGetAll();
    for (const st of all) { if (st.hidden) { st.hidden = false; await dbPut(st); } }
    state.unlocked = false;
    scrim.remove();
    toast("Privacy lock turned off");
    renderLibrary();
  };
}

function openNewStoryModal() {
  const scrim = document.createElement("div");
  scrim.className = "modal-scrim";
  scrim.innerHTML = `
    <div class="modal">
      <h3>New story</h3>
      <p class="hint">Give it a title and pick a shape. You can always add chapters later.</p>
      <input type="text" id="newTitle" placeholder="Story title" maxlength="80">
      <div class="type-choice">
        <label><input type="radio" name="type" value="linear" checked><span>📖 Regular story<br><small>read start to finish</small></span></label>
        <label><input type="radio" name="type" value="cyoa"><span>🗺️ Choose your adventure<br><small>branching chapters</small></span></label>
      </div>
      <div class="modal-actions">
        <button class="btn" id="cancelNew">Cancel</button>
        <button class="btn btn--primary" id="confirmNew">Create</button>
      </div>
    </div>`;
  document.body.appendChild(scrim);
  scrim.querySelector("#newTitle").focus();
  scrim.querySelector("#cancelNew").onclick = () => scrim.remove();
  scrim.addEventListener("click", (e) => { if (e.target === scrim) scrim.remove(); });
  scrim.querySelector("#confirmNew").onclick = async () => {
    const title = scrim.querySelector("#newTitle").value.trim() || "Untitled story";
    const type = scrim.querySelector('input[name="type"]:checked').value;
    const story = makeStory(title, type);
    await dbPut(story);
    scrim.remove();
    navigate(`#/story/${story.id}/edit`);
  };
}

async function exportStoryById(id) {
  const s = await dbGet(id);
  if (!s) return;
  downloadStoryFile(s);
}
function downloadStoryFile(s) {
  const exportable = { ...s, hidden: false };
  const blob = new Blob([JSON.stringify(exportable, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(s.title || "story").replace(/[^a-z0-9\- ]/gi, "").trim() || "story"}.waypoint.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast("Saved as a file");
}
async function deleteStoryCard(id) {
  const s = await dbGet(id);
  if (!s) return;
  if (!confirm(`Delete "${s.title}"? This can't be undone unless you've exported it.`)) return;
  await dbDelete(id);
  renderLibrary();
}
async function handleImportFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || !Array.isArray(data.chapters)) throw new Error("bad shape");
    data.id = uid(); // avoid collisions, treat import as a fresh copy
    data.updatedAt = Date.now();
    normalizeStory(data);
    await dbPut(data);
    toast("Story imported");
    renderLibrary();
  } catch (err) {
    alert("That file doesn't look like a Waypoint story export.");
  }
  e.target.value = "";
}

/* ================= DRAWER (characters + images) ================= */
function ensureDrawerShell() {
  if (document.querySelector(".drawer")) return;
  const scrim = document.createElement("div");
  scrim.className = "drawer-scrim";
  scrim.onclick = closeDrawer;
  const drawer = document.createElement("div");
  drawer.className = "drawer";
  document.body.appendChild(scrim);
  document.body.appendChild(drawer);
}
function openDrawer(tab) {
  ensureDrawerShell();
  state.drawerOpen = true;
  state.drawerStandalone = false;
  state.drawerTab = tab || state.drawerTab || "characters";
  renderDrawer();
  document.querySelector(".drawer-scrim").classList.add("drawer-scrim--open");
  document.querySelector(".drawer").classList.add("drawer--open");
}
function openStandaloneLibrary() {
  ensureDrawerShell();
  state.drawerOpen = true;
  state.drawerStandalone = true;
  renderDrawer();
  document.querySelector(".drawer-scrim").classList.add("drawer-scrim--open");
  document.querySelector(".drawer").classList.add("drawer--open");
}
function closeDrawer() {
  state.drawerOpen = false;
  const sc = document.querySelector(".drawer-scrim"), dr = document.querySelector(".drawer");
  if (sc) sc.classList.remove("drawer-scrim--open");
  if (dr) dr.classList.remove("drawer--open");
}
function renderDrawer() {
  if (state.drawerStandalone) return renderStandaloneLibraryDrawer();
  const s = state.current;
  const drawer = document.querySelector(".drawer");
  const tab = state.drawerTab;
  const allowed = storyCanUseLibrary(s);
  const hints = {
    characters: "Rename anyone — every mention updates across the whole story.",
    images: allowed ? "Placeholders like {{img:image1}} — point each one at any picture, and swap it anytime." : "This story doesn't have access to the shared library right now.",
    library: allowed ? "Your photo shelf, shared by every story allowed to use it." : "This story doesn't have access to the shared library right now.",
  };
  const footers = {
    characters: `<button class="btn btn--block" id="addChar">${ICON.plus} Add character</button>`,
    images: allowed ? `<button class="btn btn--block" id="addSlot">${ICON.plus} Add image placeholder</button>` : "",
    library: allowed ? `<button class="btn btn--block" id="addLibraryImage">${ICON.plus} Add photo to library</button>
      <div class="drawer__footer-row">
        <button class="btn btn--sm btn--ghost" id="exportLibrary">${ICON.download} Export library</button>
        <button class="btn btn--sm btn--ghost" id="importLibrary">${ICON.upload} Import library</button>
      </div>
      <input type="file" id="libraryFile" accept="application/json" style="display:none">` : "",
  };
  drawer.innerHTML = `
    <div class="drawer__header">
      <div class="drawer__tabs">
        <button class="drawer__tab ${tab === "characters" ? "drawer__tab--active" : ""}" data-tab="characters">${ICON.people} Characters</button>
        <button class="drawer__tab ${tab === "images" ? "drawer__tab--active" : ""}" data-tab="images">${ICON.image} Images</button>
        <button class="drawer__tab ${tab === "library" ? "drawer__tab--active" : ""}" data-tab="library">${ICON.book} Library</button>
      </div>
      <p>${hints[tab]}</p>
    </div>
    <div class="drawer__body" id="drawerBody"></div>
    <div class="drawer__footer">${footers[tab]}</div>`;
  drawer.querySelectorAll(".drawer__tab").forEach((btn) => {
    btn.addEventListener("click", () => { state.drawerTab = btn.dataset.tab; renderDrawer(); });
  });
  if (tab === "characters") { renderCharacterTab(drawer, s); return; }
  if (!allowed) { renderLibraryLockedNotice(drawer, s); return; }
  if (tab === "images") renderSlotsTab(drawer, s);
  else renderLibraryTab(drawer, s);
}

function renderLibraryLockedNotice(drawer, s) {
  const body = drawer.querySelector("#drawerBody");
  body.innerHTML = `
    <div class="library-locked-notice">
      ${ICON.lock}
      <p>The shared image library is only available to locked stories, to keep private pictures out of stories anyone can open.</p>
      <button class="btn btn--sm btn--primary" id="lockThisStory">${ICON.lock} Lock this story</button>
      <p class="library-locked-notice__hint">Or turn on library access for every story from the privacy area — tap the app title 5 times on the main screen.</p>
    </div>`;
  body.querySelector("#lockThisStory").onclick = async () => {
    s.hidden = true;
    await dbPut(s);
    toast("Story locked");
    renderDrawer();
  };
}

/* the standalone view: manage the shared library without opening any story */
function renderStandaloneLibraryDrawer() {
  const drawer = document.querySelector(".drawer");
  drawer.innerHTML = `
    <div class="drawer__header">
      <div class="drawer__tabs">
        <button class="drawer__tab drawer__tab--active" disabled>${ICON.book} Image Library</button>
      </div>
      <p>Your photo shelf, shared by every story allowed to use it.</p>
    </div>
    <div class="drawer__body" id="drawerBody"></div>
    <div class="drawer__footer">
      <button class="btn btn--block" id="addLibraryImage">${ICON.plus} Add photo to library</button>
      <div class="drawer__footer-row">
        <button class="btn btn--sm btn--ghost" id="exportLibrary">${ICON.download} Export library</button>
        <button class="btn btn--sm btn--ghost" id="importLibrary">${ICON.upload} Import library</button>
      </div>
      <input type="file" id="libraryFile" accept="application/json" style="display:none">
    </div>`;
  renderLibraryTab(drawer, null);
}

function renderCharacterTab(drawer, s) {
  const list = drawer.querySelector("#drawerBody");
  if (s.characters.length === 0) {
    list.innerHTML = `<p style="color:var(--ink-soft);font-size:13px;">No characters yet. Add one, then insert their name into chapter text from the editor toolbar.</p>`;
  } else {
    s.characters.forEach((c) => {
      const row = document.createElement("div");
      row.className = "char-row";
      row.innerHTML = `
        <div class="char-avatar">${escapeHtml((c.name || "?")[0].toUpperCase())}</div>
        <div class="char-fields">
          <input class="char-name-input" value="${escapeHtml(c.name)}" data-id="${c.id}">
          <div class="char-tag">{{${c.id}}}</div>
        </div>
        <button class="char-icon-btn" data-tokenize="${c.id}" title="Find & replace a word with this character's token, everywhere in the story">${ICON.wand}</button>
        <button class="char-icon-btn" data-id="${c.id}" title="Remove character">${ICON.x}</button>`;
      list.appendChild(row);
    });
  }
  list.querySelectorAll(".char-name-input").forEach((inp) => {
    inp.addEventListener("input", () => {
      const c = s.characters.find((x) => x.id === inp.dataset.id);
      if (c) { c.name = inp.value; markDirty(); refreshUnderlyingTextIfVisible(); }
      const av = inp.closest(".char-row").querySelector(".char-avatar");
      av.textContent = (inp.value || "?")[0].toUpperCase();
    });
  });
  list.querySelectorAll("[data-tokenize]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = s.characters.find((x) => x.id === btn.dataset.tokenize);
      if (c) tokenizeAcrossStory(c);
    });
  });
  list.querySelectorAll(".char-icon-btn[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      s.characters = s.characters.filter((x) => x.id !== btn.dataset.id);
      markDirty();
      renderDrawer();
      refreshUnderlyingTextIfVisible();
    });
  });
  drawer.querySelector("#addChar").onclick = () => {
    const name = prompt("Character's name:");
    if (!name) return;
    const id = slugify(name, s.characters.map((c) => c.id));
    s.characters.push({ id, name: name.trim() });
    markDirty();
    renderDrawer();
    refreshUnderlyingTextIfVisible();
  };
}

/* ---- Images tab: per-story placeholders that point at a library photo ---- */
function nextImageSlotId(s) {
  const existing = new Set(s.media.map((m) => m.id));
  let n = 1;
  while (existing.has(`image${n}`)) n++;
  return `image${n}`;
}
function renderSlotsTab(drawer, s) {
  const list = drawer.querySelector("#drawerBody");
  if (s.media.length === 0) {
    list.innerHTML = `<p style="color:var(--ink-soft);font-size:13px;">No image placeholders yet. Add one, point it at a photo, then insert it into any chapter from the editor toolbar.</p>`;
  } else {
    list.innerHTML = "";
    s.media.forEach((slot) => {
      const img = slot.libraryImageId ? libraryCache.find((x) => x.id === slot.libraryImageId) : null;
      const row = document.createElement("div");
      row.className = "media-row";
      row.innerHTML = `
        ${img
          ? `<img class="media-thumb" src="${img.dataUrl}" alt="${escapeHtml(img.name)}">`
          : `<div class="media-thumb media-thumb--empty">${ICON.image}</div>`}
        <div class="char-fields">
          <input class="char-name-input" value="${escapeHtml(slot.name || slot.id)}" data-id="${slot.id}">
          <div class="char-tag">{{img:${slot.id}}}${img ? ` → ${escapeHtml(img.name)}` : " → not set"}</div>
        </div>
        <button class="char-icon-btn" data-choose="${slot.id}" title="Choose which picture this is">${ICON.wand}</button>
        <button class="char-icon-btn" data-id="${slot.id}" title="Remove this placeholder">${ICON.x}</button>`;
      list.appendChild(row);
    });
  }
  list.querySelectorAll(".char-name-input").forEach((inp) => {
    inp.addEventListener("input", () => {
      const slot = s.media.find((x) => x.id === inp.dataset.id);
      if (slot) { slot.name = inp.value; markDirty(); }
    });
  });
  list.querySelectorAll("[data-choose]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slot = s.media.find((x) => x.id === btn.dataset.choose);
      if (slot) openImagePicker(slot);
    });
  });
  list.querySelectorAll(".char-icon-btn[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!confirm("Remove this placeholder? Any spot it's used in the story will show as empty.")) return;
      s.media = s.media.filter((x) => x.id !== btn.dataset.id);
      markDirty();
      renderDrawer();
      refreshUnderlyingTextIfVisible();
    });
  });
  drawer.querySelector("#addSlot").onclick = () => {
    const slot = { id: nextImageSlotId(s), name: "", libraryImageId: null };
    s.media.push(slot);
    markDirty();
    renderDrawer();
    refreshUnderlyingTextIfVisible();
    openImagePicker(slot);
  };
}

/* ---- Library tab: the shared photo shelf, usable from any story ---- */
function renderLibraryTab(drawer, s) {
  const wrap = drawer.querySelector("#drawerBody");
  if (libraryCache.length === 0) {
    wrap.innerHTML = `<p style="color:var(--ink-soft);font-size:13px;">Your library is empty. Add a photo or GIF below — it'll be available to every story from then on.</p>`;
  } else {
    wrap.innerHTML = `<div class="library-grid"></div>`;
    const grid = wrap.querySelector(".library-grid");
    libraryCache.forEach((item) => {
      const cell = document.createElement("div");
      cell.className = "library-cell";
      cell.innerHTML = `
        <img src="${item.dataUrl}" alt="${escapeHtml(item.name)}">
        <input class="library-cell__name" value="${escapeHtml(item.name)}" data-id="${item.id}">
        <button class="library-cell__del" data-id="${item.id}" title="Delete from library">${ICON.x}</button>`;
      grid.appendChild(cell);
    });
    grid.querySelectorAll(".library-cell__name").forEach((inp) => {
      inp.addEventListener("change", async () => {
        const item = libraryCache.find((x) => x.id === inp.dataset.id);
        if (item) { item.name = inp.value.trim() || item.name; await libraryPut(item); refreshUnderlyingTextIfVisible(); }
      });
    });
    grid.querySelectorAll(".library-cell__del").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!confirm("Delete this photo from the library? Any story using it will show that spot as empty.")) return;
        await libraryDelete(btn.dataset.id);
        renderDrawer();
        refreshUnderlyingTextIfVisible();
      });
    });
  }
  drawer.querySelector("#addLibraryImage").onclick = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      await addFileToLibrary(file);
      renderDrawer();
    };
    input.click();
  };
  drawer.querySelector("#exportLibrary").onclick = exportLibrary;
  const libFile = drawer.querySelector("#libraryFile");
  drawer.querySelector("#importLibrary").onclick = () => libFile.click();
  libFile.onchange = async () => {
    const file = libFile.files[0];
    if (file) await importLibraryFile(file);
    libFile.value = "";
    renderDrawer();
  };
}

/* ---- picking / assigning a library image to a story slot ---- */
function openImagePicker(slot) {
  const scrim = document.createElement("div");
  scrim.className = "modal-scrim";
  scrim.innerHTML = `
    <div class="modal modal--picker">
      <h3>${ICON.image} Choose a picture</h3>
      <p class="hint">For {{img:${slot.id}}} — pick from your library, or add a new one.</p>
      <button class="btn btn--primary btn--block" id="pickerUpload">${ICON.upload} Upload new photo…</button>
      <div class="picker-grid" id="pickerGrid"></div>
      <div class="modal-actions"><button class="btn btn--block" id="pickerCancel">Cancel</button></div>
    </div>`;
  document.body.appendChild(scrim);
  scrim.addEventListener("click", (e) => { if (e.target === scrim) scrim.remove(); });
  scrim.querySelector("#pickerCancel").onclick = () => scrim.remove();

  const grid = scrim.querySelector("#pickerGrid");
  if (libraryCache.length === 0) {
    grid.innerHTML = `<p style="color:var(--ink-soft);font-size:13px;">Your library is empty — upload a photo to get started.</p>`;
  } else {
    libraryCache.forEach((item) => {
      const cell = document.createElement("button");
      cell.className = "picker-cell" + (slot.libraryImageId === item.id ? " picker-cell--selected" : "");
      cell.innerHTML = `<img src="${item.dataUrl}" alt="${escapeHtml(item.name)}"><span>${escapeHtml(item.name)}</span>`;
      cell.onclick = () => {
        slot.libraryImageId = item.id;
        if (!slot.name) slot.name = item.name;
        markDirty();
        scrim.remove();
        renderDrawer();
        refreshUnderlyingTextIfVisible();
      };
      grid.appendChild(cell);
    });
  }
  scrim.querySelector("#pickerUpload").onclick = () => {
    const input = document.createElement("input");
    input.type = "file"; input.accept = "image/*";
    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;
      const item = await addFileToLibrary(file);
      if (item) {
        slot.libraryImageId = item.id;
        if (!slot.name) slot.name = item.name;
        markDirty();
        renderDrawer();
        refreshUnderlyingTextIfVisible();
      }
      scrim.remove();
    };
    input.click();
  };
}

/* read a file into a data URL; static images are downscaled to keep things
   small, GIFs are kept as-is so their animation isn't destroyed */
function processImageFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) { reject(new Error("no file")); return; }
    if (file.type === "image/gif") {
      if (file.size > 5 * 1024 * 1024) toast("That GIF is quite large — it may slow down saving and exporting");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const isPng = file.type === "image/png";
        resolve(canvas.toDataURL(isPng ? "image/png" : "image/jpeg", 0.85));
      };
      img.onerror = () => reject(new Error("bad image"));
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
async function addFileToLibrary(file) {
  let dataUrl;
  try {
    dataUrl = await processImageFile(file);
  } catch (e) {
    toast("Couldn't read that image");
    return null;
  }
  const defaultName = file.name.replace(/\.[a-z0-9]+$/i, "").slice(0, 40) || "image";
  const name = prompt("Name this photo (used to find it later):", defaultName);
  if (name === null) return null;
  const item = { id: uid(), name: (name || defaultName).trim(), dataUrl, createdAt: Date.now() };
  await libraryPut(item);
  return item;
}

function exportLibrary() {
  if (libraryCache.length === 0) { toast("Your library is empty"); return; }
  const blob = new Blob([JSON.stringify(libraryCache, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "waypoint-image-library.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast("Library saved as a file");
}
async function importLibraryFile(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!Array.isArray(data)) throw new Error("bad shape");
    let count = 0;
    for (const item of data) {
      if (!item || !item.dataUrl) continue;
      await dbPut({ id: uid(), name: item.name || "image", dataUrl: item.dataUrl, createdAt: Date.now() }, LIBRARY_STORE);
      count++;
    }
    await refreshLibraryCache();
    toast(`Imported ${count} photo${count === 1 ? "" : "s"}`);
  } catch (e) {
    alert("That file doesn't look like a Waypoint library export.");
  }
}

/* find-and-replace a plain word/phrase into a character token, across every chapter */
function tokenizeWordInText(text, needleRegex, characterId) {
  const re = tokenRegex();
  let result = "", lastIndex = 0, m, count = 0;
  while ((m = re.exec(text))) {
    const segment = text.slice(lastIndex, m.index);
    result += segment.replace(needleRegex, () => { count++; return `{{${characterId}}}`; });
    result += m[0];
    lastIndex = re.lastIndex;
  }
  result += text.slice(lastIndex).replace(needleRegex, () => { count++; return `{{${characterId}}}`; });
  return { text: result, count };
}
function tokenizeAcrossStory(character) {
  const s = state.current;
  const query = prompt(`Replace every mention of a word or phrase with ${character.name}'s token, across the whole story.\n\nWhat should we search for?`, character.name);
  if (query === null) return;
  const needle = query.trim();
  if (!needle) return;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const needleRegex = new RegExp(`\\b${escaped}\\b`, "gi");
  let total = 0;
  s.chapters.forEach((ch) => {
    const { text, count } = tokenizeWordInText(ch.text || "", needleRegex, character.id);
    if (count > 0) { ch.text = text; total += count; }
  });
  if (total === 0) { toast(`No mentions of "${needle}" found`); return; }
  markDirty();
  toast(`Replaced ${total} mention${total === 1 ? "" : "s"} with ${character.name}'s token`);
  refreshUnderlyingTextIfVisible();
}

function refreshUnderlyingTextIfVisible() {
  const r = parseHash();
  const s = state.current;
  if (!s) return;
  if (r.view === "read") {
    renderReaderBody();
  } else if (r.view === "edit") {
    const chapter = s.chapters.find((c) => c.id === r.chapterId) || s.chapters[0];
    renderChapterRail(chapter.id);
    renderManuscript(chapter);
  }
}

/* ================= EDITOR ================= */
function renderEditor(activeChapterId) {
  const s = state.current;
  let chapter = s.chapters.find((c) => c.id === activeChapterId) || s.chapters[0];
  app.innerHTML = `
    <div class="topbar">
      <button class="topbar__icon-btn" id="btnBack">${ICON.back}</button>
      <input class="topbar__title topbar__title--editable" id="titleInput" value="${escapeHtml(s.title)}">
      <div class="topbar__actions">
        <span class="save-indicator" title="saved"><i></i></span>
        <button class="topbar__icon-btn" id="btnTheme" title="Toggle theme"></button>
        <button class="topbar__icon-btn" id="btnChars" title="Characters">${ICON.people}</button>
        <button class="topbar__icon-btn" id="btnMap" title="Story map">${ICON.map}</button>
        <button class="topbar__icon-btn" id="btnExport" title="Export as file">${ICON.download}</button>
      </div>
    </div>
    <div class="editor">
      <div class="chapter-rail" id="chapterRail"></div>
      <div class="manuscript-wrap">
        <div class="manuscript" id="manuscript"></div>
      </div>
    </div>`;

  document.getElementById("btnBack").onclick = () => navigate("#/");
  document.getElementById("titleInput").addEventListener("input", (e) => { s.title = e.target.value; markDirty(); });
  wireThemeButton(document.getElementById("btnTheme"));
  document.getElementById("btnChars").onclick = () => openDrawer("characters");
  document.getElementById("btnMap").onclick = () => navigate(`#/story/${s.id}/map?mode=edit`);
  document.getElementById("btnExport").onclick = () => downloadStoryFile(s);

  renderChapterRail(chapter.id);
  renderManuscript(chapter);
}

function renderChapterRail(activeId) {
  const s = state.current;
  const rail = document.getElementById("chapterRail");
  rail.innerHTML = s.chapters.map((c, i) =>
    `<button class="chapter-pill ${c.id === activeId ? "chapter-pill--active" : ""}" data-id="${c.id}">${i + 1}. ${escapeHtml(c.title || "Untitled")}</button>`
  ).join("") + `<button class="chapter-pill chapter-pill--add" id="addChapter">${ICON.plus} chapter</button>`;
  rail.querySelectorAll(".chapter-pill[data-id]").forEach((btn) => {
    btn.onclick = () => navigate(`#/story/${s.id}/edit?chapter=${btn.dataset.id}`);
  });
  rail.querySelector("#addChapter").onclick = () => {
    const c = makeChapter(`Chapter ${s.chapters.length + 1}`, 120 + (s.chapters.length % 4) * 150, 120 + Math.floor(s.chapters.length / 4) * 150);
    s.chapters.push(c);
    markDirty();
    navigate(`#/story/${s.id}/edit?chapter=${c.id}`);
  };
}

function renderManuscript(chapter) {
  const s = state.current;
  const m = document.getElementById("manuscript");
  const idx = s.chapters.findIndex((c) => c.id === chapter.id);
  const prevCh = s.chapters[idx - 1], nextCh = s.chapters[idx + 1];

  m.innerHTML = `
    <div class="chapter-nav-row">
      <button class="btn btn--sm" id="prevChBtn" ${!prevCh ? "disabled" : ""} title="${prevCh ? escapeHtml(prevCh.title) : ""}">${ICON.chevronL} Previous</button>
      <span class="chapter-nav-pos">${idx + 1} / ${s.chapters.length}</span>
      <button class="btn btn--sm" id="nextChBtn" ${!nextCh ? "disabled" : ""} title="${nextCh ? escapeHtml(nextCh.title) : ""}">Next ${ICON.chevronR}</button>
    </div>

    <label class="field-label">Chapter title</label>
    <input class="chapter-title-input" id="chTitle" value="${escapeHtml(chapter.title)}">

    <label class="field-label">Insert a character name</label>
    <div class="token-toolbar" id="tokenToolbar"></div>

    <label class="field-label">Insert an image or GIF</label>
    <div class="token-toolbar" id="mediaToolbar"></div>

    <label class="field-label">Chapter text</label>
    <textarea class="manuscript-textarea" id="chText" placeholder="Once upon a time…">${escapeHtml(chapter.text)}</textarea>

    <div class="chapter-tools">
      ${s.type === "linear" ? `
        <button class="btn btn--sm" id="moveLeft" ${idx === 0 ? "disabled" : ""}>${ICON.chevronL} Move earlier</button>
        <button class="btn btn--sm" id="moveRight" ${idx === s.chapters.length - 1 ? "disabled" : ""}>Move later ${ICON.chevronR}</button>
      ` : ""}
      <button class="btn btn--sm btn--danger" id="deleteChapter" ${s.chapters.length <= 1 ? "disabled" : ""}>${ICON.trash} Delete chapter</button>
    </div>

    ${s.type === "cyoa" ? `<div class="choices-block" id="choicesBlock"></div>` : `
      <p style="font-size:12.5px;color:var(--ink-soft);margin-top:20px;">This is a regular story — chapters are read in the order shown above. Open the map to rearrange or jump around.</p>`}
  `;

  document.getElementById("chTitle").addEventListener("input", (e) => {
    chapter.title = e.target.value;
    markDirty();
    renderChapterRail(chapter.id);
  });
  const prevBtn = document.getElementById("prevChBtn"), nextBtn = document.getElementById("nextChBtn");
  if (prevCh) prevBtn.onclick = () => navigate(`#/story/${s.id}/edit?chapter=${prevCh.id}`);
  if (nextCh) nextBtn.onclick = () => navigate(`#/story/${s.id}/edit?chapter=${nextCh.id}`);
  const textarea = document.getElementById("chText");
  textarea.addEventListener("input", (e) => { chapter.text = e.target.value; markDirty(); });

  renderTokenToolbar(textarea);
  renderMediaToolbar(textarea);

  if (s.type === "cyoa") renderChoicesBlock(chapter);

  if (s.type === "linear") {
    const ml = document.getElementById("moveLeft"), mr = document.getElementById("moveRight");
    if (ml) ml.onclick = () => { swapChapters(idx, idx - 1); };
    if (mr) mr.onclick = () => { swapChapters(idx, idx + 1); };
  }
  document.getElementById("deleteChapter").onclick = () => {
    if (s.chapters.length <= 1) return;
    if (!confirm(`Delete "${chapter.title}"? Any choices pointing to it will be cleared.`)) return;
    s.chapters = s.chapters.filter((c) => c.id !== chapter.id);
    s.chapters.forEach((c) => (c.choices = (c.choices || []).filter((ch) => ch.targetId !== chapter.id)));
    markDirty();
    navigate(`#/story/${s.id}/edit?chapter=${s.chapters[0].id}`);
  };
}

function swapChapters(i, j) {
  const s = state.current;
  if (j < 0 || j >= s.chapters.length) return;
  [s.chapters[i], s.chapters[j]] = [s.chapters[j], s.chapters[i]];
  markDirty();
  navigate(`#/story/${s.id}/edit?chapter=${s.chapters[j].id}`);
}

function renderTokenToolbar(textareaEl) {
  const s = state.current;
  const toolbar = document.getElementById("tokenToolbar");
  if (!toolbar) return;
  const textarea = textareaEl || document.getElementById("chText");
  if (s.characters.length === 0) {
    toolbar.innerHTML = `<span style="font-size:12px;color:var(--ink-faint);">No characters yet — add one from the ${ICON.people} menu above, then insert their name here.</span>`;
    return;
  }
  toolbar.innerHTML = s.characters.map((c) => `<button class="token-chip" data-id="${c.id}" type="button">+ ${escapeHtml(c.name)}</button>`).join("");
  toolbar.querySelectorAll(".token-chip").forEach((chip) => {
    chip.onclick = () => {
      if (!textarea) return;
      const start = textarea.selectionStart, end = textarea.selectionEnd;
      const token = `{{${chip.dataset.id}}}`;
      textarea.value = textarea.value.slice(0, start) + token + textarea.value.slice(end);
      textarea.dispatchEvent(new Event("input"));
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + token.length;
    };
  });
}

function renderMediaToolbar(textareaEl) {
  const s = state.current;
  const toolbar = document.getElementById("mediaToolbar");
  if (!toolbar) return;
  const textarea = textareaEl || document.getElementById("chText");
  if (!storyCanUseLibrary(s)) {
    toolbar.innerHTML = `<span style="font-size:12px;color:var(--ink-faint);">${ICON.lock} The image library is only available to locked stories.</span>`;
    return;
  }
  if (s.media.length === 0) {
    toolbar.innerHTML = `<span style="font-size:12px;color:var(--ink-faint);">No image placeholders yet — add one from the ${ICON.image} menu above, then drop it in here.</span>`;
    return;
  }
  toolbar.innerHTML = s.media.map((slot) => {
    const img = slot.libraryImageId ? libraryCache.find((x) => x.id === slot.libraryImageId) : null;
    const thumb = img ? `<img src="${img.dataUrl}" alt="">` : `<span class="token-chip--media-empty">${ICON.image}</span>`;
    return `<button class="token-chip token-chip--media" data-id="${slot.id}" type="button">${thumb} ${escapeHtml(slot.name || slot.id)}</button>`;
  }).join("");
  toolbar.querySelectorAll(".token-chip--media").forEach((chip) => {
    chip.onclick = () => {
      if (!textarea) return;
      const start = textarea.selectionStart, end = textarea.selectionEnd;
      const token = `{{img:${chip.dataset.id}}}`;
      textarea.value = textarea.value.slice(0, start) + token + textarea.value.slice(end);
      textarea.dispatchEvent(new Event("input"));
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + token.length;
    };
  });
}

function renderChoicesBlock(chapter) {
  const s = state.current;
  const block = document.getElementById("choicesBlock");
  const otherChapters = s.chapters;
  block.innerHTML = `<label class="field-label">Choices at the end of this chapter</label><div id="choiceRows"></div>
    <button class="btn btn--sm btn--plum" id="addChoice">${ICON.plus} Add choice</button>`;
  const rows = block.querySelector("#choiceRows");
  if (chapter.choices.length === 0) {
    const p = document.createElement("p");
    p.style.cssText = "font-size:12.5px;color:var(--ink-soft);margin-bottom:10px;";
    p.textContent = "No choices yet — this chapter currently reads as an ending.";
    rows.appendChild(p);
  }
  chapter.choices.forEach((choice) => {
    const row = document.createElement("div");
    row.className = "choice-row";
    row.innerHTML = `
      <input type="text" placeholder="Choice text, e.g. Open the door" value="${escapeHtml(choice.text)}" data-cid="${choice.id}">
      <select data-target="${choice.id}">
        <option value="">Leads to…</option>
        ${otherChapters.map((c) => `<option value="${c.id}" ${c.id === choice.targetId ? "selected" : ""}>${escapeHtml(c.title)}</option>`).join("")}
        <option value="__new__">+ New chapter…</option>
      </select>
      <button class="char-del" data-del="${choice.id}" title="Remove choice">${ICON.x}</button>`;
    rows.appendChild(row);
  });
  rows.querySelectorAll("input[data-cid]").forEach((inp) => {
    inp.addEventListener("input", () => {
      const choice = chapter.choices.find((c) => c.id === inp.dataset.cid);
      choice.text = inp.value;
      markDirty();
    });
  });
  rows.querySelectorAll("select[data-target]").forEach((sel) => {
    sel.addEventListener("change", () => {
      const choice = chapter.choices.find((c) => c.id === sel.dataset.target);
      if (sel.value === "__new__") {
        const nc = makeChapter(`Chapter ${s.chapters.length + 1}`, chapter.x + 150, chapter.y + 60);
        s.chapters.push(nc);
        choice.targetId = nc.id;
        markDirty();
        renderChapterRail(chapter.id);
        renderChoicesBlock(chapter);
      } else {
        choice.targetId = sel.value || null;
        markDirty();
      }
    });
  });
  rows.querySelectorAll("[data-del]").forEach((btn) => {
    btn.addEventListener("click", () => {
      chapter.choices = chapter.choices.filter((c) => c.id !== btn.dataset.del);
      markDirty();
      renderChoicesBlock(chapter);
    });
  });
  block.querySelector("#addChoice").onclick = () => {
    chapter.choices.push({ id: uid(), text: "", targetId: null });
    markDirty();
    renderChoicesBlock(chapter);
  };
}

/* ================= READER ================= */
function renderReader(chapterId) {
  const s = state.current;
  const chapter = s.chapters.find((c) => c.id === chapterId) || s.chapters.find((c) => c.id === s.lastReadChapterId) || s.chapters[0];
  s.lastReadChapterId = chapter.id;
  dbPut(s);

  app.innerHTML = `
    <div class="topbar">
      <button class="topbar__icon-btn" id="btnBack">${ICON.back}</button>
      <div class="topbar__title">${escapeHtml(s.title)}</div>
      <div class="topbar__actions">
        <button class="topbar__icon-btn" id="btnTextSize" title="Text size">Aa</button>
        <button class="topbar__icon-btn" id="btnTheme" title="Toggle theme"></button>
        <button class="topbar__icon-btn" id="btnChars" title="Characters">${ICON.people}</button>
        <button class="topbar__icon-btn" id="btnMap" title="Story map">${ICON.map}</button>
      </div>
    </div>
    <div class="reader-wrap"><div class="reader-page" id="readerPage"></div></div>`;

  document.getElementById("btnBack").onclick = () => navigate("#/");
  document.getElementById("btnTextSize").onclick = (e) => toggleTextSizeMenu(e.currentTarget);
  wireThemeButton(document.getElementById("btnTheme"));
  document.getElementById("btnChars").onclick = () => openDrawer("characters");
  document.getElementById("btnMap").onclick = () => navigate(`#/story/${s.id}/map?mode=read`);

  renderReaderBody(chapter.id);
}

function renderReaderBody(chapterId) {
  const s = state.current;
  const r = parseHash();
  const cid = chapterId || r.chapterId || s.lastReadChapterId;
  const chapter = s.chapters.find((c) => c.id === cid) || s.chapters[0];
  const idx = s.chapters.findIndex((c) => c.id === chapter.id);
  const page = document.getElementById("readerPage");
  if (!page) return;

  let navHTML = "";
  if (s.type === "linear") {
    const prev = s.chapters[idx - 1], next = s.chapters[idx + 1];
    navHTML = `<div class="reader-nav">
      ${prev ? `<button class="btn" data-goto="${prev.id}">${ICON.chevronL} ${escapeHtml(prev.title)}</button>` : `<span></span>`}
      ${next ? `<button class="btn btn--primary" data-goto="${next.id}">${escapeHtml(next.title)} ${ICON.chevronR}</button>` : `<span></span>`}
    </div>
    ${!next ? `<div class="ending-badge">· The End ·</div>` : ""}`;
  } else {
    const valid = chapter.choices.filter((c) => c.targetId && s.chapters.some((ch) => ch.id === c.targetId));
    if (valid.length > 0) {
      navHTML = `<div class="choice-list">
        ${valid.map((c) => `<button class="choice-btn" data-goto="${c.targetId}">${ICON.arrow} ${escapeHtml(c.text || "Continue")}</button>`).join("")}
      </div>`;
    } else {
      navHTML = `<div class="ending-badge">· fin ·</div>
        <div class="reader-nav"><button class="btn btn--block" data-goto="${s.chapters[0].id}">${ICON.back} Start over</button></div>`;
    }
  }

  const backHTML = s.type === "cyoa" && readerHistory.length > 0
    ? `<div class="reader-back-row"><button class="btn btn--sm btn--ghost" id="readerBackBtn">${ICON.chevronL} Back</button></div>` : "";

  page.innerHTML = `
    ${backHTML}
    <div class="reader-eyebrow">${s.type === "cyoa" ? "Choose your adventure" : `Chapter ${idx + 1} of ${s.chapters.length}`}</div>
    <h1 class="reader-title">${escapeHtml(chapter.title)}</h1>
    <div class="reader-body">${renderTokensHTML(chapter.text, s) || `<span style="color:var(--ink-faint)">This chapter is empty so far.</span>`}</div>
    ${navHTML}
  `;
  page.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.onclick = () => {
      readerHistory.push(chapter.id);
      navigate(`#/story/${s.id}/read?chapter=${btn.dataset.goto}`);
    };
  });
  document.getElementById("readerBackBtn")?.addEventListener("click", () => {
    const prevId = readerHistory.pop();
    if (prevId) navigate(`#/story/${s.id}/read?chapter=${prevId}`);
  });
  page.scrollTop = 0;
  document.querySelector(".reader-wrap")?.scrollTo?.(0, 0);
}

/* ================= MAP ================= */
function renderMap(mode) {
  const s = state.current;
  const editable = mode === "edit";
  state.mapMode = "move"; // move | connect — only meaningful for CYOA editing
  app.innerHTML = `
    <div class="topbar">
      <button class="topbar__icon-btn" id="btnBack">${ICON.back}</button>
      <div class="topbar__title">${escapeHtml(s.title)} · map</div>
      <div class="topbar__actions">
        <button class="topbar__icon-btn" id="btnTheme" title="Toggle theme"></button>
        <button class="topbar__icon-btn" id="btnChars" title="Characters">${ICON.people}</button>
      </div>
    </div>
    ${editable ? `
      <div class="map-toolbar">
        ${s.type === "cyoa" ? `
          <div class="map-seg">
            <button class="map-seg__btn map-seg__btn--active" data-mmode="move" title="Drag a waypoint to reposition it">${ICON.move} Move</button>
            <button class="map-seg__btn" data-mmode="branch" title="Drag a waypoint to move it and everything downstream of it together">${ICON.branch} Branch</button>
            <button class="map-seg__btn" data-mmode="connect" title="Drag between waypoints to add a path">${ICON.link} Connect</button>
          </div>` : ""}
        <button class="btn btn--sm btn--primary" id="btnAddChapter">${ICON.plus} Chapter</button>
      </div>` : ""}
    <div class="map-wrap" id="mapWrap">
      <svg class="map-svg" id="mapSvg" xmlns="http://www.w3.org/2000/svg">
        <rect class="map-bg-catcher" x="0" y="0" width="100%" height="100%" fill="none" pointer-events="all"></rect>
        <g id="mapViewport"></g>
      </svg>
      <div class="map-controls">
        <button id="btnZoomIn" title="Zoom in">${ICON.plus}</button>
        <button id="btnZoomOut" title="Zoom out">${ICON.minus}</button>
        <button id="btnFit" title="Fit to screen">${ICON.frame}</button>
      </div>
      <div class="map-legend" id="mapLegend"></div>
    </div>`;
  document.getElementById("btnBack").onclick = () => navigate(mode === "edit" ? `#/story/${s.id}/edit` : `#/story/${s.id}/read`);
  document.getElementById("btnChars").onclick = () => openDrawer("characters");
  wireThemeButton(document.getElementById("btnTheme"));

  if (editable) {
    document.getElementById("btnAddChapter").onclick = () => addChapterFromMap();
    const seg = document.querySelectorAll(".map-seg__btn");
    seg.forEach((btn) => btn.addEventListener("click", () => {
      state.mapMode = btn.dataset.mmode;
      seg.forEach((b) => b.classList.toggle("map-seg__btn--active", b === btn));
      updateMapLegend(mode);
      drawMap(mode);
    }));
  }
  updateMapLegend(mode);
  initMapView(mode);
}

function updateMapLegend(mode) {
  const s = state.current;
  const legend = document.getElementById("mapLegend");
  if (!legend) return;
  if (s.type === "cyoa") {
    if (mode === "edit" && state.mapMode === "connect") {
      legend.innerHTML = `<span>drag from one waypoint to another to add a path</span><span>tap a path to remove it</span>`;
    } else if (mode === "edit" && state.mapMode === "branch") {
      legend.innerHTML = `<span>drag a waypoint to move it and its whole branch together</span>`;
    } else if (mode === "edit") {
      legend.innerHTML = `<span><i style="background:var(--paper-dark);border:2px solid var(--teal)"></i> chapter</span><span><i style="background:var(--paper-dark);border:2px solid var(--gold)"></i> ending</span><span>pinch/scroll to zoom · drag to pan</span>`;
    } else {
      legend.innerHTML = `<span><i style="background:var(--paper-dark);border:2px solid var(--teal)"></i> chapter</span><span><i style="background:var(--paper-dark);border:2px solid var(--gold)"></i> ending</span><span>tap – to collapse a branch</span>`;
    }
  } else {
    legend.innerHTML = `<span><i style="background:var(--teal)"></i> reading order</span><span>pinch/scroll to zoom · drag to pan</span>`;
  }
}

function addChapterFromMap() {
  const s = state.current;
  const title = prompt("Chapter title:", `Chapter ${s.chapters.length + 1}`);
  if (title === null) return;
  const maxX = Math.max(140, ...s.chapters.map((c) => c.x));
  const c = makeChapter(title.trim() || `Chapter ${s.chapters.length + 1}`, maxX + 150, 140);
  s.chapters.push(c);
  markDirty();
  drawMap("edit");
  state.mapHelpers?.fitToContent();
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

/* -- every chapter downstream of a given chapter, via choices -- */
function collectDescendants(chapter, allChapters) {
  const byId = Object.fromEntries(allChapters.map((c) => [c.id, c]));
  const seen = new Set([chapter.id]);
  const queue = (chapter.choices || []).map((ch) => ch.targetId).filter(Boolean);
  const result = [];
  while (queue.length) {
    const id = queue.shift();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const c = byId[id];
    if (c) {
      result.push(c);
      (c.choices || []).forEach((ch) => { if (ch.targetId) queue.push(ch.targetId); });
    }
  }
  return result;
}

/* -- which chapters a collapsed branch is hiding -- */
function computeHiddenSet(chapters) {
  const byId = Object.fromEntries(chapters.map((c) => [c.id, c]));
  const hidden = new Set();
  const hiddenCount = {};
  chapters.forEach((c) => {
    if (!c.collapsed) return;
    const queue = (c.choices || []).map((ch) => ch.targetId).filter(Boolean);
    const seen = new Set();
    while (queue.length) {
      const id = queue.shift();
      if (!id || id === c.id || seen.has(id)) continue;
      seen.add(id);
      hidden.add(id);
      const child = byId[id];
      if (child) (child.choices || []).forEach((ch) => { if (ch.targetId) queue.push(ch.targetId); });
    }
    hiddenCount[c.id] = seen.size;
  });
  return { hidden, hiddenCount };
}

/* -- pan & zoom wiring, lives on the outer svg / background -- */
function initMapView(mode) {
  const s = state.current;
  const svg = document.getElementById("mapSvg");
  const wrap = document.getElementById("mapWrap");
  const viewport = document.getElementById("mapViewport");

  state.mapView = { scale: 1, tx: 0, ty: 0 };

  function sizeSvgToContainer() {
    const rect = wrap.getBoundingClientRect();
    svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
    return rect;
  }

  function applyTransform() {
    viewport.setAttribute("transform", `translate(${state.mapView.tx},${state.mapView.ty}) scale(${state.mapView.scale})`);
  }

  function fitToContent() {
    const hidden = s.type === "cyoa" ? computeHiddenSet(s.chapters).hidden : new Set();
    const visible = s.chapters.filter((c) => !hidden.has(c.id));
    if (visible.length === 0) return;
    const xs = visible.map((c) => c.x), ys = visible.map((c) => c.y);
    const minX = Math.min(...xs) - 70, maxX = Math.max(...xs) + 70;
    const minY = Math.min(...ys) - 70, maxY = Math.max(...ys) + 70;
    const w = Math.max(1, maxX - minX), h = Math.max(1, maxY - minY);
    const rect = sizeSvgToContainer();
    const scale = clamp(Math.min(rect.width / w, rect.height / h), 0.25, 1.3);
    state.mapView.scale = scale;
    state.mapView.tx = rect.width / 2 - ((minX + maxX) / 2) * scale;
    state.mapView.ty = rect.height / 2 - ((minY + maxY) / 2) * scale;
    applyTransform();
  }

  function zoomBy(factor) {
    const rect = svg.getBoundingClientRect();
    const cx = rect.width / 2, cy = rect.height / 2;
    const worldX = (cx - state.mapView.tx) / state.mapView.scale;
    const worldY = (cy - state.mapView.ty) / state.mapView.scale;
    const newScale = clamp(state.mapView.scale * factor, 0.2, 3.5);
    state.mapView.scale = newScale;
    state.mapView.tx = cx - worldX * newScale;
    state.mapView.ty = cy - worldY * newScale;
    applyTransform();
  }

  state.mapHelpers = { applyTransform, fitToContent, sizeSvgToContainer };

  drawMap(mode);
  fitToContent();

  const pointers = new Map();
  let panStart = null, pinchStart = null;

  svg.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".map-node")) return;
    svg.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      panStart = { x: e.clientX, y: e.clientY, tx: state.mapView.tx, ty: state.mapView.ty };
    } else if (pointers.size === 2) {
      const pts = [...pointers.values()];
      pinchStart = {
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        scale: state.mapView.scale,
        mid: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
        tx: state.mapView.tx, ty: state.mapView.ty,
      };
      panStart = null;
    }
  });
  svg.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1 && panStart) {
      state.mapView.tx = panStart.tx + (e.clientX - panStart.x);
      state.mapView.ty = panStart.ty + (e.clientY - panStart.y);
      applyTransform();
    } else if (pointers.size === 2 && pinchStart) {
      const pts = [...pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const ratio = dist / (pinchStart.dist || 1);
      const newScale = clamp(pinchStart.scale * ratio, 0.2, 3.5);
      const rect = svg.getBoundingClientRect();
      const midX = pinchStart.mid.x - rect.left, midY = pinchStart.mid.y - rect.top;
      const worldX = (midX - pinchStart.tx) / pinchStart.scale, worldY = (midY - pinchStart.ty) / pinchStart.scale;
      state.mapView.scale = newScale;
      state.mapView.tx = midX - worldX * newScale;
      state.mapView.ty = midY - worldY * newScale;
      applyTransform();
    }
  });
  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size < 2) pinchStart = null;
    if (pointers.size === 1) {
      const [[, pt]] = pointers;
      panStart = { x: pt.x, y: pt.y, tx: state.mapView.tx, ty: state.mapView.ty };
    } else {
      panStart = null;
    }
  }
  svg.addEventListener("pointerup", endPointer);
  svg.addEventListener("pointercancel", endPointer);

  wrap.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = svg.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const worldX = (px - state.mapView.tx) / state.mapView.scale;
    const worldY = (py - state.mapView.ty) / state.mapView.scale;
    const newScale = clamp(state.mapView.scale * Math.exp(-e.deltaY * 0.0015), 0.2, 3.5);
    state.mapView.scale = newScale;
    state.mapView.tx = px - worldX * newScale;
    state.mapView.ty = py - worldY * newScale;
    applyTransform();
  }, { passive: false });

  if (state.mapResizeHandler) window.removeEventListener("resize", state.mapResizeHandler);
  state.mapResizeHandler = () => sizeSvgToContainer();
  window.addEventListener("resize", state.mapResizeHandler, { passive: true });

  document.getElementById("btnZoomIn").onclick = () => zoomBy(1.25);
  document.getElementById("btnZoomOut").onclick = () => zoomBy(0.8);
  document.getElementById("btnFit").onclick = () => fitToContent();
}

function pathData(a, b, bow) {
  return `M${a.x},${a.y} Q${(a.x + b.x) / 2},${(a.y + b.y) / 2 - bow} ${b.x},${b.y}`;
}
function buildPathsHTML(s, chapters, connectMode) {
  let paths = "";
  if (s.type === "linear") {
    for (let i = 0; i < chapters.length - 1; i++) {
      paths += `<path class="map-path" d="${pathData(chapters[i], chapters[i + 1], 30)}"/>`;
    }
  } else {
    chapters.forEach((c) => {
      (c.choices || []).forEach((choice) => {
        const target = chapters.find((t) => t.id === choice.targetId);
        if (!target) return;
        paths += `<path class="map-path map-path--cyoa" d="${pathData(c, target, 26)}"/>`;
        if (connectMode) {
          paths += `<path class="map-path-hit" data-from="${c.id}" data-to="${target.id}" data-choice="${choice.id}" d="${pathData(c, target, 26)}"/>`;
        }
      });
    });
  }
  return paths;
}
function redrawPaths(viewport, s, chapters, connectMode) {
  viewport.querySelectorAll(".map-path, .map-path-hit").forEach((p) => p.remove());
  viewport.insertAdjacentHTML("afterbegin", buildPathsHTML(s, chapters, connectMode));
  wirePathDeletion(viewport, s, mode_ref.current);
}
let mode_ref = { current: "read" };

function drawMap(mode) {
  mode_ref.current = mode;
  const s = state.current;
  const viewport = document.getElementById("mapViewport");
  if (!viewport) return;
  const connectMode = mode === "edit" && s.type === "cyoa" && state.mapMode === "connect";
  const branchMode = mode === "edit" && s.type === "cyoa" && state.mapMode === "branch";

  const { hidden, hiddenCount } = s.type === "cyoa" ? computeHiddenSet(s.chapters) : { hidden: new Set(), hiddenCount: {} };
  const chapters = s.chapters.filter((c) => !hidden.has(c.id));

  const childCount = {};
  s.chapters.forEach((c) => (c.choices || []).forEach((ch) => {
    if (ch.targetId) childCount[c.id] = (childCount[c.id] || 0) + 1;
  }));

  const activeId = s.lastReadChapterId;
  const nodes = chapters.map((c) => {
    const i = s.chapters.indexOf(c);
    const isEnding = s.type === "cyoa" && (c.choices || []).length === 0;
    const hasChildren = s.type === "cyoa" && (childCount[c.id] || 0) > 0;
    let extras = "";
    if (hasChildren) {
      extras += `<g class="map-node-chevron" data-toggle="${c.id}" transform="translate(-22,-14)">
        <circle r="9"></circle>
        <text x="0" y="3.5" text-anchor="middle">${c.collapsed ? "+" : "–"}</text>
      </g>`;
    }
    if (c.collapsed && hiddenCount[c.id]) {
      extras += `<g class="map-node-badge" transform="translate(18,-16)">
        <circle r="8"></circle>
        <text x="0" y="3" text-anchor="middle">${hiddenCount[c.id]}</text>
      </g>`;
    }
    return `<g class="map-node ${c.id === activeId ? "map-node--active" : ""} ${isEnding ? "map-node--cyoa-end" : ""}" data-id="${c.id}" transform="translate(${c.x},${c.y})">
      <circle class="pin" r="18"></circle>
      <text class="num" x="0" y="5" text-anchor="middle">${i + 1}</text>
      <text class="label" x="0" y="34" text-anchor="middle">${escapeHtml(truncate(c.title, 14))}</text>
      ${extras}
    </g>`;
  }).join("");

  viewport.innerHTML = buildPathsHTML(s, chapters, connectMode) + nodes;
  wirePathDeletion(viewport, s, mode);
  wireChevrons(viewport, s, mode);

  viewport.querySelectorAll(".map-node").forEach((g) => {
    let moved = false, connectFrom = null, tempLine = null, active = false;
    let branchMembers = null, branchStart = null, dragStartPt = null;

    g.addEventListener("pointerdown", (e) => {
      if (e.target.closest(".map-node-chevron")) return;
      e.stopPropagation();
      active = true; moved = false;
      g.setPointerCapture(e.pointerId);
      g.classList.add("dragging");
      if (connectMode) {
        connectFrom = chapters.find((c) => c.id === g.dataset.id);
        tempLine = document.createElementNS("http://www.w3.org/2000/svg", "path");
        tempLine.setAttribute("class", "map-path map-path--drawing");
        viewport.appendChild(tempLine);
      } else if (branchMode) {
        const chapter = s.chapters.find((c) => c.id === g.dataset.id);
        branchMembers = [chapter, ...collectDescendants(chapter, s.chapters)];
        branchStart = branchMembers.map((c) => ({ id: c.id, x: c.x, y: c.y }));
        dragStartPt = svgPoint(viewport, e.clientX, e.clientY);
      }
    });

    g.addEventListener("pointermove", (e) => {
      if (!active) return;
      moved = true;
      const pt = svgPoint(viewport, e.clientX, e.clientY);
      if (connectMode && connectFrom) {
        tempLine.setAttribute("d", pathData(connectFrom, { x: pt.x, y: pt.y }, 26));
        const hover = findNodeNear(chapters, pt, connectFrom.id);
        viewport.querySelectorAll(".map-node--hover-target").forEach((n) => n.classList.remove("map-node--hover-target"));
        if (hover) viewport.querySelector(`.map-node[data-id="${hover.id}"]`)?.classList.add("map-node--hover-target");
      } else if (branchMode && branchMembers) {
        const dx = pt.x - dragStartPt.x, dy = pt.y - dragStartPt.y;
        branchMembers.forEach((c, i) => {
          c.x = branchStart[i].x + dx;
          c.y = branchStart[i].y + dy;
          const el = viewport.querySelector(`.map-node[data-id="${c.id}"]`);
          if (el) el.setAttribute("transform", `translate(${c.x},${c.y})`);
        });
        redrawPaths(viewport, s, chapters, connectMode);
      } else {
        const chapter = s.chapters.find((c) => c.id === g.dataset.id);
        chapter.x = pt.x;
        chapter.y = pt.y;
        g.setAttribute("transform", `translate(${chapter.x},${chapter.y})`);
        redrawPaths(viewport, s, chapters, connectMode);
      }
    });

    g.addEventListener("pointerup", (e) => {
      if (!active) return;
      active = false;
      g.classList.remove("dragging");
      g.releasePointerCapture(e.pointerId);

      if (connectMode && connectFrom) {
        const pt = svgPoint(viewport, e.clientX, e.clientY);
        const target = moved ? findNodeNear(chapters, pt, connectFrom.id) : null;
        tempLine?.remove();
        viewport.querySelectorAll(".map-node--hover-target").forEach((n) => n.classList.remove("map-node--hover-target"));
        if (target) {
          const text = prompt("Choice text (what the reader taps):", "Continue");
          if (text !== null) {
            connectFrom.choices = connectFrom.choices || [];
            connectFrom.choices.push({ id: uid(), text: text.trim() || "Continue", targetId: target.id });
            markDirty();
            drawMap(mode);
          }
        } else if (!moved) {
          navigate(mode === "edit" ? `#/story/${s.id}/edit?chapter=${connectFrom.id}` : `#/story/${s.id}/read?chapter=${connectFrom.id}`);
        }
        connectFrom = null; tempLine = null;
        return;
      }
      if (branchMode && branchMembers) {
        if (moved) markDirty();
        else {
          const id = g.dataset.id;
          navigate(mode === "edit" ? `#/story/${s.id}/edit?chapter=${id}` : `#/story/${s.id}/read?chapter=${id}`);
        }
        branchMembers = null; branchStart = null; dragStartPt = null;
        return;
      }
      if (moved) { markDirty(); }
      else {
        const id = g.dataset.id;
        navigate(mode === "edit" ? `#/story/${s.id}/edit?chapter=${id}` : `#/story/${s.id}/read?chapter=${id}`);
      }
    });
  });
}

function wireChevrons(viewport, s, mode) {
  viewport.querySelectorAll(".map-node-chevron").forEach((chev) => {
    chev.addEventListener("pointerdown", (e) => e.stopPropagation());
    chev.addEventListener("pointerup", (e) => e.stopPropagation());
    chev.addEventListener("click", (e) => {
      e.stopPropagation();
      const chapter = s.chapters.find((c) => c.id === chev.dataset.toggle);
      if (!chapter) return;
      chapter.collapsed = !chapter.collapsed;
      markDirty();
      drawMap(mode);
    });
  });
}

function findNodeNear(chapters, pt, excludeId) {
  const R = 26;
  let best = null, bestDist = R;
  chapters.forEach((c) => {
    if (c.id === excludeId) return;
    const d = Math.hypot(c.x - pt.x, c.y - pt.y);
    if (d < bestDist) { bestDist = d; best = c; }
  });
  return best;
}

function wirePathDeletion(viewport, s, mode) {
  viewport.querySelectorAll(".map-path-hit").forEach((hit) => {
    hit.addEventListener("pointerdown", (e) => e.stopPropagation());
    hit.addEventListener("pointerup", (e) => {
      e.stopPropagation();
      const from = s.chapters.find((c) => c.id === hit.dataset.from);
      if (!from) return;
      if (!confirm("Remove this path?")) return;
      from.choices = (from.choices || []).filter((ch) => ch.id !== hit.dataset.choice);
      markDirty();
      drawMap(mode);
    });
  });
}

function truncate(str, n) { return (str || "").length > n ? str.slice(0, n - 1) + "…" : (str || ""); }
function svgPoint(el, cx, cy) {
  const root = el.ownerSVGElement || el;
  const pt = root.createSVGPoint();
  pt.x = cx; pt.y = cy;
  const ctm = el.getScreenCTM().inverse();
  return pt.matrixTransform(ctm);
}

/* ---------- init ---------- */
async function init() {
  applyTextScale(currentTextScale());
  await refreshLibraryCache();
  route();
  if ("serviceWorker" in navigator) {
    let controllerChanged = false;
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (controllerChanged) return;
      controllerChanged = true;
      showUpdateBanner();
    });
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then(() => navigator.serviceWorker.ready)
        .then(() => {
          const seen = localStorage.getItem("waypoint-offline-ready");
          if (!seen) {
            localStorage.setItem("waypoint-offline-ready", "1");
            toast("Ready to use offline");
          }
        })
        .catch((err) => {
          console.warn("[waypoint] service worker registration failed — offline mode won't work:", err);
        });
    });
  } else {
    console.warn("[waypoint] this browser has no service worker support — offline mode won't work.");
  }
}
init();

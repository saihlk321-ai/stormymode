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
function renderTokensHTML(text, story) {
  const chars = story.characters || [];
  const src = text || "";
  const re = tokenRegex();
  let out = "", lastIndex = 0, m;
  while ((m = re.exec(src))) {
    out += escapeHtml(src.slice(lastIndex, m.index));
    const c = resolveCharacterToken(m[1], chars);
    out += c ? `<span class="reader-token">${escapeHtml(c.name)}</span>` : `<span class="reader-token">[deleted]</span>`;
    lastIndex = re.lastIndex;
  }
  out += escapeHtml(src.slice(lastIndex));
  return out;
}

/* ---------- IndexedDB ---------- */
const DB_NAME = "waypoint-db", DB_VERSION = 1, STORE = "stories";
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function dbGetAll() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}
async function dbGet(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE, "readonly").objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}
async function dbPut(story) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(story);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
async function dbDelete(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/* ---------- model factories ---------- */
function makeChapter(title, x, y) {
  return { id: uid(), title: title || "Untitled chapter", text: "", x, y, choices: [] };
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
    chapters: [ch],
  };
}

/* ---------- app state ---------- */
const state = { current: null, drawerOpen: false, saveTimer: null };
const app = document.getElementById("app");

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
  if (ind) ind.innerHTML = `<i></i> saved`;
}, 450);

function markDirty() {
  const ind = document.querySelector(".save-indicator");
  if (ind) ind.innerHTML = `<i style="background:var(--gold)"></i> saving…`;
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
    normalizeStory(s);
    state.current = s;
  }
  if (r.view === "edit") return renderEditor(r.chapterId);
  if (r.view === "read") return renderReader(r.chapterId);
  if (r.view === "map") return renderMap(r.mode || "read");
  renderLibrary();
}

function normalizeStory(s) {
  s.characters = s.characters || [];
  s.chapters = s.chapters || [];
  s.chapters.forEach((c, i) => {
    if (typeof c.x !== "number") c.x = 120 + (i % 4) * 150;
    if (typeof c.y !== "number") c.y = 120 + Math.floor(i / 4) * 150;
    c.choices = c.choices || [];
  });
}

/* ================= LIBRARY ================= */
async function renderLibrary() {
  const stories = (await dbGetAll()).sort((a, b) => b.updatedAt - a.updatedAt);
  app.innerHTML = `
    <div class="topbar">
      <div class="topbar__title">Waypoint</div>
      <div class="topbar__actions">
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
          ${stories.map(storyCardHTML).join("")}
        </div>`}
    </div>
    <div class="fab-row">
      <button class="btn btn--primary btn--block" id="btnNew">${ICON.plus} New story</button>
    </div>
    <input type="file" id="importFile" accept="application/json" style="display:none">
  `;
  document.getElementById("btnNew").onclick = () => openNewStoryModal();
  document.getElementById("btnImport").onclick = () => document.getElementById("importFile").click();
  document.getElementById("importFile").onchange = handleImportFile;
  app.querySelectorAll("[data-open]").forEach((el) => el.addEventListener("click", () => navigate(`#/story/${el.dataset.open}/read`)));
  app.querySelectorAll("[data-editcard]").forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); navigate(`#/story/${el.dataset.editcard}/edit`); }));
  app.querySelectorAll("[data-export]").forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); exportStoryById(el.dataset.export); }));
  app.querySelectorAll("[data-delete]").forEach((el) => el.addEventListener("click", (e) => { e.stopPropagation(); deleteStoryCard(el.dataset.delete); }));
}

function storyCardHTML(s) {
  const words = wordCount(s);
  return `
    <div class="storycard storycard--${s.type}" data-open="${s.id}">
      <div class="storycard__badge">${s.type === "cyoa" ? "Choose your adventure" : "Story"} · ${s.chapters.length} ch</div>
      <div class="storycard__title">${escapeHtml(s.title)}</div>
      <div class="storycard__meta"><span>${words} words</span><span>${formatDate(s.updatedAt)}</span></div>
      <div class="storycard__actions">
        <button class="btn btn--sm" data-editcard="${s.id}">Edit</button>
        <button class="btn btn--sm btn--ghost" data-export="${s.id}" title="Export as file">${ICON.download}</button>
        <button class="btn btn--sm btn--ghost" data-delete="${s.id}" title="Delete">${ICON.trash}</button>
      </div>
    </div>`;
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
  const blob = new Blob([JSON.stringify(s, null, 2)], { type: "application/json" });
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

/* ================= DRAWER (characters) ================= */
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
function openDrawer() {
  ensureDrawerShell();
  state.drawerOpen = true;
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
  const s = state.current;
  const drawer = document.querySelector(".drawer");
  drawer.innerHTML = `
    <div class="drawer__header">
      <h3>${ICON.people} Characters</h3>
      <p>Rename anyone — every mention updates across the whole story.</p>
    </div>
    <div class="drawer__body" id="charList"></div>
    <div class="drawer__footer">
      <button class="btn btn--block" id="addChar">${ICON.plus} Add character</button>
    </div>`;
  const list = drawer.querySelector("#charList");
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
        <button class="char-del" data-id="${c.id}" title="Remove character">${ICON.x}</button>`;
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
  list.querySelectorAll(".char-del").forEach((btn) => {
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
function refreshUnderlyingTextIfVisible() {
  const r = parseHash();
  if (r.view === "read") renderReaderBody();
  if (r.view === "edit") renderTokenToolbar();
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
        <span class="save-indicator"><i></i> saved</span>
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
  document.getElementById("btnChars").onclick = openDrawer;
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

  m.innerHTML = `
    <label class="field-label">Chapter title</label>
    <input class="chapter-title-input" id="chTitle" value="${escapeHtml(chapter.title)}">

    <label class="field-label">Insert a character name</label>
    <div class="token-toolbar" id="tokenToolbar"></div>

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
  const textarea = document.getElementById("chText");
  textarea.addEventListener("input", (e) => { chapter.text = e.target.value; markDirty(); });

  renderTokenToolbar(textarea);

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
        <button class="topbar__icon-btn" id="btnChars" title="Characters">${ICON.people}</button>
        <button class="topbar__icon-btn" id="btnMap" title="Story map">${ICON.map}</button>
      </div>
    </div>
    <div class="reader-wrap"><div class="reader-page" id="readerPage"></div></div>`;

  document.getElementById("btnBack").onclick = () => navigate("#/");
  document.getElementById("btnChars").onclick = openDrawer;
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

  page.innerHTML = `
    <div class="reader-eyebrow">${s.type === "cyoa" ? "Choose your adventure" : `Chapter ${idx + 1} of ${s.chapters.length}`}</div>
    <h1 class="reader-title">${escapeHtml(chapter.title)}</h1>
    <div class="reader-body">${renderTokensHTML(chapter.text, s) || `<span style="color:var(--ink-faint)">This chapter is empty so far.</span>`}</div>
    ${navHTML}
  `;
  page.querySelectorAll("[data-goto]").forEach((btn) => {
    btn.onclick = () => navigate(`#/story/${s.id}/read?chapter=${btn.dataset.goto}`);
  });
  page.scrollTop = 0;
  document.querySelector(".reader-wrap")?.scrollTo?.(0, 0);
}

/* ================= MAP ================= */
function renderMap(mode) {
  const s = state.current;
  app.innerHTML = `
    <div class="topbar">
      <button class="topbar__icon-btn" id="btnBack">${ICON.back}</button>
      <div class="topbar__title">${escapeHtml(s.title)} · map</div>
      <div class="topbar__actions">
        <button class="topbar__icon-btn" id="btnChars" title="Characters">${ICON.people}</button>
      </div>
    </div>
    <div class="map-wrap" id="mapWrap">
      <svg class="map-svg" id="mapSvg" xmlns="http://www.w3.org/2000/svg"></svg>
      <div class="map-legend">
        ${s.type === "cyoa"
          ? `<span><i style="background:var(--paper-dark);border:2px solid var(--teal)"></i> chapter</span><span><i style="background:var(--paper-dark);border:2px solid var(--gold)"></i> ending</span><span>tap a waypoint to jump</span>`
          : `<span><i style="background:var(--teal)"></i> reading order</span><span>drag to rearrange · tap to jump</span>`}
      </div>
    </div>`;
  document.getElementById("btnBack").onclick = () => navigate(mode === "edit" ? `#/story/${s.id}/edit` : `#/story/${s.id}/read`);
  document.getElementById("btnChars").onclick = openDrawer;
  drawMap(mode);
}

function drawMap(mode) {
  const s = state.current;
  const svg = document.getElementById("mapSvg");
  const chapters = s.chapters;
  const maxX = Math.max(300, ...chapters.map((c) => c.x + 120));
  const maxY = Math.max(300, ...chapters.map((c) => c.y + 120));
  svg.setAttribute("viewBox", `0 0 ${maxX} ${maxY}`);

  let paths = "";
  if (s.type === "linear") {
    for (let i = 0; i < chapters.length - 1; i++) {
      const a = chapters[i], b = chapters[i + 1];
      paths += `<path class="map-path" d="M${a.x},${a.y} Q${(a.x + b.x) / 2},${(a.y + b.y) / 2 - 30} ${b.x},${b.y}"/>`;
    }
  } else {
    chapters.forEach((c) => {
      (c.choices || []).forEach((choice) => {
        const target = chapters.find((t) => t.id === choice.targetId);
        if (!target) return;
        paths += `<path class="map-path map-path--cyoa" d="M${c.x},${c.y} Q${(c.x + target.x) / 2},${(c.y + target.y) / 2 - 26} ${target.x},${target.y}"/>`;
      });
    });
  }

  const activeId = s.lastReadChapterId;
  const nodes = chapters.map((c, i) => {
    const isEnding = s.type === "cyoa" && (c.choices || []).length === 0;
    return `<g class="map-node ${c.id === activeId ? "map-node--active" : ""} ${isEnding ? "map-node--cyoa-end" : ""}" data-id="${c.id}" transform="translate(${c.x},${c.y})">
      <circle class="pin" r="18"></circle>
      <text class="num" x="0" y="5" text-anchor="middle">${i + 1}</text>
      <text class="label" x="0" y="34" text-anchor="middle">${escapeHtml(truncate(c.title, 14))}</text>
    </g>`;
  }).join("");

  svg.innerHTML = paths + nodes;

  let dragging = null, moved = false;
  svg.querySelectorAll(".map-node").forEach((g) => {
    g.addEventListener("pointerdown", (e) => {
      dragging = g; moved = false;
      g.setPointerCapture(e.pointerId);
    });
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    moved = true;
    const pt = svgPoint(svg, e.clientX, e.clientY);
    const chapter = chapters.find((c) => c.id === dragging.dataset.id);
    chapter.x = Math.max(30, pt.x);
    chapter.y = Math.max(30, pt.y);
    dragging.setAttribute("transform", `translate(${chapter.x},${chapter.y})`);
    redrawPaths(svg, s, chapters);
  });
  svg.addEventListener("pointerup", () => {
    if (dragging && moved) { markDirty(); }
    else if (dragging && !moved) {
      const id = dragging.dataset.id;
      navigate(mode === "edit" ? `#/story/${s.id}/edit?chapter=${id}` : `#/story/${s.id}/read?chapter=${id}`);
    }
    dragging = null;
  });
}
function truncate(str, n) { return (str || "").length > n ? str.slice(0, n - 1) + "…" : (str || ""); }
function svgPoint(svg, cx, cy) {
  const pt = svg.createSVGPoint();
  pt.x = cx; pt.y = cy;
  const ctm = svg.getScreenCTM().inverse();
  return pt.matrixTransform(ctm);
}
function redrawPaths(svg, s, chapters) {
  let paths = "";
  if (s.type === "linear") {
    for (let i = 0; i < chapters.length - 1; i++) {
      const a = chapters[i], b = chapters[i + 1];
      paths += `<path class="map-path" d="M${a.x},${a.y} Q${(a.x + b.x) / 2},${(a.y + b.y) / 2 - 30} ${b.x},${b.y}"/>`;
    }
  } else {
    chapters.forEach((c) => {
      (c.choices || []).forEach((choice) => {
        const target = chapters.find((t) => t.id === choice.targetId);
        if (!target) return;
        paths += `<path class="map-path map-path--cyoa" d="M${c.x},${c.y} Q${(c.x + target.x) / 2},${(c.y + target.y) / 2 - 26} ${target.x},${target.y}"/>`;
      });
    });
  }
  svg.querySelectorAll(".map-path").forEach((p) => p.remove());
  svg.insertAdjacentHTML("afterbegin", paths);
}

/* ---------- init ---------- */
function init() {
  route();
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}
init();

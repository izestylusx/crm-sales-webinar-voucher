const state = {
  docs: [],
  downloads: [],
  protection: false,
  current: null,
  notes: [],
};

const $ = (selector) => document.querySelector(selector);
const page = $('#page');

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

function showToast(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove('show'), 2800);
}

async function api(url, options = {}) {
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) };
  const token = localStorage.getItem('crm_docs_token');
  if (token) headers['X-Docs-Token'] = token;
  const response = await fetch(url, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `Request failed (${response.status})`);
  return payload;
}

function renderNav() {
  const nav = $('#doc-nav');
  nav.innerHTML = state.docs.map((doc, index) => `
    <a class="nav-item" data-slug="${doc.slug}" href="#/doc/${doc.slug}">
      <span class="nav-index">${String(index + 1).padStart(2, '0')}</span>
      <span class="nav-title">${escapeHtml(doc.title)}</span>
      ${doc.noteCount ? `<span class="nav-note">${doc.noteCount}</span>` : ''}
    </a>`).join('');
  $('#download-nav').innerHTML = state.downloads.map((file) => `
    <a class="download-item" href="/download/${file.id}">
      <span class="file-icon">↓</span><span>${escapeHtml(file.label)}</span>
    </a>`).join('');
}

function renderHome() {
  $('#crumb').textContent = 'Workspace / Overview';
  const cards = state.docs.slice(0, 6).map((doc) => `
    <a class="doc-card" href="#/doc/${doc.slug}">
      <div>
        <div class="doc-card-top"><span class="doc-card-eyebrow">${escapeHtml(doc.eyebrow)}</span><span class="status-pill">${escapeHtml(doc.status)}</span></div>
        <h3>${escapeHtml(doc.title)}</h3>
        <p>${escapeHtml(doc.description)}</p>
      </div>
      <div class="doc-card-foot"><span>Updated ${formatDate(doc.updatedAt)}</span><span class="note-badge">${doc.noteCount ? `${doc.noteCount} note${doc.noteCount > 1 ? 's' : ''}` : 'Add a note'} →</span></div>
    </a>`).join('');
  page.innerHTML = `
    <div class="hero">
      <div class="eyebrow">Sales enablement workspace</div>
      <h1>Satu ruang untuk menyelaraskan CRM, webinar, voucher, dan platform.</h1>
      <p>Dokumentasi hidup untuk tim product, engineering, sales operations, dan finance. Baca rancangan, tandai bagian yang perlu diperbaiki, lalu lanjutkan diskusi di halaman yang sama.</p>
      <div class="hero-meta"><span><b>Last refreshed</b> ${formatDate(new Date().toISOString())}</span><span><b>Primary user</b> Salesperson</span><span><b>Mode</b> MVP baseline</span></div>
    </div>
    <div class="dashboard-grid">
      <section class="panel panel-pad">
        <div class="panel-kicker">System view</div>
        <h2>Commercial layer, clearly bounded.</h2>
        <p class="panel-copy">CRM mengorkestrasi aktivitas sales. Platform dan billing tetap menjadi pemilik identity, entitlement, invoice, dan payment.</p>
        <div class="system-map">
          <div class="map-node primary"><small>Primary user</small><strong>Salesperson</strong></div><div class="map-arrow"></div><div class="map-node accent"><small>System of work</small><strong>CRM</strong></div>
          <div class="map-node teal"><small>Fulfillment</small><strong>Education platform</strong></div><div class="map-arrow"></div><div class="map-node"><small>Financial truth</small><strong>Billing / payment</strong></div>
        </div>
        <div class="stat-row"><div class="stat"><strong>${state.docs.length}</strong><span>living documents</span></div><div class="stat"><strong>${state.docs.reduce((n, doc) => n + doc.noteCount, 0)}</strong><span>open notes</span></div><div class="stat"><strong>2</strong><span>conversion funnels</span></div></div>
      </section>
      <aside class="panel panel-pad">
        <div class="panel-kicker">Review path</div>
        <h2>Mulai dari sini.</h2>
        <p class="panel-copy">Baca keputusan besar dulu, baru masuk ke flow dan contract.</p>
        <div class="progress-list"><div class="progress-item"><span class="progress-number">01</span><div><div class="progress-title">Executive Brief</div><div class="progress-sub">Apa yang sedang kita bangun?</div></div><span class="progress-status">start</span></div><div class="progress-item"><span class="progress-number">02</span><div><div class="progress-title">MVP Scope & Flows</div><div class="progress-sub">Bagaimana individu dan sekolah berbeda?</div></div><span class="progress-status">flow</span></div><div class="progress-item"><span class="progress-number">03</span><div><div class="progress-title">API & Webhooks</div><div class="progress-sub">Bagaimana sistem saling berbicara?</div></div><span class="progress-status">build</span></div></div>
      </aside>
    </div>
    <div class="section-heading"><div class="eyebrow">Document shelf</div><h2>Core docs</h2></div>
    <div class="doc-cards">${cards}</div>`;
  updateActiveNav('');
}

function renderSearch(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return renderHome();
  const matches = state.docs.filter((doc) => doc.searchText.includes(normalized));
  $('#crumb').textContent = `Workspace / Search / ${query}`;
  page.innerHTML = `<div class="hero"><div class="eyebrow">Search results</div><h1>Menemukan “${escapeHtml(query)}”</h1><p>${matches.length} dokumen relevan dalam workspace.</p><div class="search-results">${matches.length ? matches.map((doc) => `<a class="search-result" href="#/doc/${doc.slug}"><small>${escapeHtml(doc.eyebrow)} · ${escapeHtml(doc.status)}</small><h3>${escapeHtml(doc.title)}</h3><p>${escapeHtml(doc.excerpt)}...</p></a>`).join('') : '<div class="panel panel-pad"><p class="panel-copy">Belum ada dokumen yang cocok. Coba kata lain seperti <code>voucher</code>, <code>school</code>, atau <code>webhook</code>.</p></div>'}</div></div>`;
  updateActiveNav('');
}

async function renderDoc(slug) {
  const doc = await api(`/api/docs/${encodeURIComponent(slug)}`);
  state.current = doc;
  const manifest = state.docs.find((item) => item.slug === slug);
  $('#crumb').textContent = `Workspace / ${doc.title}`;
  page.innerHTML = `<div class="doc-header"><div><div class="eyebrow">${escapeHtml(doc.eyebrow)} · ${escapeHtml(doc.status || manifest?.status || 'Draft')}</div><h1>${escapeHtml(doc.title)}</h1><p class="doc-description">${escapeHtml(doc.description)}</p></div><div class="doc-actions"><button class="button-quiet" id="home-button">← Overview</button><a class="button-primary" href="/download/source-${encodeURIComponent(doc.slug)}">Download Markdown</a></div></div><div class="doc-body-grid"><article class="markdown-body">${doc.html}</article><aside id="notes-panel" class="notes-panel"></aside></div>`;
  updateActiveNav(slug);
  await loadNotes(slug);
  if (window.mermaid) {
    window.mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: { primaryColor: '#fae4dc', primaryTextColor: '#17213b', primaryBorderColor: '#e2674d', lineColor: '#6c7381', secondaryColor: '#dceee9', tertiaryColor: '#f0eee7', fontFamily: 'DM Sans' } });
    await window.mermaid.run({ querySelector: '.mermaid' }).catch(() => {});
  }
  $('#home-button').addEventListener('click', () => { window.location.hash = ''; });
}

function updateActiveNav(slug) {
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.slug === slug));
}

async function loadNotes(slug) {
  const data = await api(`/api/notes/${encodeURIComponent(slug)}`);
  state.notes = data.notes;
  const panel = $('#notes-panel');
  panel.innerHTML = `<div class="notes-title"><h2>Team notes</h2><span class="notes-count">${state.notes.filter((note) => !note.resolved).length} open</span></div><p class="notes-help">Tinggalkan konteks, pertanyaan, atau usulan perubahan di halaman yang sedang dibaca.</p><form class="note-form" id="note-form"><input id="note-author" maxlength="80" placeholder="Nama kamu" value="${escapeHtml(localStorage.getItem('crm_docs_author') || '')}" required /><textarea id="note-body" maxlength="4000" placeholder="Apa yang perlu kita cek?" required></textarea><button class="button-primary" type="submit">Add note</button></form><div class="notes-list">${state.notes.length ? state.notes.map((note) => `<div class="note ${note.resolved ? 'resolved' : ''}"><div class="note-meta"><span>${escapeHtml(note.author)}</span><span>${formatDate(note.createdAt)}</span></div><div class="note-body">${escapeHtml(note.body)}</div><button class="note-resolve" data-note-id="${note.id}" data-resolved="${!note.resolved}">${note.resolved ? 'Re-open note' : 'Mark resolved'}</button></div>`).join('') : '<div class="empty-notes">Belum ada notes. Jadilah reviewer pertama di halaman ini.</div>'}</div>`;
  $('#note-form').addEventListener('submit', submitNote);
  panel.querySelectorAll('.note-resolve').forEach((button) => button.addEventListener('click', () => toggleNote(button.dataset.noteId, button.dataset.resolved === 'true')));
}

async function submitNote(event) {
  event.preventDefault();
  const author = $('#note-author').value.trim();
  const body = $('#note-body').value.trim();
  localStorage.setItem('crm_docs_author', author);
  try {
    await api(`/api/notes/${encodeURIComponent(state.current.slug)}`, { method: 'POST', body: JSON.stringify({ author, body }) });
    showToast('Note added to this document.');
    await loadNotes(state.current.slug);
    await refreshManifest();
  } catch (error) {
    if (error.message.includes('token')) return askForToken(error.message);
    showToast(error.message);
  }
}

async function toggleNote(noteId, resolved) {
  try {
    await api(`/api/notes/${encodeURIComponent(state.current.slug)}/${encodeURIComponent(noteId)}`, { method: 'PATCH', body: JSON.stringify({ resolved }) });
    showToast(resolved ? 'Note marked resolved.' : 'Note re-opened.');
    await loadNotes(state.current.slug);
    await refreshManifest();
  } catch (error) {
    if (error.message.includes('token')) return askForToken(error.message);
    showToast(error.message);
  }
}

function askForToken(message = 'Edit access required') {
  const token = window.prompt(`${message}\n\nMasukkan edit token untuk workspace ini:`);
  if (token) {
    localStorage.setItem('crm_docs_token', token);
    showToast('Token disimpan di browser ini. Coba lagi.');
  }
}

async function refreshManifest() {
  const data = await api('/api/docs');
  state.docs = data.docs;
  renderNav();
}

function route() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('doc/')) return renderDoc(hash.slice(4)).catch((error) => { page.innerHTML = `<div class="panel panel-pad"><h2>Document unavailable</h2><p class="panel-copy">${escapeHtml(error.message)}</p></div>`; });
  renderSearch($('#search-input').value);
}

async function init() {
  const data = await api('/api/docs');
  state.docs = data.docs;
  state.downloads = data.downloads;
  state.protection = data.editProtection;
  renderNav();
  $('#search-input').addEventListener('input', () => { if (!window.location.hash) renderSearch($('#search-input').value); });
  $('#search-input').addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.target.value = ''; renderHome(); } });
  $('#token-button').addEventListener('click', () => askForToken('Workspace edit access'));
  $('#menu-button').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  document.addEventListener('click', (event) => { if (event.target.closest('.nav-item')) $('#sidebar').classList.remove('open'); });
  window.addEventListener('hashchange', route);
  route();
}

init().catch((error) => { page.innerHTML = `<div class="panel panel-pad"><h2>Workspace unavailable</h2><p class="panel-copy">${escapeHtml(error.message)}</p></div>`; });

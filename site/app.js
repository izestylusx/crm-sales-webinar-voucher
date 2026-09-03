const state = {
  docs: window.DOCS || [],
  downloads: window.DOWNLOADS || [],
  current: null,
};

const $ = (selector) => document.querySelector(selector);
const page = $('#page');
const config = window.SITE_CONFIG || { repo: '' };

function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function formatDate(iso) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(iso));
}

function inlineMarkdown(value) {
  let html = escapeHtml(value);
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const safeHref = href.startsWith('http') ? href : href.replace(/^\.\/?/, '');
    if (safeHref.endsWith('.md')) {
      const target = state.docs.find((doc) => doc.file === safeHref || doc.file.endsWith('/' + safeHref));
      return `<a href="#/doc/${target ? target.slug : ''}">${label}</a>`;
    }
    return `<a href="${escapeHtml(safeHref)}" target="_blank" rel="noreferrer">${label}</a>`;
  });
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return html;
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)+\|?\s*$/.test(line);
}

function parseTableRow(line) {
  return line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
}

function markdownToHtml(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let inCode = false;
  let codeLang = '';
  let codeLines = [];
  let paragraph = [];
  let listType = null;
  const flushParagraph = () => { if (paragraph.length) { out.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`); paragraph = []; } };
  const closeList = () => { if (listType) { out.push(`</${listType}>`); listType = null; } };
  const closeBlocks = () => { flushParagraph(); closeList(); };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      if (!inCode) {
        closeBlocks(); inCode = true; codeLang = line.trim().slice(3).trim(); codeLines = [];
      } else {
        const raw = escapeHtml(codeLines.join('\n'));
        if (codeLang === 'mermaid') out.push(`<div class="mermaid-wrap"><div class="mermaid">${raw}</div><details><summary>Show diagram source</summary><pre><code>${raw}</code></pre></details></div>`);
        else out.push(`<pre><code class="language-${escapeHtml(codeLang)}">${raw}</code></pre>`);
        inCode = false; codeLang = '';
      }
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }
    if (!line.trim()) { closeBlocks(); continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) { closeBlocks(); const level = heading[1].length; out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`); continue; }
    if (/^>\s?/.test(line)) { closeBlocks(); out.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ''))}</blockquote>`); continue; }
    if (/^\|.*\|$/.test(line) && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
      closeBlocks();
      const headers = parseTableRow(line); i += 1; const rows = [];
      while (i + 1 < lines.length && /^\|.*\|$/.test(lines[i + 1]) && !isTableDivider(lines[i + 1])) { i += 1; rows.push(parseTableRow(lines[i])); }
      const head = headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join('');
      const body = rows.map((row) => `<tr>${headers.map((_, idx) => `<td>${inlineMarkdown(row[idx] || '')}</td>`).join('')}</tr>`).join('');
      out.push(`<div class="table-scroll"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`);
      continue;
    }
    const bullet = line.match(/^\s*[-*]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+\.\s+(.+)$/);
    if (bullet || ordered) {
      flushParagraph();
      const desired = ordered ? 'ol' : 'ul';
      if (listType !== desired) { closeList(); listType = desired; out.push(`<${listType}>`); }
      out.push(`<li>${inlineMarkdown((bullet || ordered)[1])}</li>`);
      continue;
    }
    closeList(); paragraph.push(line.trim());
  }
  if (inCode) out.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  closeBlocks();
  return out.join('\n');
}

function updateActiveNav(slug) {
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('active', item.dataset.slug === slug));
}

function downloadPathForDoc(doc) {
  const file = state.downloads.find((item) => item.source === doc.file);
  return file ? file.path : `downloads/${doc.file}`;
}

function renderNav() {
  $('#doc-nav').innerHTML = state.docs.map((doc, index) => `<a class="nav-item" data-slug="${doc.slug}" href="#/doc/${doc.slug}"><span class="nav-index">${String(index + 1).padStart(2, '0')}</span><span class="nav-title">${escapeHtml(doc.title)}</span></a>`).join('');
  $('#download-nav').innerHTML = state.downloads.map((file) => `<a class="download-item" href="${file.path}"><span class="file-icon">↓</span><span>${escapeHtml(file.label)}</span></a>`).join('');
}

function renderHome() {
  document.title = 'Webinar MVP Workspace';
  $('#crumb').textContent = 'Workspace / Overview';
  const cards = state.docs.slice(0, 6).map((doc) => `<a class="doc-card" href="#/doc/${doc.slug}"><div><div class="doc-card-top"><span class="doc-card-eyebrow">${escapeHtml(doc.eyebrow)}</span><span class="status-pill">${escapeHtml(doc.status)}</span></div><h3>${escapeHtml(doc.title)}</h3><p>${escapeHtml(doc.description)}</p></div><div class="doc-card-foot"><span>Updated ${formatDate(doc.updatedAt)}</span><span class="note-badge">Discuss on GitHub →</span></div></a>`).join('');
  page.innerHTML = `<div class="hero"><div class="eyebrow">Sales webinar workspace</div><h1>Satu ruang untuk merancang Webinar-first MVP.</h1><p>Dokumentasi hidup untuk tim product, engineering, dan sales operations. Scope aktif berhenti pada booking, reminder, attendance, dan follow-up; voucher serta payment dipindahkan ke post-MVP.</p><div class="hero-meta"><span><b>Last refreshed</b> ${formatDate(config.generatedAt || new Date().toISOString())}</span><span><b>Primary user</b> Salesperson</span><span><b>Mode</b> Webinar-first MVP</span></div></div><div class="dashboard-grid"><section class="panel panel-pad"><div class="panel-kicker">Active system view</div><h2>Webinar journey, tightly scoped.</h2><p class="panel-copy">CRM mengelola sesi, public booking, reminder, attendance, dan follow-up. Platform pendidikan dan billing tidak menjadi dependency runtime MVP.</p><div class="system-map"><div class="map-node primary"><small>Primary user</small><strong>Salesperson</strong></div><div class="map-arrow"></div><div class="map-node accent"><small>System of work</small><strong>Webinar CRM</strong></div><div class="map-node teal"><small>Public flow</small><strong>Booking</strong></div><div class="map-arrow"></div><div class="map-node"><small>Outcome</small><strong>Follow-up</strong></div></div><div class="stat-row"><div class="stat"><strong>${state.docs.length}</strong><span>living documents</span></div><div class="stat"><strong>Git</strong><span>versioned source</span></div><div class="stat"><strong>1</strong><span>active MVP journey</span></div></div></section><aside class="panel panel-pad"><div class="panel-kicker">Review path</div><h2>Mulai dari sini.</h2><p class="panel-copy">Kunci scope dulu, lalu review flow dan kontrak booking.</p><div class="progress-list"><div class="progress-item"><span class="progress-number">01</span><div><div class="progress-title">Executive Brief</div><div class="progress-sub">Apa yang masuk dan dipending?</div></div><span class="progress-status">start</span></div><div class="progress-item"><span class="progress-number">02</span><div><div class="progress-title">Webinar MVP Flows</div><div class="progress-sub">Bagaimana booking sampai follow-up?</div></div><span class="progress-status">flow</span></div><div class="progress-item"><span class="progress-number">03</span><div><div class="progress-title">API & Events</div><div class="progress-sub">Apa kontrak minimum yang dibangun?</div></div><span class="progress-status">build</span></div></div></aside></div><div class="section-heading"><div class="eyebrow">Document shelf</div><h2>Core docs</h2></div><div class="doc-cards">${cards}</div>`;
  updateActiveNav('');
}

function renderSearch(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return renderHome();
  const matches = state.docs.filter((doc) => `${doc.title} ${doc.description} ${doc.markdown}`.toLowerCase().includes(normalized));
  $('#crumb').textContent = `Workspace / Search / ${query}`;
  page.innerHTML = `<div class="hero"><div class="eyebrow">Search results</div><h1>Menemukan “${escapeHtml(query)}”</h1><p>${matches.length} dokumen relevan dalam workspace.</p><div class="search-results">${matches.length ? matches.map((doc) => `<a class="search-result" href="#/doc/${doc.slug}"><small>${escapeHtml(doc.eyebrow)} · ${escapeHtml(doc.status)}</small><h3>${escapeHtml(doc.title)}</h3><p>${escapeHtml(doc.description)}</p></a>`).join('') : '<div class="panel panel-pad"><p class="panel-copy">Belum ada dokumen yang cocok. Coba kata lain seperti <code>booking</code>, <code>attendance</code>, atau <code>reminder</code>.</p></div>'}</div></div>`;
  updateActiveNav('');
}

function githubDiscussion(slug, title) {
  const panel = document.createElement('aside');
  panel.className = 'notes-panel';
  if (!config.repo) {
    panel.innerHTML = `<div class="notes-title"><h2>Team notes</h2></div><p class="notes-help">Repository GitHub belum dikonfigurasi. Setelah repository dibuat, review notes akan tersimpan sebagai GitHub Issues.</p>`;
    return panel;
  }
  panel.innerHTML = `<div class="notes-title"><h2>Team notes</h2><span class="notes-count">GitHub</span></div><p class="notes-help">Komentar tampil langsung di halaman dan disimpan sebagai GitHub Issue thread.</p><div id="utterances-slot"></div><div class="github-note"><span class="status-dot"></span><span>Login GitHub diperlukan untuk berkomentar.</span></div>`;
  const script = document.createElement('script');
  script.src = 'https://utteranc.es/client.js';
  script.async = true;
  script.crossOrigin = 'anonymous';
  script.setAttribute('repo', config.repo);
  script.setAttribute('issue-term', 'title');
  script.setAttribute('theme', 'github-light');
  window.setTimeout(() => panel.querySelector('#utterances-slot')?.appendChild(script), 0);
  return panel;
}

function renderDoc(slug) {
  const doc = state.docs.find((item) => item.slug === slug);
  if (!doc) { page.innerHTML = '<div class="panel panel-pad"><h2>Document unavailable</h2><p class="panel-copy">Dokumen tidak ditemukan.</p></div>'; return; }
  state.current = doc;
  document.title = `Webinar MVP — ${doc.title}`;
  $('#crumb').textContent = `Workspace / ${doc.title}`;
  page.innerHTML = `<div class="doc-header"><div><div class="eyebrow">${escapeHtml(doc.eyebrow)} · ${escapeHtml(doc.status)}</div><h1>${escapeHtml(doc.title)}</h1><p class="doc-description">${escapeHtml(doc.description)}</p></div><div class="doc-actions"><button class="button-quiet" id="home-button">← Overview</button><a class="button-primary" href="${downloadPathForDoc(doc)}">Download Markdown</a></div></div><div class="doc-body-grid"><article class="markdown-body">${markdownToHtml(doc.markdown)}</article><div id="discussion-slot"></div></div>`;
  $('#discussion-slot').replaceWith(githubDiscussion(slug, doc.title));
  updateActiveNav(slug);
  if (window.mermaid) {
    window.mermaid.initialize({ startOnLoad: false, theme: 'base', themeVariables: { primaryColor: '#fae4dc', primaryTextColor: '#17213b', primaryBorderColor: '#e2674d', lineColor: '#6c7381', secondaryColor: '#dceee9', tertiaryColor: '#f0eee7', fontFamily: 'DM Sans' } });
    window.mermaid.run({ querySelector: '.mermaid' }).catch(() => {});
  }
  $('#home-button').addEventListener('click', () => { window.location.hash = ''; });
}

function route() {
  const hash = window.location.hash.replace(/^#\/?/, '');
  if (hash.startsWith('doc/')) return renderDoc(hash.slice(4));
  renderSearch($('#search-input').value);
}

function init() {
  renderNav();
  $('#search-input').addEventListener('input', () => { if (!window.location.hash) renderSearch($('#search-input').value); });
  $('#search-input').addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.target.value = ''; renderHome(); } });
  $('#menu-button').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#token-button').addEventListener('click', () => {
    if (config.repo) window.open(`https://github.com/${config.repo}/issues`, '_blank', 'noopener,noreferrer');
  });
  document.addEventListener('click', (event) => { if (event.target.closest('.nav-item')) $('#sidebar').classList.remove('open'); });
  window.addEventListener('hashchange', route);
  route();
}

init();

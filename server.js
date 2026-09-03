const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const crypto = require('crypto');
const { URL } = require('url');

const ROOT = __dirname;
const PORT = Number(process.env.PORT || 4173);
const EDIT_TOKEN = process.env.DOCS_EDIT_TOKEN || '';
const DATA_DIR = path.join(ROOT, 'data');
const NOTES_FILE = path.join(DATA_DIR, 'notes.json');

const docDefinitions = [
  { slug: 'executive-brief', title: 'Executive Brief', eyebrow: 'Start here', file: 'docs/00-executive-brief.md', section: 'Core docs', status: 'Baseline', description: 'Ringkasan keputusan, tujuan bisnis, dan batas MVP.' },
  { slug: 'architecture-vision', title: 'Architecture Vision', eyebrow: 'North star', file: 'docs/01-architecture-vision.md', section: 'Core docs', status: 'Baseline', description: 'Visi target, system boundary, context map, dan prinsip arsitektur.' },
  { slug: 'mvp-scope-and-flows', title: 'Webinar MVP Scope & Flows', eyebrow: 'Workflows', file: 'docs/02-mvp-scope-and-flows.md', section: 'Core docs', status: 'MVP', description: 'Booking, reminder, attendance, dan follow-up salesperson.' },
  { slug: 'domain-model-and-ownership', title: 'Domain Model & Ownership', eyebrow: 'Data', file: 'docs/03-domain-model-and-ownership.md', section: 'Core docs', status: 'Baseline', description: 'Entity webinar, capacity invariant, dan data ownership MVP.' },
  { slug: 'api-webhook-contracts', title: 'API & Event Contracts', eyebrow: 'Contract', file: 'docs/04-api-webhook-contracts.md', section: 'Core docs', status: 'Baseline', description: 'Kontrak booking, attendance, follow-up, dan event opsional.' },
  { slug: 'security-observability-and-operations', title: 'Security & Operations', eyebrow: 'Guardrails', file: 'docs/05-security-observability-and-operations.md', section: 'Core docs', status: 'Baseline', description: 'Public booking security, observability, reliability, dan runbook.' },
  { slug: 'delivery-roadmap-and-open-decisions', title: 'Roadmap & Open Decisions', eyebrow: 'Next', file: 'docs/06-delivery-roadmap-and-open-decisions.md', section: 'Core docs', status: 'Next', description: 'Tahapan delivery Webinar-first MVP dan keputusan terbuka.' },
  { slug: 'go-implementation-architecture', title: 'Go Implementation Architecture', eyebrow: 'Implementation', file: 'docs/07-go-implementation-architecture.md', section: 'Core docs', status: 'Accepted', description: 'Struktur Go untuk API, worker, PostgreSQL jobs, dan testing webinar.' },
  { slug: 'adr-system-boundaries', title: 'ADR: System Boundaries', eyebrow: 'Decision record', file: 'docs/adr/ADR-001-system-boundaries.md', section: 'References', status: 'Post-MVP guardrail', description: 'Boundary platform dan billing untuk fase setelah webinar MVP.' },
  { slug: 'adr-go-backend-architecture', title: 'ADR: Go Backend Architecture', eyebrow: 'Decision record', file: 'docs/adr/ADR-002-go-backend-architecture.md', section: 'References', status: 'Accepted', description: 'Keputusan modular monolith Go untuk Webinar-first MVP.' },
  { slug: 'adr-webinar-first-mvp', title: 'ADR: Webinar-first MVP', eyebrow: 'Scope decision', file: 'docs/adr/ADR-003-webinar-first-mvp.md', section: 'References', status: 'Accepted', description: 'Keputusan menunda voucher, payment, BOS, dan commission.' },
];

const downloads = [
  { id: 'docx', label: 'Download DOCX handoff', file: 'CRM-Architecture-Vision-MVP.docx', type: 'document' },
  { id: 'webinar-openapi', label: 'Webinar MVP OpenAPI YAML', file: 'contracts/webinar-openapi.yaml', type: 'contract' },
  { id: 'event-envelope', label: 'Event envelope JSON', file: 'contracts/event-envelope.json', type: 'contract' },
  { id: 'system-context', label: 'System context diagram', file: 'diagrams/system-context.mmd', type: 'diagram' },
  { id: 'go-module-architecture', label: 'Go module architecture diagram', file: 'diagrams/go-module-architecture.mmd', type: 'diagram' },
  { id: 'webinar-flow', label: 'Webinar MVP journey diagram', file: 'diagrams/webinar-flow.mmd', type: 'diagram' },
];

function json(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
  });
  res.end(body);
}

function send(res, status, body, contentType, extra = {}) {
  res.writeHead(status, { 'Content-Type': contentType, 'Content-Length': Buffer.byteLength(body), ...extra });
  res.end(body);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function inlineMarkdown(value) {
  let html = escapeHtml(value);
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const safeHref = href.startsWith('http') ? href : href.replace(/^\.\/?/, '');
    if (safeHref.endsWith('.md')) {
      const target = docDefinitions.find((doc) => doc.file === safeHref || doc.file.endsWith('/' + safeHref));
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

  function flushParagraph() {
    if (paragraph.length) {
      out.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  }
  function closeList() {
    if (listType) {
      out.push(`</${listType}>`);
      listType = null;
    }
  }
  function closeBlocks() {
    flushParagraph();
    closeList();
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim().startsWith('```')) {
      if (!inCode) {
        closeBlocks();
        inCode = true;
        codeLang = line.trim().slice(3).trim();
        codeLines = [];
      } else {
        const raw = escapeHtml(codeLines.join('\n'));
        if (codeLang === 'mermaid') {
          out.push(`<div class="mermaid-wrap"><div class="mermaid">${raw}</div><details><summary>Show diagram source</summary><pre><code>${raw}</code></pre></details></div>`);
        } else {
          out.push(`<pre><code class="language-${escapeHtml(codeLang)}">${raw}</code></pre>`);
        }
        inCode = false;
        codeLang = '';
      }
      continue;
    }
    if (inCode) {
      codeLines.push(line);
      continue;
    }
    if (!line.trim()) {
      closeBlocks();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      closeBlocks();
      const level = heading[1].length;
      out.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }
    if (/^>\s?/.test(line)) {
      closeBlocks();
      out.push(`<blockquote>${inlineMarkdown(line.replace(/^>\s?/, ''))}</blockquote>`);
      continue;
    }
    if (/^\|.*\|$/.test(line) && i + 1 < lines.length && isTableDivider(lines[i + 1])) {
      closeBlocks();
      const headers = parseTableRow(line);
      i += 1;
      const rows = [];
      while (i + 1 < lines.length && /^\|.*\|$/.test(lines[i + 1]) && !isTableDivider(lines[i + 1])) {
        i += 1;
        rows.push(parseTableRow(lines[i]));
      }
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
      if (listType !== desired) {
        closeList();
        listType = desired;
        out.push(`<${listType}>`);
      }
      out.push(`<li>${inlineMarkdown((bullet || ordered)[1])}</li>`);
      continue;
    }
    closeList();
    paragraph.push(line.trim());
  }
  if (inCode) {
    out.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  }
  closeBlocks();
  return out.join('\n');
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*`_|-]/g, ' ')
    .replace(/\[[^\]]+\]\([^)]+\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function readNotes() {
  try {
    return JSON.parse(await fsp.readFile(NOTES_FILE, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') return {};
    throw error;
  }
}

async function writeNotes(notes) {
  await fsp.mkdir(DATA_DIR, { recursive: true });
  const temp = `${NOTES_FILE}.${process.pid}.tmp`;
  await fsp.writeFile(temp, JSON.stringify(notes, null, 2), 'utf8');
  await fsp.rename(temp, NOTES_FILE);
}

async function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        req.destroy();
        reject(new Error('Request body too large'));
      }
    });
    req.on('end', () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch { reject(new Error('Invalid JSON')); }
    });
    req.on('error', reject);
  });
}

function authorized(req) {
  if (!EDIT_TOKEN) return true;
  return req.headers['x-docs-token'] === EDIT_TOKEN;
}

async function buildManifest() {
  const notes = await readNotes();
  const items = [];
  for (const definition of docDefinitions) {
    const markdown = await fsp.readFile(path.join(ROOT, definition.file), 'utf8');
    const itemNotes = notes[definition.slug] || [];
    items.push({
      ...definition,
      excerpt: stripMarkdown(markdown).slice(0, 180),
      searchText: `${definition.title} ${definition.description} ${stripMarkdown(markdown)}`.toLowerCase(),
      noteCount: itemNotes.filter((note) => !note.resolved).length,
      updatedAt: (await fsp.stat(path.join(ROOT, definition.file))).mtime.toISOString(),
    });
  }
  return items;
}

function safeDownload(id) {
  const file = downloads.find((item) => item.id === id);
  if (file) return { path: path.join(ROOT, file.file), downloadName: path.basename(file.file) };
  if (id.startsWith('source-')) {
    const slug = id.slice('source-'.length);
    const definition = docDefinitions.find((item) => item.slug === slug);
    if (definition) return { path: path.join(ROOT, definition.file), downloadName: path.basename(definition.file) };
  }
  return null;
}

async function requestHandler(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);
  try {
    if (pathname === '/api/docs' && req.method === 'GET') {
      return json(res, 200, { docs: await buildManifest(), downloads, editProtection: Boolean(EDIT_TOKEN) });
    }
    const docMatch = pathname.match(/^\/api\/docs\/([^/]+)$/);
    if (docMatch && req.method === 'GET') {
      const definition = docDefinitions.find((doc) => doc.slug === docMatch[1]);
      if (!definition) return json(res, 404, { error: 'Document not found' });
      const markdown = await fsp.readFile(path.join(ROOT, definition.file), 'utf8');
      return json(res, 200, { ...definition, markdown, html: markdownToHtml(markdown) });
    }
    const notesMatch = pathname.match(/^\/api\/notes\/([^/]+)$/);
    if (notesMatch && req.method === 'GET') {
      const notes = await readNotes();
      return json(res, 200, { notes: notes[notesMatch[1]] || [] });
    }
    if (notesMatch && req.method === 'POST') {
      if (!authorized(req)) return json(res, 401, { error: 'Edit token required' });
      const data = await readBody(req);
      const body = String(data.body || '').trim();
      const author = String(data.author || '').trim().slice(0, 80);
      if (!body || !author) return json(res, 400, { error: 'Author and note body are required' });
      const notes = await readNotes();
      const docNotes = notes[notesMatch[1]] || [];
      const note = { id: crypto.randomUUID(), author, body: body.slice(0, 4000), createdAt: new Date().toISOString(), resolved: false };
      notes[notesMatch[1]] = [note, ...docNotes];
      await writeNotes(notes);
      return json(res, 201, { note });
    }
    const noteMatch = pathname.match(/^\/api\/notes\/([^/]+)\/([^/]+)$/);
    if (noteMatch && req.method === 'PATCH') {
      if (!authorized(req)) return json(res, 401, { error: 'Edit token required' });
      const data = await readBody(req);
      const notes = await readNotes();
      const docNotes = notes[noteMatch[1]] || [];
      const note = docNotes.find((item) => item.id === noteMatch[2]);
      if (!note) return json(res, 404, { error: 'Note not found' });
      note.resolved = Boolean(data.resolved);
      await writeNotes(notes);
      return json(res, 200, { note });
    }
    const downloadMatch = pathname.match(/^\/download\/([^/]+)$/);
    if (downloadMatch && req.method === 'GET') {
      const filePath = safeDownload(downloadMatch[1]);
      if (!filePath) return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
      const stat = await fsp.stat(filePath.path);
      const buffer = await fsp.readFile(filePath.path);
      return send(res, 200, buffer, 'application/octet-stream', {
        'Content-Length': stat.size,
        'Content-Disposition': `attachment; filename="${filePath.downloadName}"`,
      });
    }
    if (pathname === '/' || pathname === '/index.html') {
      const html = await fsp.readFile(path.join(ROOT, 'public/index.html'));
      return send(res, 200, html, 'text/html; charset=utf-8');
    }
    const staticPath = pathname === '/styles.css' || pathname === '/app.js' ? path.join(ROOT, 'public', pathname.slice(1)) : null;
    if (staticPath) {
      const file = await fsp.readFile(staticPath);
      return send(res, 200, file, pathname.endsWith('.css') ? 'text/css; charset=utf-8' : 'application/javascript; charset=utf-8');
    }
    if (pathname === '/site' || pathname.startsWith('/site/')) {
      const relative = pathname === '/site' || pathname === '/site/' ? 'index.html' : pathname.slice('/site/'.length);
      const safeRelative = path.normalize(relative).replace(/^(\.\.(\\|\/|$))+/, '');
      const filePath = path.join(ROOT, 'site', safeRelative);
      if (!filePath.startsWith(path.join(ROOT, 'site'))) return send(res, 403, 'Forbidden', 'text/plain; charset=utf-8');
      const file = await fsp.readFile(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.yaml': 'text/yaml; charset=utf-8', '.yml': 'text/yaml; charset=utf-8' };
      return send(res, 200, file, types[ext] || 'application/octet-stream');
    }
    return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: 'Internal server error' });
  }
}

const server = http.createServer(requestHandler);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`CRM docs portal running at http://localhost:${PORT}`);
  if (EDIT_TOKEN) console.log('Edit protection enabled via DOCS_EDIT_TOKEN');
});

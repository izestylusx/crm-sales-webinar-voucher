const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const root = path.resolve(__dirname, '..');
const site = path.join(root, 'site');
const repo = process.env.GITHUB_REPOSITORY || process.env.DOCS_REPO || '';

const docDefinitions = [
  { slug: 'executive-brief', title: 'Executive Brief', eyebrow: 'Start here', file: 'docs/00-executive-brief.md', section: 'Core docs', status: 'Baseline', description: 'Ringkasan keputusan, tujuan bisnis, dan batas MVP.' },
  { slug: 'architecture-vision', title: 'Architecture Vision', eyebrow: 'North star', file: 'docs/01-architecture-vision.md', section: 'Core docs', status: 'Baseline', description: 'Visi target, system boundary, context map, dan prinsip arsitektur.' },
  { slug: 'mvp-scope-and-flows', title: 'MVP Scope & Flows', eyebrow: 'Workflows', file: 'docs/02-mvp-scope-and-flows.md', section: 'Core docs', status: 'MVP', description: 'Fitur salesperson, webinar, voucher, individu, dan sekolah/BOS.' },
  { slug: 'domain-model-and-ownership', title: 'Domain Model & Ownership', eyebrow: 'Data', file: 'docs/03-domain-model-and-ownership.md', section: 'Core docs', status: 'Draft', description: 'Entity, lifecycle, external IDs, dan pemilik data per sistem.' },
  { slug: 'api-webhook-contracts', title: 'API & Webhook Contracts', eyebrow: 'Integration', file: 'docs/04-api-webhook-contracts.md', section: 'Core docs', status: 'Draft', description: 'Kontrak REST, webhook, event envelope, retry, dan idempotency.' },
  { slug: 'security-observability-and-operations', title: 'Security & Operations', eyebrow: 'Guardrails', file: 'docs/05-security-observability-and-operations.md', section: 'Core docs', status: 'Draft', description: 'Security baseline, observability, reliability, dan runbook awal.' },
  { slug: 'delivery-roadmap-and-open-decisions', title: 'Roadmap & Open Decisions', eyebrow: 'Next', file: 'docs/06-delivery-roadmap-and-open-decisions.md', section: 'Core docs', status: 'Next', description: 'Tahapan delivery, definition of done, dan keputusan terbuka.' },
  { slug: 'go-implementation-architecture', title: 'Go Implementation Architecture', eyebrow: 'Implementation', file: 'docs/07-go-implementation-architecture.md', section: 'Core docs', status: 'Accepted', description: 'Struktur Go, API/worker, PostgreSQL outbox, testing, dan deployment MVP.' },
  { slug: 'adr-system-boundaries', title: 'ADR: System Boundaries', eyebrow: 'Decision record', file: 'docs/adr/ADR-001-system-boundaries.md', section: 'References', status: 'Accepted', description: 'Alasan pemisahan CRM, platform, dan billing.' },
  { slug: 'adr-go-backend-architecture', title: 'ADR: Go Backend Architecture', eyebrow: 'Decision record', file: 'docs/adr/ADR-002-go-backend-architecture.md', section: 'References', status: 'Accepted', description: 'Keputusan modular monolith Go dengan process API dan worker.' },
];

const downloads = [
  { id: 'docx', label: 'Download DOCX handoff', source: 'CRM-Architecture-Vision-MVP.docx', output: 'downloads/CRM-Architecture-Vision-MVP.docx' },
  { id: 'event-envelope', label: 'Event envelope JSON', source: 'contracts/event-envelope.json', output: 'downloads/contracts/event-envelope.json' },
  { id: 'webhook-openapi', label: 'Webhook OpenAPI YAML', source: 'contracts/webhook-openapi.yaml', output: 'downloads/contracts/webhook-openapi.yaml' },
  { id: 'system-context', label: 'System context diagram', source: 'diagrams/system-context.mmd', output: 'downloads/diagrams/system-context.mmd' },
  { id: 'go-module-architecture', label: 'Go module architecture diagram', source: 'diagrams/go-module-architecture.mmd', output: 'downloads/diagrams/go-module-architecture.mmd' },
  { id: 'individual-flow', label: 'Individual conversion diagram', source: 'diagrams/individual-flow.mmd', output: 'downloads/diagrams/individual-flow.mmd' },
  { id: 'school-flow', label: 'School procurement diagram', source: 'diagrams/school-flow.mmd', output: 'downloads/diagrams/school-flow.mmd' },
];

async function copyFile(source, destination) {
  await fsp.mkdir(path.dirname(destination), { recursive: true });
  await fsp.copyFile(source, destination);
}

async function build() {
  await fsp.mkdir(site, { recursive: true });
  const docs = [];
  for (const definition of docDefinitions) {
    const absolute = path.join(root, definition.file);
    const markdown = await fsp.readFile(absolute, 'utf8');
    const stat = await fsp.stat(absolute);
    docs.push({ ...definition, markdown, updatedAt: stat.mtime.toISOString() });
    await copyFile(absolute, path.join(site, 'downloads', definition.file));
  }
  for (const file of downloads) {
    await copyFile(path.join(root, file.source), path.join(site, file.output));
  }
  await fsp.writeFile(path.join(site, 'content.js'), `window.DOCS = ${JSON.stringify(docs)};\nwindow.DOWNLOADS = ${JSON.stringify(downloads.map(({ id, label, source, output }) => ({ id, label, source, path: output })))};\n`, 'utf8');
  await fsp.writeFile(path.join(site, 'site-config.js'), `window.SITE_CONFIG = ${JSON.stringify({ repo, generatedAt: new Date().toISOString() })};\n`, 'utf8');
  await fsp.writeFile(path.join(site, '.nojekyll'), '', 'utf8');
  console.log(`Built static site: ${docs.length} docs, repo=${repo || '(not configured)'}`);
}

build().catch((error) => { console.error(error); process.exitCode = 1; });

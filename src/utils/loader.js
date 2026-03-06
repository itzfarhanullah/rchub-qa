import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CONTENT_DIR = join(__dirname, '..', '..', 'content');

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };

  const rawMeta = match[1];
  const body = match[2];
  const meta = {};

  for (const line of rawMeta.split('\n')) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, '');

    if (key === 'metadata') continue;
    if (line.startsWith('  ')) {
      const innerKey = key;
      if (!meta.metadata) meta.metadata = {};
      meta.metadata[innerKey] = value;
    } else {
      meta[key] = value;
    }
  }

  return { meta, body };
}

function findDocFiles(dir) {
  const results = [];
  if (!existsSync(dir)) return results;

  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...findDocFiles(fullPath));
    } else if (entry === 'DOC.md') {
      results.push(fullPath);
    }
  }
  return results;
}

export function loadAllDocs() {
  const docFiles = findDocFiles(CONTENT_DIR);
  const docs = [];

  for (const filePath of docFiles) {
    const content = readFileSync(filePath, 'utf-8');
    const { meta, body } = parseFrontmatter(content);

    const relPath = relative(CONTENT_DIR, filePath);
    const parts = relPath.split('/');
    // e.g. playwright/docs/testing/javascript/DOC.md
    const tool = parts[0];
    const entryName = parts[2] || meta.name || tool;
    const lang = parts[3] || 'unknown';

    docs.push({
      id: `${tool}/${entryName}`,
      tool,
      entryName,
      lang,
      name: meta.name || entryName,
      description: meta.description || '',
      tags: meta.metadata?.tags || '',
      versions: meta.metadata?.versions || '',
      languages: meta.metadata?.languages || lang,
      updatedOn: meta.metadata?.['updated-on'] || '',
      filePath,
      body,
    });
  }

  return docs;
}

export function getContentDir() {
  return CONTENT_DIR;
}

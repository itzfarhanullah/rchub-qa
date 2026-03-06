import { readFileSync, existsSync } from 'fs';
import { getAnnotationsPath } from '../commands/annotate.js';

export function formatDocOutput(doc, { showMeta = false } = {}) {
  const lines = [];

  if (showMeta) {
    lines.push(`# ${doc.tool} — ${doc.entryName} (${doc.lang})`);
    if (doc.description) lines.push(`> ${doc.description}`);
    if (doc.versions) lines.push(`> Version: ${doc.versions}`);
    if (doc.updatedOn) lines.push(`> Updated: ${doc.updatedOn}`);
    lines.push('');
  }

  lines.push(doc.body.trim());

  // Append annotations if any
  const annotations = loadAnnotations(doc.id);
  if (annotations.length > 0) {
    lines.push('');
    lines.push('---');
    lines.push('## Annotations');
    lines.push('');
    for (const ann of annotations) {
      lines.push(`- [${ann.date}] ${ann.note}`);
    }
  }

  return lines.join('\n');
}

function loadAnnotations(docId) {
  const annPath = getAnnotationsPath();
  if (!existsSync(annPath)) return [];

  const data = JSON.parse(readFileSync(annPath, 'utf-8'));
  return (data[docId] || []);
}

export function formatListEntry(doc) {
  const langTag = doc.lang === 'unknown' ? '' : `[${doc.lang}]`;
  return `  ${doc.id.padEnd(35)} ${langTag.padEnd(14)} ${doc.description.slice(0, 60)}`;
}

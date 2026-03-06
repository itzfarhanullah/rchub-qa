import { loadAllDocs } from '../utils/loader.js';
import { formatListEntry } from '../utils/formatter.js';

export function list() {
  const docs = loadAllDocs();

  // Group by category
  const grouped = {};
  for (const doc of docs) {
    const category = doc.entryName;
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(doc);
  }

  // Group by tool for display
  const byTool = {};
  for (const doc of docs) {
    if (!byTool[doc.tool]) byTool[doc.tool] = [];
    byTool[doc.tool].push(doc);
  }

  const tools = Object.keys(byTool).sort();

  console.log('\n  Available QA docs:\n');
  console.log(`  ${'ID'.padEnd(35)} ${'Language'.padEnd(14)} Description`);
  console.log(`  ${'—'.repeat(35)} ${'—'.repeat(14)} ${'—'.repeat(50)}`);

  for (const tool of tools) {
    const toolDocs = byTool[tool].sort((a, b) => a.lang.localeCompare(b.lang));
    for (const doc of toolDocs) {
      console.log(formatListEntry(doc));
    }
  }

  console.log(`\n  ${docs.length} docs total.\n`);
}

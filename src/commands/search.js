import { loadAllDocs } from '../utils/loader.js';

export function search(query) {
  const docs = loadAllDocs();
  const terms = query.toLowerCase().split(/\s+/);

  const scored = docs.map((doc) => {
    const searchable = [
      doc.tool,
      doc.entryName,
      doc.name,
      doc.description,
      doc.tags,
      doc.languages,
    ]
      .join(' ')
      .toLowerCase();

    let score = 0;
    for (const term of terms) {
      if (searchable.includes(term)) score++;
    }
    return { doc, score };
  });

  const matches = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (matches.length === 0) {
    console.log(`\n  No docs found for "${query}".\n`);
    console.log('  Run `rchub-qa list` to see all available docs.\n');
    return;
  }

  console.log(`\n  Results for "${query}":\n`);
  console.log(`  ${'ID'.padEnd(35)} ${'Language'.padEnd(14)} Description`);
  console.log(`  ${'—'.repeat(35)} ${'—'.repeat(14)} ${'—'.repeat(50)}`);

  for (const { doc } of matches) {
    const langTag = doc.lang === 'unknown' ? '' : `[${doc.lang}]`;
    console.log(
      `  ${doc.id.padEnd(35)} ${langTag.padEnd(14)} ${doc.description.slice(0, 60)}`
    );
  }

  console.log(`\n  ${matches.length} result(s). Use \`rchub-qa get <id> --lang <py|js>\` to fetch.\n`);
}

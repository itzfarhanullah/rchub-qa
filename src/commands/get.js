import { loadAllDocs } from '../utils/loader.js';
import { formatDocOutput } from '../utils/formatter.js';

export function get(id, options) {
  const docs = loadAllDocs();
  const lang = options.lang || null;

  // Normalize: allow "playwright/testing" or "playwright"
  const matches = docs.filter((doc) => {
    if (doc.id === id) return true;
    if (doc.tool === id) return true;
    return false;
  });

  // Filter by language if specified
  let filtered = matches;
  if (lang) {
    const langMap = {
      py: 'python',
      python: 'python',
      js: 'javascript',
      javascript: 'javascript',
      ts: 'javascript',
      typescript: 'javascript',
    };
    const targetLang = langMap[lang.toLowerCase()] || lang.toLowerCase();
    filtered = matches.filter(
      (doc) =>
        doc.lang === targetLang ||
        doc.languages === targetLang ||
        doc.lang.includes(targetLang)
    );
  }

  if (filtered.length === 0) {
    if (matches.length > 0 && lang) {
      console.error(
        `\n  "${id}" exists but not for language "${lang}". Available:\n`
      );
      for (const doc of matches) {
        console.error(`    ${doc.id} [${doc.lang}]`);
      }
      console.error('');
    } else {
      console.error(`\n  Doc "${id}" not found.\n`);
      console.error('  Run `rchub-qa search <query>` or `rchub-qa list` to find docs.\n');
    }
    process.exit(1);
  }

  if (filtered.length > 1 && !lang) {
    console.error(`\n  Multiple versions of "${id}" found. Specify --lang:\n`);
    for (const doc of filtered) {
      console.error(`    rchub-qa get ${doc.id} --lang ${doc.lang === 'javascript' ? 'js' : 'py'}`);
    }
    console.error('');
    process.exit(1);
  }

  const doc = filtered[0];
  console.log(formatDocOutput(doc, { showMeta: true }));
}

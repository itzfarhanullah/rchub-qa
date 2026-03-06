import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const ANNOTATIONS_DIR = join(homedir(), '.rchub-qa');
const ANNOTATIONS_FILE = join(ANNOTATIONS_DIR, 'annotations.json');

export function getAnnotationsPath() {
  return ANNOTATIONS_FILE;
}

function loadAnnotations() {
  if (!existsSync(ANNOTATIONS_FILE)) return {};
  return JSON.parse(readFileSync(ANNOTATIONS_FILE, 'utf-8'));
}

function saveAnnotations(data) {
  if (!existsSync(ANNOTATIONS_DIR)) {
    mkdirSync(ANNOTATIONS_DIR, { recursive: true });
  }
  writeFileSync(ANNOTATIONS_FILE, JSON.stringify(data, null, 2));
}

export function annotate(id, note, options) {
  // List all annotations
  if (options.list) {
    const data = loadAnnotations();
    const allIds = Object.keys(data);

    if (allIds.length === 0) {
      console.log('\n  No annotations yet.\n');
      console.log('  Add one: rchub-qa annotate <id> "your note"\n');
      return;
    }

    console.log('\n  Annotations:\n');
    for (const docId of allIds.sort()) {
      console.log(`  ${docId}:`);
      for (const ann of data[docId]) {
        console.log(`    [${ann.date}] ${ann.note}`);
      }
    }
    console.log('');
    return;
  }

  // Import annotations from file
  if (options.import) {
    const importPath = options.import;
    if (!existsSync(importPath)) {
      console.error(`\n  File not found: ${importPath}\n`);
      process.exit(1);
    }

    const imported = JSON.parse(readFileSync(importPath, 'utf-8'));
    const existing = loadAnnotations();

    let count = 0;
    for (const [docId, annotations] of Object.entries(imported)) {
      if (!existing[docId]) existing[docId] = [];
      for (const ann of annotations) {
        const isDuplicate = existing[docId].some(
          (e) => e.note === ann.note
        );
        if (!isDuplicate) {
          existing[docId].push(ann);
          count++;
        }
      }
    }

    saveAnnotations(existing);
    console.log(`\n  Imported ${count} annotation(s).\n`);
    return;
  }

  // Export annotations
  if (options.export) {
    const data = loadAnnotations();
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  // Add annotation
  if (!id) {
    console.error('\n  Usage: rchub-qa annotate <id> "note"\n');
    process.exit(1);
  }

  if (!note) {
    // Show annotations for a specific doc
    const data = loadAnnotations();
    const annotations = data[id] || [];
    if (annotations.length === 0) {
      console.log(`\n  No annotations for "${id}".\n`);
    } else {
      console.log(`\n  Annotations for ${id}:\n`);
      for (const ann of annotations) {
        console.log(`    [${ann.date}] ${ann.note}`);
      }
      console.log('');
    }
    return;
  }

  const data = loadAnnotations();
  if (!data[id]) data[id] = [];

  data[id].push({
    note,
    date: new Date().toISOString().split('T')[0],
  });

  saveAnnotations(data);
  console.log(`\n  Annotated ${id}: "${note}"\n`);
}

// @ts-nocheck
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SCREENS_DIR = path.join(HERE, '..', 'src', 'screens');

function getAllFiles(dir: string, ext: string = '.tsx'): string[] {
  let results: string[] = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFiles(fullPath, ext));
    } else if (file.endsWith(ext)) {
      results.push(fullPath);
    }
  }
  return results;
}

function runStaticAudit() {
  console.log('=== [STATIC SCREEN & HANDLER AUDIT] ===\n');

  const files = getAllFiles(SCREENS_DIR);
  let issueCount = 0;

  files.forEach((file) => {
    const content = fs.readFileSync(file, 'utf8');
    const relative = path.relative(path.join(HERE, '..'), file);

    // 1. Cek empty onPress
    const emptyOnPressMatches = content.match(/onPress=\{\(\)\s*=>\s*\{\s*\}\}/g);
    if (emptyOnPressMatches) {
      console.log(`⚠️  [EMPTY ONPRESS] ${relative}: ${emptyOnPressMatches.length} empty handler found.`);
      issueCount++;
    }

    // 2. Cek placeholder TODO
    const todoMatches = content.match(/\/\/\s*TODO/gi);
    if (todoMatches) {
      console.log(`⚠️  [TODO FOUND] ${relative}: ${todoMatches.length} TODO comment(s).`);
      issueCount++;
    }

    // 3. Cek dummy handler alert
    const dummyAlertMatches = content.match(/Alert\.alert\(['"]Segera tersedia/gi);
    if (dummyAlertMatches) {
      console.log(`⚠️  [STUB ALERT] ${relative}: Dummy 'Segera tersedia' alert.`);
      issueCount++;
    }
  });

  if (issueCount === 0) {
    console.log('✅ AUDIT CLEAN: Tidak ada empty handler `() => {}`, TODO, atau stub alert yang tertinggal!');
  } else {
    console.log(`\nFound ${issueCount} potential issue(s).`);
  }
}

runStaticAudit();

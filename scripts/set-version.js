import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const version = process.argv[ 2 ];

if (!version || !/^\d+\.\d+\.\d+(?:-[\w.]+)?$/.test(version)) {
  console.error('Usage: node scripts/set-version.js <major.minor.patch>');
  process.exit(1);
}

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const packagesDir = join(root, 'packages');

const manifests = [
  join(root, 'package.json'),
  ...readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name.startsWith('headless-'))
    .map((entry) => join(packagesDir, entry.name, 'package.json')),
];

for (const manifest of manifests) {
  const json = JSON.parse(readFileSync(manifest, 'utf8'));
  json.version = version;
  writeFileSync(manifest, `${ JSON.stringify(json, null, 2) }\n`);
}

console.log(`Set ${ manifests.length } manifests to ${ version }`);

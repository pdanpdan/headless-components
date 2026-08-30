import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { build } from 'vite';
import { beforeAll, describe, expect, it } from 'vitest';

const packageRoot = resolve(import.meta.dirname, '..');
const distDir = resolve(packageRoot, 'dist');

describe('build output', () => {
  beforeAll(async () => {
    await build({
      root: packageRoot,
      configFile: resolve(packageRoot, 'vite.config.ts'),
      logLevel: 'silent',
    });
  }, 120_000);

  it('emits every entry file the package manifest points at', () => {
    const pkg = JSON.parse(readFileSync(resolve(packageRoot, 'package.json'), 'utf8')) as Record<string, unknown>;
    const exportsMap = (pkg.exports as Record<string, Record<string, string | undefined>>)[ '.' ];

    const entries: Array<[string, string | undefined]> = [
      [ 'types', pkg.types as string | undefined ],
      [ 'main', pkg.main as string | undefined ],
      [ 'module', pkg.module as string | undefined ],
      [ 'exports["."].types', exportsMap?.types ],
      [ 'exports["."].import', exportsMap?.import ],
      [ 'exports["."].require', exportsMap?.require ],
    ];

    for (const [ label, relPath ] of entries) {
      expect(relPath, `${ label } must point into dist/`).toMatch(/^\.\/dist\//);
      if (relPath) {
        expect(existsSync(resolve(packageRoot, relPath)), `${ label } -> ${ relPath }`).toBe(true);
      }
    }
  });

  it('emits a flat declaration file (and source map) for every source module', () => {
    const sources = readdirSync(resolve(packageRoot, 'src'))
      .filter((file) => file.endsWith('.ts') || file.endsWith('.vue'));

    expect(sources.length).toBeGreaterThan(0);

    for (const source of sources) {
      // SFC declarations keep the `.vue` extension; module declarations drop `.ts`.
      const declaration = source.endsWith('.vue') ? `${ source }.d.ts` : `${ source.replace(/\.ts$/, '') }.d.ts`;
      expect(existsSync(resolve(distDir, declaration)), declaration).toBe(true);
      expect(existsSync(resolve(distDir, `${ declaration }.map`)), `${ declaration }.map`).toBe(true);
    }
  });

  it('re-exports the full public API from the type entry', () => {
    const entry = readFileSync(resolve(distDir, 'index.d.ts'), 'utf8');
    const source = readFileSync(resolve(packageRoot, 'src/index.ts'), 'utf8');

    const sourceExports = [ ...source.matchAll(/export\s+(?:type\s+)?\{([^}]*)\}/g) ]
      .flatMap((match) => match[ 1 ]!.split(','))
      .map((name) => name.trim().replace(/^default as\s+/, ''))
      .filter(Boolean);

    expect(sourceExports.length).toBeGreaterThan(0);

    for (const name of sourceExports) {
      expect(entry, `entry must export ${ name }`).toMatch(new RegExp(`\\b${ name }\\b`));
    }

    // The type entry is a pure re-export surface, not compiled runtime code.
    expect(entry).not.toMatch(/\b(?:const|let|var|function|class)\s+\w+\s*[={;(]/);

    // Every module the entry re-exports from must have its declaration next to it.
    for (const ref of entry.matchAll(/from\s+'\.\/([^']+)'/g)) {
      expect(existsSync(resolve(distDir, `${ ref[ 1 ] }.d.ts`)), `./${ ref[ 1 ] }`).toBe(true);
    }
  });
});

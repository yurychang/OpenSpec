import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { installerBase } from '../src/commands/install-standalone.js';
import { getCliUpdateCommand } from '../src/core/version-check.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file: string) => fs.readFileSync(path.join(root, file), 'utf8');
const pkg = JSON.parse(read('package.json'));
const repoUrl = pkg.repository.url.replace(/\.git$/, '');
const repo = new URL(repoUrl).pathname.slice(1);

describe('fork distribution identity', () => {
  it('uses the package repository for every standalone install entry point', () => {
    const raw = `https://raw.githubusercontent.com/${repo}/main/scripts/binary`;
    expect(installerBase({})).toBe(raw);
    for (const file of ['scripts/binary/install.sh', 'scripts/binary/install.ps1']) {
      expect(read(file)).toContain(`${repoUrl}/releases`);
      expect(read(file)).toContain(`npm install -g ${pkg.name}`);
    }
    expect(read('docs-lab/start/installation.md')).toContain(`${raw}/install.sh`);
    expect(read('docs-lab/start/installation.md')).toContain(`${raw}/install.ps1`);
    expect(read('skills/README.md')).toContain(`npx skills add ${repo}`);
    expect(read('flake.nix')).toContain(`homepage = "${repoUrl}"`);
    expect(read('Formula/openspec.rb')).toContain(`head "${repoUrl}.git"`);
  });

  it('keeps release jobs restricted to the package repository and dispatches binaries', () => {
    const release = parse(read('.github/workflows/release-prepare.yml'));
    const binaries = parse(read('.github/workflows/binaries.yml'));
    expect(release.jobs.prepare.if).toContain(`github.repository == '${repo}'`);
    expect(release.jobs.beta.if).toContain(`github.repository == '${repo}'`);
    expect(binaries.jobs.release.if).toContain(`github.repository == '${repo}'`);
    expect(release.jobs.prepare.permissions.actions).toBe('write');
    const steps = release.jobs.prepare.steps;
    expect(steps.find((step: { id?: string }) => step.id === 'app-token').if).toBe("vars.APP_ID != ''");
    const finalize = steps.find((step: { name?: string }) => step.name === 'Finalize stable release');
    expect(finalize.run).toContain('gh workflow run binaries.yml');
    expect(release.jobs.beta.steps.at(-1).run).toContain('gh workflow run binaries.yml');
  });

  it('upgrades Homebrew through the fork tap, including unknown ownership', () => {
    for (const location of [
      '/opt/homebrew/Cellar/openspec/HEAD-abc/libexec/lib/node_modules/@yurychang/openspec',
      'C:\\homebrew\\Cellar\\openspec\\HEAD-abc\\libexec',
    ]) {
      expect(getCliUpdateCommand({ location, packageManager: null, scope: null }))
        .toBe('brew upgrade --fetch-HEAD yurychang/openspec/openspec');
    }
  });
});

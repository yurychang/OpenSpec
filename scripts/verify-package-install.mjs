#!/usr/bin/env node
// Exercise a real global install in an isolated prefix, never the runner's CLI.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
const [manager, spec, expectedVersion = pkg.version] = process.argv.slice(2);
assert(spec, 'Usage: node scripts/verify-package-install.mjs <npm|pnpm|yarn|bun> <package-spec> [version]');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'openspec-channel-'));
const bin = path.join(root, 'bin');
fs.mkdirSync(bin);
const env = {
  ...process.env,
  PATH: `${bin}${path.delimiter}${process.env.PATH}`,
  PNPM_HOME: bin,
  XDG_CONFIG_HOME: path.join(root, 'config'),
  XDG_DATA_HOME: path.join(root, 'data'),
  npm_config_cache: path.join(root, 'npm-cache'),
  YARN_CACHE_FOLDER: path.join(root, 'yarn-cache'),
  BUN_INSTALL_CACHE_DIR: path.join(root, 'bun-cache'),
  OPENSPEC_TELEMETRY: '0',
  OPENSPEC_NO_UPDATE_CHECK: '1',
};
const commands = {
  npm: ['install', '--global', '--prefix', root, '--no-audit', '--no-fund', spec],
  pnpm: ['add', '--global', '--global-dir', path.join(root, 'global'), '--global-bin-dir', bin, spec],
  yarn: ['global', 'add', spec, '--prefix', root, '--global-folder', path.join(root, 'global'), '--non-interactive'],
  bun: ['add', '--global', '--global-dir', path.join(root, 'global'), '--global-bin-dir', bin, spec],
};
assert(commands[manager], `Unsupported package manager: ${manager}`);
function run(command, args, cwd = root) {
  const result = spawnSync(command, args, { cwd, env, encoding: 'utf8', timeout: 300_000 });
  if (result.error || result.status !== 0) {
    throw new Error(`${command} failed: ${result.error ?? result.status}\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout.trim();
}
try {
  run(manager, commands[manager]);
  const cli = path.join(bin, 'openspec');
  assert(fs.existsSync(cli), `Global executable missing: ${cli}`);
  // pnpm writes a shell shim; npm, Yarn and Bun usually write symlinks.
  const globalRoot = path.join(root, 'global');
  const moduleRoots = [path.join(root, 'lib', 'node_modules'), path.join(globalRoot, 'node_modules')];
  if (fs.existsSync(globalRoot)) {
    for (const entry of fs.readdirSync(globalRoot, { withFileTypes: true })) {
      if (entry.isDirectory() && /^\d+$/.test(entry.name)) moduleRoots.push(path.join(globalRoot, entry.name, 'node_modules'));
    }
  }
  const manifest = moduleRoots.map(dir => path.join(dir, ...pkg.name.split('/'), 'package.json')).find(file => fs.existsSync(file));
  assert(manifest, 'Installed package manifest missing');
  const installed = JSON.parse(fs.readFileSync(manifest, 'utf8'));
  assert.equal(installed.name, pkg.name, 'Installed the wrong distribution');
  assert.equal(run(cli, ['--version']), expectedVersion);
  const project = path.join(root, 'project');
  fs.mkdirSync(project);
  run(cli, ['init', '--tools', 'claude,codex', '--force'], project);
  for (const file of [
    '.claude/commands/opsx/auto.md',
    '.claude/skills/openspec-auto/SKILL.md',
    '.agents/skills/openspec-auto/SKILL.md',
  ]) assert(fs.existsSync(path.join(project, file)), `Missing auto integration: ${file}`);
  run(cli, ['new', 'change', 'verify-install'], project);
  const status = JSON.parse(run(cli, ['status', '--change', 'verify-install', '--json'], project));
  assert.equal(status.schemaName, 'spec-driven');
  console.log(JSON.stringify({ manager, spec, package: installed.name, version: expectedVersion, init: true, auto: true, schema: true }));
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}

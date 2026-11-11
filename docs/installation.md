# Installation

These commands install `yurychang/OpenSpec`. See the [current installation guide](../docs-lab/start/installation.md) for fork release prerequisites, Homebrew HEAD, source builds, and migration from upstream.

## Install

OpenSpec is a single file. It needs no Node.js or anything else (on Alpine Linux, first run `apk add libstdc++ libgcc`).

macOS and Linux:

```bash
curl -fsSL https://raw.githubusercontent.com/yurychang/OpenSpec/main/scripts/binary/install.sh | sh
```

Windows (PowerShell):

```powershell
irm https://raw.githubusercontent.com/yurychang/OpenSpec/main/scripts/binary/install.ps1 | iex
```

The installer picks the newest release whose files are all attached and the right file for your machine, checks it against the release's `SHA256SUMS`, and installs it to `~/.local/bin` (Windows: `%LOCALAPPDATA%\Programs\openspec`, added to your user `PATH`). Set `OPENSPEC_INSTALL_DIR` to choose another folder, or `OPENSPEC_VERSION=v1.15.0` to pin a release. Prefer npm or another package manager? See [Package Managers](#package-managers).

To install by hand, download your platform's file from the [latest release](https://github.com/yurychang/OpenSpec/releases/latest), unpack the archive to get `openspec` (`openspec.exe` on Windows), make it executable on macOS and Linux (`chmod +x openspec`), and put it on your `PATH`:

| Platform | File |
|---|---|
| macOS 13+ (Apple Silicon / Intel) | `openspec-darwin-arm64.tar.gz` / `openspec-darwin-x64.tar.gz` |
| Linux (glibc 2.17+) | `openspec-linux-x64.tar.gz` / `openspec-linux-arm64.tar.gz` |
| Alpine 3.17+ (needs `apk add libstdc++ libgcc`) | `openspec-linux-x64-musl.tar.gz` / `openspec-linux-arm64-musl.tar.gz` |
| Windows 10+ | `openspec-windows-x64.zip` / `openspec-windows-arm64.zip` |

On macOS, a file downloaded with a browser is blocked until you run `xattr -d com.apple.quarantine openspec`; the install script avoids this. On Windows, SmartScreen may warn the first time you run it from Explorer.

## Install with your AI assistant

Rather not do this by hand? Paste the prompt below into any coding assistant that can run shell commands — Claude Code, Codex, Cursor, Gemini CLI, Copilot, and the rest of the [supported tools](supported-tools.md). It installs the CLI, initializes this project, and reports back what actually happened.

The manual steps below are the source of truth — the prompt just runs them for you. If your assistant stops and hands something back, that's by design: it asks before anything privileged and never edits your shell startup files. Finish those bits yourself with [Install](#install) and [Troubleshooting](troubleshooting.md).

```text
Fetch https://raw.githubusercontent.com/yurychang/OpenSpec/main/install.md and follow it.
```

Nothing in the prompt is vendor-specific: it's plain instructions plus the same commands documented on this page. It works on macOS, Linux, and Windows, and it deliberately stops rather than improvising when a step needs your permission. Your assistant does need to be able to run shell commands — a few IDE integrations can't.

## Package Managers

Installing with a package manager needs **Node.js 22.12.0 or higher** (check with `node --version`).

### npm

```bash
npm install -g @yurychang/openspec@latest
```

### pnpm

```bash
pnpm add -g @yurychang/openspec@latest
```

### yarn

```bash
yarn global add @yurychang/openspec@latest
```

Yarn 2 and later (Berry) removed the `global` command. On those versions, install OpenSpec with npm, pnpm, or bun instead — a global CLI doesn't need to share your project's package manager.

### deno

Deno sometimes has issues parsing the @latest tag, but we can specify a version while installing initially.
If that happens, you could try to change the @latest tag with the version, something like `@^1.3.1`

```bash
deno install --global \
  --allow-read --allow-write --allow-env --allow-sys=cpus,homedir --allow-net=edge.openspec.dev \
  npm:@yurychang/openspec@latest
# or
deno install --global \
  --allow-read --allow-write --allow-env --allow-sys=cpus,homedir --allow-net=edge.openspec.dev \
  npm:@yurychang/openspec@^1.3.1
```

Note: If your subcommands launch external tools, like config edit, feedback, or workspace open, you may need a scoped --allow-run=<program>.

### bun

Bun can install OpenSpec globally, but OpenSpec currently runs on Node.js.
You still need Node.js 22.12.0 or higher available on `PATH`.

```bash
bun add -g @yurychang/openspec@latest
```

## Homebrew

In your terminal:

```bash
brew tap --custom-remote yurychang/openspec https://github.com/yurychang/OpenSpec.git
brew install --HEAD yurychang/openspec/openspec
```

This builds the fork's `main` branch. Remove an existing upstream formula first with `brew uninstall openspec`. Update with `brew upgrade --fetch-HEAD yurychang/openspec/openspec`.

## Nix

Run OpenSpec directly without installation:

```bash
nix run github:yurychang/OpenSpec -- init
```

Or install to your profile:

```bash
nix profile install github:yurychang/OpenSpec
```

Or add to your development environment in `flake.nix`:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    openspec.url = "github:yurychang/OpenSpec";
  };

  outputs = { nixpkgs, openspec, ... }: {
    devShells.x86_64-linux.default = nixpkgs.legacyPackages.x86_64-linux.mkShell {
      buildInputs = [ openspec.packages.x86_64-linux.default ];
    };
  };
}
```

## Verify Installation

```bash
openspec --version
```

## Switch from npm to the standalone install

Your settings and projects carry over; only the program changes.

1. Run `openspec install`. It installs the standalone copy and prints the command that removes your old one.
2. Run that command, for example `npm uninstall -g @yurychang/openspec` (Homebrew: `brew uninstall openspec`). Until then the old copy keeps running first on your PATH.
3. In a new terminal, run `openspec version`. It should print `OpenSpec <version> (standalone)`. If it names a package manager, another copy is still on your PATH: `which -a openspec` (Windows: `where.exe openspec`) lists them.

## Updating

Upgrade the CLI by running the [install command](#install) again (with a package manager: `npm install -g @yurychang/openspec@latest` or its pnpm/yarn/bun equivalent). Then refresh each project's generated files:

```bash
openspec update   # run inside each project
```

`openspec update` regenerates the skill and command files for the tools you've configured, so your slash commands stay current with the installed version. It also checks whether a newer CLI has been published and offers to upgrade, since upgrading is what makes new workflows available in the first place — see [CLI Reference](cli.md#openspec-update).

## Uninstalling

There's no `openspec uninstall` command, because OpenSpec is just one program plus some files in your project. Removing it is a few manual steps, and nothing here touches your source code.

**1. Remove the CLI.** Delete the file the installer put in place: `~/.local/bin/openspec`, or on Windows `%LOCALAPPDATA%\Programs\openspec\openspec.exe` (and that folder from your user `PATH`). If you installed with a package manager:

```bash
npm uninstall -g @yurychang/openspec   # or: pnpm rm -g / yarn global remove / bun rm -g
```

The standalone binary also keeps, when that directory is writable, a copy of its built-in schemas under your OpenSpec data directory (`~/.local/share/openspec/binary-schemas` on macOS and Linux, `%LOCALAPPDATA%\openspec\binary-schemas` on Windows), which you can delete too.

**2. Remove OpenSpec from a project (optional).** Delete the `openspec/` directory if you no longer want its specs and changes:

```bash
rm -rf openspec/
```

Think before you do this: `openspec/specs/` and `openspec/changes/archive/` are your record of how the system behaves and why it changed. If you might want that history, keep the folder (or keep it in git) even after uninstalling.

**3. Remove generated AI tool files (optional).** OpenSpec writes skill and command files into per-tool directories like `.claude/skills/openspec-*/`, `.cursor/commands/opsx-*`, and so on. Delete the `openspec-*` skills and `opsx-*` commands for whichever tools you configured. The exact paths per tool are listed in [Supported Tools](supported-tools.md).

If you also have OpenSpec marker blocks in files like `CLAUDE.md` or `AGENTS.md`, remove those blocks by hand; your own content in those files is yours to keep.

## Next Steps

After installing, initialize OpenSpec in your project:

```bash
cd your-project
openspec init
```

See [Getting Started](getting-started.md) for a full walkthrough.

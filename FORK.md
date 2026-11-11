# Maintaining the yurychang fork

## Names and upstream sync

Keep the repository named `yurychang/OpenSpec`. The installed command is `openspec`, the npm package is `@yurychang/openspec`, and the Homebrew formula is `yurychang/openspec/openspec`. The npm scope identifies the publisher; it is not part of the executable name. No repository rename is needed.

Keep `openspec/`, skill names, schema ids, and machine settings compatible with upstream. The two distributions use the same command and settings, so replace the upstream CLI rather than installing both on the same PATH. For an upstream npm install, remove `@fission-ai/openspec` with the package manager that installed it before installing the fork. For upstream Homebrew, run `brew uninstall openspec` first. Then run `openspec update` in each project to install the fork's workflow files, including auto.

If a future rename is chosen, update Git remotes, raw installer links, release and update URLs, package metadata, Changesets config, Homebrew source URLs, Nix inputs, skills.sh commands, website links, and npm's trusted publisher configuration. GitHub redirects ordinary repository and Git traffic after a rename, but project site URLs and hosted action references have exceptions. See [GitHub's rename documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository).

A repository rename does not change Git's merge ancestry. Keeping upstream's filenames and command names reduces conflicts when upstream changes the same files. The fork identity changes still need review after each sync, especially `package.json`, `.changeset/`, `.github/workflows/`, installers, and installation docs. Historical changelogs, archived OpenSpec work, released-output fixtures, and the upstream release-upgrade test retain their original identities as evidence of upstream releases.

To set up upstream tracking once, in your terminal:

```bash
git remote add upstream https://github.com/Fission-AI/OpenSpec.git
```

To sync on a clean branch, fetch and merge upstream, resolve conflicts while preserving the fork identity, and run the checks below:

```bash
git fetch upstream main
git merge upstream/main
corepack pnpm install --frozen-lockfile
corepack pnpm build
corepack pnpm generate:skills
corepack pnpm test
corepack pnpm lint
```

New upstream changesets use the upstream package name. Retarget pending changesets to `@yurychang/openspec` before versioning; do not rewrite historical changelogs.

## Install channels

[Installation](docs-lab/start/installation.md) owns the commands, update steps, and uninstall steps.

| Channel | Fork source | Availability |
|---|---|---|
| npm, pnpm, Yarn Classic, Bun | `@yurychang/openspec` on npm | After a fork npm publish |
| Deno | `npm:@yurychang/openspec` | After a fork npm publish |
| Standalone shell, PowerShell, `openspec install`, manual downloads | This repo's installers and GitHub Releases | After binaries and `SHA256SUMS` are attached |
| Homebrew | `Formula/openspec.rb` in this repo | HEAD build from `main` |
| Nix | `github:yurychang/OpenSpec` | Source build from this repo |
| Source / local link | This repo's source and `prepare` build | No npm publish required |
| skills.sh | `npx skills add yurychang/OpenSpec` | Committed `skills/`; CLI installed separately |

`openspec.dev` remains the upstream service. Fork installers are served from this repo, and the fork's docs are the files in this checkout. Upstream issue links for inherited design decisions remain upstream links.

## Prepare publishing once

1. **Enable Actions** in the fork. Allow Actions to create pull requests under Settings → Actions → General. The release workflow uses `GITHUB_TOKEN` by default. Its generated version PR does not automatically trigger other workflows with that token; use a GitHub App if those checks must run automatically.
2. **Authorize the npm package.** The publishing account must own the `@yurychang` scope or have permission to publish `@yurychang/openspec`. GitHub ownership does not grant npm permissions. For a first publication, configure an npm granular publish token as the repository secret `NPM_TOKEN`, or publish the first version manually after building and checking the package.
3. **Configure trusted publishing** for owner `yurychang`, repo `OpenSpec`, and workflow `release-prepare.yml` in the npm package settings. The workflow grants `id-token: write`. Remove the bootstrap token once OIDC publishing works. See [npm's trusted publishing documentation](https://docs.npmjs.com/trusted-publishers/).
4. **Optionally configure a GitHub App** with repository contents and pull request write permissions, plus Actions write permission for dispatching builds. Store its id as `APP_ID` and private key as `APP_PRIVATE_KEY`. Without it, use the default token and perform any required PR checks through the repository's normal review process.

Do not try to publish the fork under `@fission-ai/openspec`. Repository and package metadata must identify this fork for npm provenance.

## Stable releases

1. Add release notes in `.changeset/*.md` under `"@yurychang/openspec"`.
2. Merge the work into `main`. `release-prepare.yml` opens or updates the Changesets Version Packages PR.
3. Review and merge that PR. CI checks the packed CLI version and publishes the scoped npm package.
4. CI normalizes the release tag to `v<version>`. With the default token it explicitly dispatches `binaries.yml`; with an App token the release event triggers the build.
5. Verify the npm version, GitHub tag and release, eight standalone archives, and `SHA256SUMS`. Installers ignore incomplete releases. A failed binary build can be retried by dispatching `binaries.yml` with the existing tag; it does not require republishing npm.

Use the `release-openspec` skill for the release audit and review gates. Publishing credentials and live Actions execution must be checked in the release environment; a local build cannot verify them.

## Beta releases

Dispatch `release-prepare.yml` on `main`. It computes the next version from pending changesets and publishes `@yurychang/openspec@beta`. It commits the beta package version into the tagged revision so binary builds report the same version. It creates a prerelease and explicitly dispatches `binaries.yml`. Pending changesets remain available for the stable release.

Beta binaries require an explicit `OPENSPEC_VERSION=v<version>-beta.<n>`. Default standalone installs select stable releases only.

## Validate changes

In your terminal:

```bash
corepack pnpm build
corepack pnpm generate:skills
corepack pnpm test
corepack pnpm lint
corepack pnpm check:pack-version
corepack pnpm exec changeset status
```

On macOS or Linux with Homebrew, install and test the HEAD formula. On a Nix-supported machine, run `nix flake check` and build the default package. Binary CI verifies the standalone installers on each supported OS and CPU.

`install-channels.yml` installs the packed fork with npm, pnpm, Yarn Classic, and Bun, then checks its package identity, version, project initialization, auto workflow, and packaged schema. It also installs the exact fork Git revision, installs the committed skill through skills.sh, and builds the Homebrew HEAD formula on macOS. Nix builds are checked by `ci.yml`; standalone installers are checked by `binaries.yml`.

After publishing, dispatch `install-channels.yml` on `main` with the exact `version`. The package-manager jobs then install from the public registry instead of the local tarball, and the Deno installation check runs. A green pre-publication run does not verify that a package already exists on npm.

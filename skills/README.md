# OpenSpec skills for skills.sh

Install the OpenSpec workflow skills into any [skills.sh](https://skills.sh)-compatible agent:

```bash
npx skills add yurychang/OpenSpec
```

Each `openspec-*/SKILL.md` here is the same skill `openspec init` writes into a
project. The skills drive the `openspec` CLI, so for the full setup (CLI +
`openspec/` project scaffolding + slash commands) run:

```bash
npx @yurychang/openspec@latest init
```

The fork's default profile includes `openspec-auto`: explicitly invoke it to check progress and finish planning plus implementation when exploration is settled. In Codex, use `$openspec-auto`.

Before the first npm publication, install the CLI from source with `npm install -g github:yurychang/OpenSpec#main`. See [Installation](../docs-lab/start/installation.md) for every fork install channel.

> These files are generated from the skill templates — do not edit by hand. Run
> `pnpm build && pnpm generate:skills` after changing a template;
> `skillssh-parity.test.ts` fails if they drift.

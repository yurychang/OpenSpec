# Github Workflows

## Fork releases

See [FORK.md](../../FORK.md) for npm scope authorization, OIDC or bootstrap token setup, GitHub App setup, stable and beta publishing, binary builds, and upstream sync checks.

`release-prepare.yml` publishes `@yurychang/openspec` from `yurychang/OpenSpec`. It works with an optional App token or the default GitHub token. With the default token, binary builds are explicitly dispatched because its releases do not trigger another workflow. The binary upload job is restricted to this fork.

## Testing CI Locally

Test GitHub Actions workflows locally using [act](https://nektosact.com/):

```bash
# Test all PR checks
act pull_request

# Test specific job
act pull_request -j nix-flake-validate

# Dry run to see what would execute
act pull_request --dryrun
```

The `.actrc` file configures act to use the appropriate Docker image.



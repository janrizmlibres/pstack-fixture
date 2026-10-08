QA check `launcher-cloud`: pstack's runtime launcher picks the right runtime in a cloud session. Do not enter pstack; only inspect.

1. Record `bun --version` and `node --version`.
2. Find the launcher among the plugin's scripts under `/opt/claude-pstack/pstack/` and run `skills/poteto-mode/scripts/check-plan.mjs --help` (or any harmless invocation it accepts) through it. Record which runtime ran it and the exit code.
3. Run the same with `bun` left off `PATH` (a `PATH` that keeps `node` but not `bun`). With Node 22.18 or later it runs on Node; with an older Node it exits with the missing-runtime code and prints the install line. Record which.

Pass when step 2 ran on Bun and step 3 did what the Node version calls for.

Report as `qa/README.md` says under "Reporting": a commit on your own branch with the trailers `QA-Check: launcher-cloud`, `QA-Result` and `Claude-Session`, pushed.

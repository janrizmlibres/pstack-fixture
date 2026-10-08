/pstack:poteto-mode QA check `entry-cloud`: report what pstack's entry gave this session, then stop. Change no code.

1. Quote, verbatim, the `pstack: surface=… mode=…` line and the line naming the full poteto-mode skill path that the reminder hook added this turn.
2. Quote the first heading of the poteto-mode skill body you have in context, which shows the slash command expanded.
3. Spawn one read-only subagent that replies `ok`. On the turn its result comes back, quote the `pstack: surface=… mode=…` line again: the hook fires on every turn, worker results included.

Pass when both surface lines read `surface=cloud mode=auto` and the skill path sits under `/opt/claude-pstack/pstack/`.

Report as `qa/README.md` says under "Reporting", with `QA-Check: entry-cloud`.

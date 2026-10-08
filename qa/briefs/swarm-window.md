/pstack:poteto-mode QA check `swarm-window`: swarm fans out through the rolling window, and a refused spawn is backpressure, never a dropped slice. Change no code.

The task for every slice: list the test names in `src/*.test.ts` (`test(` and `test.each(` calls, one per line, with file and line); slice k of N reports only the k-th name in that list, sorted by file then line.

1. Run a swarm of N = 24 slices as pstack's swarm skill says. Record the most slices in flight at once and the order they finished.
2. Then, for this check only, start N = 25 slices at once, ignoring the window, so that spawns are refused. Handle each refusal as pstack says: wait for one of your in-flight slices, then spawn again.

Pass when step 1 never had more than 10 slices in flight and returned all 24; and step 2 met at least one refused spawn, dropped no slice, returned all 25, and never returned `BLOCKED: concurrency cap` while a slice was in flight. If no spawn was refused in step 2, report `BLOCKED` with the most agents you had in flight.

Report as `qa/README.md` says under "Reporting", with `QA-Check: swarm-window`.

/pstack:poteto-mode build https://github.com/janrizmlibres/pstack-fixture/issues/1

When the run is done, also report it as QA check `spec-build-cloud`, as `qa/README.md` says under "Reporting": a commit on your own branch with the trailers `QA-Check: spec-build-cloud`, `QA-Result` and `Claude-Session`, pushed. The body records: how you read the issue and its comments (the exact commands); where the plan was posted; each PR opened, with its base; whether you stopped for confirmation at any point; and how the change treats `Work` and `work` as tags.

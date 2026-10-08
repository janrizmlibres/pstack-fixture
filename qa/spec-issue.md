# Spec: Tag notes and filter by tag

## Problem Statement

The notes API keeps notes as plain text. Once a user has more than a handful, they can't group them or find the ones about one topic: `GET /notes` returns everything, every time.

## Solution

Notes carry tags. A note gets its tags when it's created, and `GET /notes` can be narrowed to the notes carrying one tag.

## User Stories

1. As an API user, I want to send tags with a new note, so that I can group notes as I write them.
2. As an API user, I want every note in a response to carry its tags, so that I can see how it's grouped.
3. As an API user, I want a note created without tags to have none, so that existing clients keep working.
4. As an API user, I want a bad tag refused with a clear 400, so that I find out at once rather than storing junk.
5. As an API user, I want `GET /notes?tag=<tag>` to return only the notes with that tag, so that I can find notes by topic.
6. As an API user, I want a tag nobody uses to return an empty list, not an error, so that filtering is safe to try.

## Implementation Decisions

- A note is `{ id, text, tags }`; `tags` is a list of strings, empty by default, with no duplicates, in the order first given.
- `POST /notes` accepts an optional `tags` array. A tag is 1 to 32 characters of letters, digits and `-`. Anything else is a 400 with `{ "error": "tags must be a list of 1-32 character words" }`.
- `GET /notes?tag=<tag>` filters; without `tag` it lists every note as today. An empty `tag=` is a 400.
- The store stays in memory; the store's interface gains what filtering needs, and the HTTP layer stays thin.

## Testing Decisions

- Test-first, at the highest seam: the store through its interface, the API through `createApp` with real `Request`s, as the existing tests do.
- No test reaches into the store's internals.

## Out of Scope

- Editing a note's tags after it's created.
- Filtering by more than one tag at once.
- Persisting notes beyond the process.

## Further Notes

The suite needs `.env`; copy `.env.example`.

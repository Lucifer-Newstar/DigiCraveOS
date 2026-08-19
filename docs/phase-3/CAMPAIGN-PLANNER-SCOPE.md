# Phase 3 — Campaign planner scope

## Goal

Convert retention intelligence into reviewable campaign drafts without sending messages or connecting to an external marketing provider.

## First slice

- Admin-only campaign draft endpoint.
- Group at-risk customers into a win-back draft and VIP customers into an appreciation draft.
- Return audience count, suggested channel, subject, and message copy.
- Keep drafts editable and unsent.

## Acceptance criteria

1. Only Admin users can access campaign drafts.
2. Draft audiences contain safe customer identifiers only.
3. No external message is sent.
4. Empty audiences are omitted.
5. Existing backend, ML, and frontend verification remains green.

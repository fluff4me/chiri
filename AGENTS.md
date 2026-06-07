## Command Hygiene

Validation commands must be non-emitting unless the user explicitly approves an emitting build or generation step.

Run these validation commands in parallel:
- `pnpm exec tspc --project src\tsconfig.json --noEmit --incremental false`
- `pnpm exec lint`

Do not use build or watch scripts as validation unless the user has explicitly approved files being emitted or regenerated.

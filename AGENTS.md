# Ozastra project instructions

## Roadmap as source of truth

- Read `paradigm-roadmap.json` before changing the project.
- Treat its accepted decisions, architecture, phase dependencies, quality budgets and definition of done as project requirements.
- Every implementation task must map to a numbered phase and a 1-based deliverable in `implementation_roadmap`.
- If requested work does not map to an existing deliverable, update the roadmap scope first, validate it, and then begin implementation.

## Mandatory progress updates

- Before editing code for a deliverable, run `node scripts/update-roadmap.mjs start-step <phase> <deliverable> [note]`.
- After implementing and verifying it, run `node scripts/update-roadmap.mjs complete-step <phase> <deliverable> <evidence>` in the same task.
- Evidence must name the relevant test, build, file, measurement, screenshot or explicit user validation.
- If work cannot continue, run `node scripts/update-roadmap.mjs block-step <phase> <deliverable> <reason>` instead of marking it complete.
- When every deliverable in a phase is complete and its phase-level checks have passed, run `node scripts/update-roadmap.mjs verify-phase <phase> <evidence>`.
- Use `node scripts/update-roadmap.mjs note <phase> <message>` for decisions or discoveries that do not change completion status.
- Run `node scripts/update-roadmap.mjs validate` before finishing any task that changes the roadmap or project state.

## Integrity rules

- Do not edit progress percentages, completed deliverables, timestamps, revision numbers or the activity log manually; use the roadmap script.
- Do not mark work complete before its verification is actually successful.
- Keep roadmap updates and their corresponding implementation in the same delivery or commit once Git is initialized.
- Do not remove historical activity entries. Record corrections as new entries.
- Preserve a usable HTML experience when WebGL, JavaScript or motion is unavailable.

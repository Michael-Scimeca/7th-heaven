---
name: SpecTest: Proposal
description: Scaffold a new test change and validate strictly.
category: SpecTest
tags: [spectest, test-change]
---
<!-- SPECTEST:START -->
**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- Refer to `spectest/AGENTS.md` (located inside the `spectest/` directory—run `ls spectest` or `spectest update` if you don't see it) if you need additional SpecTest conventions or clarifications.
- Identify any vague or ambiguous details and ask the necessary follow-up questions before editing files.
- Do not write any code during the proposal stage. Only create design documents (proposal.md, tasks.md, design.md, and spec deltas). Implementation happens in the apply stage after approval.

**Steps**
1. Review `spectest/project.md`, run `spectest list` and `spectest list --specs`, and inspect related test code or docs (e.g., via `rg`/`ls`) to ground the test proposal in current behavior; note any coverage gaps that require clarification.
2. Choose a unique verb-led `change-id` and scaffold `proposal.md`, `tasks.md`, and `design.md` (when needed) under `spectest/changes/<id>/`.
3. Map the change into concrete test capabilities or test requirements, breaking multi-scope efforts into distinct spec deltas with clear relationships and sequencing.
4. Capture architectural reasoning in `design.md` when the solution spans multiple systems, introduces new patterns, or demands trade-off discussion before committing to specs.
5. Draft spec deltas in `changes/<id>/specs/<test-capability>/spec.md` (one folder per test capability) using `## ADDED|MODIFIED|REMOVED Requirements` with at least one `#### Scenario:` per test requirement describing test steps (WHEN) and expected outcomes (THEN), and cross-reference related test capabilities when relevant.
6. Draft `tasks.md` as an ordered list of small, verifiable implementation work items that deliver coverage progress, include validation, and highlight dependencies or parallelizable work.
7. Validate with `spectest validate <id> --strict` and resolve every issue before sharing the proposal.

**Reference**
- Use `spectest show <id> --json --deltas-only` or `spectest show <spec> --type spec` to inspect details when validation fails.
- Search existing test requirements with `rg -n "Requirement:|Scenario:" spectest/specs` before writing new ones.
- Explore the codebase with `rg <keyword>`, `ls`, or direct file reads so proposals align with current implementation realities.
<!-- SPECTEST:END -->

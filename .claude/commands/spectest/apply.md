---
name: SpecTest: Apply
description: Implement an approved test change and keep tasks in sync.
category: SpecTest
tags: [spectest, apply]
---
<!-- SPECTEST:START -->
**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when it is requested or clearly required.
- Keep changes tightly scoped to the requested outcome.
- Refer to `spectest/AGENTS.md` (located inside the `spectest/` directory—run `ls spectest` or `spectest update` if you don't see it) if you need additional SpecTest conventions or clarifications.

**Steps**
Track these steps as TODOs and complete them one by one.
1. Read `changes/<id>/proposal.md`, `design.md` (if present), and `tasks.md` to confirm scope and acceptance criteria.
2. **If this is an automation change and Playwright files don't exist**, scaffold them first:
   - Check if `playwright.config.ts` exists. If not, create it along with `tests/fixtures.ts` and `tests/seed.spec.ts`.
   - Use the Playwright scaffolding utility or create the files manually following Playwright conventions.
3. **For test planning tasks**: Use Playwright Planner workflow:
   - Run `spectest plan <spec-id>` to explore app and create test plans
   - Include `seed.spec.ts` in planning context
   - Navigate and explore interface to identify test scenarios
   - Save test plan to `specs/` directory
4. **For test generation tasks**: Use Playwright Generator workflow:
   - Run `spectest generate <plan-file>` to transform plans into tests
   - Generator will execute steps in real-time and verify selectors
   - Tests will be generated in `tests/` directory matching plan structure
5. **For test healing tasks**: Use Playwright Healer workflow:
   - Run `spectest heal` to automatically fix failing tests
   - Healer will systematically debug and fix issues
   - Continue until all tests pass
6. Work through remaining tasks sequentially, keeping edits minimal and focused on the requested change.
7. **After implementing changes, run tests with report and screenshot generation**:
   - Run `npm test` (or `pnpm test` / `yarn test` depending on package manager)
   - Tests will automatically generate HTML report in `playwright-report/` directory
   - Screenshots will be captured on test failures in `test-results/` directory
   - Review the HTML report at `playwright-report/index.html` to verify test results
8. Confirm completion before updating statuses—make sure every item in `tasks.md` is finished.
9. Update the checklist after all work is done so each task is marked `- [x]` and reflects reality.
10. Reference `spectest list` or `spectest show <item>` when additional context is required.

**Reference**
- Use `spectest show <id> --json --deltas-only` if you need additional context from the proposal while implementing.
<!-- SPECTEST:END -->

# Project Agent Directives

## 🩺 React Doctor Auto-Check Rule (MANDATORY)

After modifying any React component, hook, or API route in `src/`:
1. **Always run**: `npx react-doctor@latest --scope changed`
2. **Verify score**: Ensure the React Doctor score does NOT regress from 100/100 and no new warnings/errors are introduced.
3. **Auto-fix before completing**: Immediately resolve any flagged issues (e.g. side-effects in state updaters, missing res.ok checks, unversioned localStorage keys, missing dependencies) BEFORE reporting completion to the user or running git commit.

# Prioritized Action Items

1. Align dependencies and lockfiles
   - Pick Node 18, run `npm install` to update lockfiles, commit `package-lock.json`.

2. CI / PR checks
   - Added `.github/workflows/ci.yml` to run lint, tests and build on PRs.

3. Dependency updates
   - Added `.github/dependabot.yml` to keep deps updated weekly.

4. Pre-commit hooks
   - Added Husky pre-commit hook and `lint-staged` configuration to run ESLint and Prettier.

5. Formatting & editor config
   - Added `.prettierrc` and `.editorconfig` for consistent formatting.

6. Tests & coverage
   - Vitest is configured; expand tests and require coverage threshold in CI.

7. Performance & accessibility
   - See `PERFORMANCE_AND_ACCESSIBILITY.md` for next steps.

8. Docs
   - Added `CONTRIBUTING.md` and PR template.

Next recommended change to commit: run `npm install` in `jordan-hotels-app`, commit updated `package-lock.json`, then re-run `npm ci`.

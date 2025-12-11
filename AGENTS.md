# Repository Guidelines

## Project Structure & Module Organization
- Monorepo managed with Yarn 4 workspaces; packages live in `modules/*` (examples: `common`, `aws`, `node-only`, `ngx-acute-*`).
- Source lives in each package under `src/`; compiled output goes to `lib/`. Coverage and build artifacts typically land in `artifacts/` inside each package.
- Shared configs in repo root: `eslint.config.mjs`, `.prettierrc.json`, `tsconfig.json`, and `vitest.config.mts`. Tests alongside code as `*.spec.ts`.

## Build, Test, and Development Commands
- Install deps: `yarn install` (Node >=14.18). Yarn PnP is configured via `.yarn` directory.
- Full build: `yarn build` (wsrun serially builds all packages; Angular subpackages built via `yarn build-ng`).
- Targeted package build: from a package dir, `yarn mod:build`; watch mode `yarn mod:watch`.
- Lint: `yarn lint` (or `yarn lint-fix` to format + fix). Prettier config drives formatting.
- Tests: `yarn test` runs vitest across packages; coverage `yarn test-coverage`. Package-only: `cd modules/common && yarn mod:test`.

## Coding Style & Naming Conventions
- ESM-only TypeScript. Favor named exports over barrels (explicitly removed for tree-shaking).
- Prettier: 140-char line width, single quotes, arrow parens always. Honor existing lint disables before adding new ones.
- ESLint: strict TypeScript rules with stylistic set; unused vars must be `_`-prefixed. Class wrappers allowed where they provide namespacing.
- Filenames use kebab-case; tests mirror implementation path with `.spec.ts` suffix.

## Testing Guidelines
- Vitest configured in `vitest.config.mts`; `passWithNoTests: true` but add focused `*.spec.ts` per feature. Prefer deterministic unit tests over integration where possible.
 - Coverage output writes to `artifacts/coverage`; thresholds currently zero—call out meaningful coverage deltas in PRs.
- When adding AWS/IO helpers, stub external calls; avoid network access in tests.

## Commit & Pull Request Guidelines
- Commits in history are short and imperative (e.g., "Updating libs for security"); keep scope clear, ideally noting the package ("common: add date util").
- Before opening a PR: describe the change, list impacted packages, note dev commands run (`yarn test`, `yarn lint`, builds), and link any issues.
- For UI/Angular modules, include screenshots or brief behavior notes when altering visible output. Update README/package docs when adding scripts or env requirements.

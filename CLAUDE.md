# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Ratchet is a TypeScript utility library monorepo containing 15+ independently publishable packages. It provides common utilities for Node.js, browsers, AWS services, Angular applications, and more. The library is **ESM-only** and uses Yarn 3.6.1 workspaces.

## Development Commands

### Building
```bash
# Build all packages (non-Angular, then Angular)
yarn build

# Build only Angular packages
yarn build-ng

# Build a single module (from module directory)
cd modules/<module-name>
yarn mod:build

# Force rebuild
yarn mod:force-build

# Clean build artifacts
yarn clean
```

### Testing
```bash
# Run all tests across all modules
yarn test

# Run tests with coverage
yarn test-coverage

# Run tests for a single module (from module directory)
cd modules/<module-name>
yarn mod:test

# Run tests in watch mode (from module directory)
yarn mod:watch
```

### Linting & Formatting
```bash
# Lint all modules
yarn lint

# Lint and auto-fix
yarn lint-fix

# Format code (from module directory)
yarn mod:pretty

# Lint a single module (from module directory)
yarn mod:lint
```

### Running a Single Test
From a module directory:
```bash
cd modules/<module-name>
npx vitest run <test-file-pattern>
# Example: npx vitest run string-ratchet.spec
```

## Monorepo Architecture

### Package Organization

Packages are located in `modules/` and organized by domain:

**Core Foundation:**
- `@bitblit/ratchet-common` - Core utilities (strings, arrays, objects, math, JWT, templates, logging). Zero external deps except luxon/cross-fetch.

**AWS Integration:**
- `@bitblit/ratchet-aws` - AWS SDK v3 wrappers (browser + Node)
- `@bitblit/ratchet-aws-node-only` - Node-only AWS utilities
- `@bitblit/ratchet-epsilon-common` - Lightweight Lambda/API Gateway adapter
- `@bitblit/ratchet-epsilon-deployment` - AWS CDK deployment extensions

**Database:**
- `@bitblit/ratchet-rdbms` - PostgreSQL, MySQL, SQLite, AWS RDS Data API support

**Web:**
- `@bitblit/ratchet-graphql` - GraphQL client utilities
- `@bitblit/ratchet-misc` - Handlebars, Swagger validation, OpenAPI generators
- `@bitblit/ratchet-echarts` - ECharts visualization wrapper

**Node.js:**
- `@bitblit/ratchet-node-only` - Node-specific utilities + CLI binary (`ratchet-cli`)

**Authentication:**
- `@bitblit/ratchet-warden-common` - WebAuthn client wrappers
- `@bitblit/ratchet-warden-server` - WebAuthn server + AWS integration

**Angular:**
- `@bitblit/ngx-acute-common` - Angular components, services, pipes (built with PrimeNG)
- `@bitblit/ngx-acute-warden` - Angular WebAuthn UI

**Other:**
- `@bitblit/ratchet-maze` - Maze generation utilities

### Dependency Hierarchy

```
ratchet-common (foundation)
    ├── aws → aws-node-only → epsilon-common → epsilon-deployment
    ├── rdbms
    ├── graphql
    ├── misc
    ├── echarts
    ├── node-only
    ├── warden-common → warden-server
    └── ngx-acute-common → ngx-acute-warden
```

Most packages depend on `ratchet-common` and use peer/optional dependencies for heavy libraries.

## Key Architectural Patterns

### 1. ESM-Only Module System
- All packages export ESM modules only (no CommonJS)
- Use `.js` extensions in import statements (TypeScript requirement for ESM)
- **No barrel files** - they were explicitly removed to improve tree-shaking

### 2. Optional Dependencies Philosophy
- Heavy dependencies (AWS SDK, GraphQL, Angular) are declared as `optionalDependencies` or `peerDependencies`
- Users install only what they need
- Check `package.json` `optionalDependencies` section before using advanced features

### 3. Workspace Script Pattern
All `mod:*` scripts in root `package.json` use `cd $INIT_CWD` to delegate to individual modules. Run them from the root, and they execute in the correct module context.

### 4. Separate Node/Browser Packages
- Packages with `-node-only` suffix require Node.js runtime
- Core packages (aws, common, graphql) work in both environments
- Angular packages (`ngx-*`) are browser-focused

## Build System Details

### TypeScript Configuration
- Root `tsconfig.json` provides base config (ESNext target, strict mode)
- Each module extends root config with module-specific settings
- Output directory: `lib/` (gitignored)
- Source directory: `src/`

### Build Tools by Package Type
- **Standard packages:** `tsc` (TypeScript compiler)
- **Angular packages:** `ngc` (Angular compiler) + Rollup bundling
- **Source maps:** Always generated
- **Type declarations:** Generated for all packages

### Testing Infrastructure
- **Test runner:** Vitest 4.x
- **Test pattern:** `*.spec.ts` files
- **Coverage:** Istanbul (default) or V8
- **Isolation:** Tests run in `forks` pool mode
- **Config:** Root `vitest.config.mts` with workspace support

## Important Conventions

### Code Style
- **Prettier:** 140 character width, single quotes, arrow parens: always
- **ESLint:** TypeScript strict mode enabled
- **Unused variables:** Prefix with `_` to allow (e.g., `_unusedParam`)

### Import Patterns
Since barrel files are removed:
```typescript
// ❌ Don't do this (barrel file doesn't exist)
import { StringRatchet } from '@bitblit/ratchet-common';

// ✅ Do this instead (direct import)
import { StringRatchet } from '@bitblit/ratchet-common/string-ratchet';
```

### AWS Library Compatibility
All AWS SDK packages are pinned to compatible versions to avoid `@smithy/types` version conflicts. When upgrading AWS libraries, upgrade all AWS-related packages together.

### File Naming
- Source files: kebab-case (`string-ratchet.ts`)
- Test files: `*.spec.ts` suffix
- TypeScript config: `tsconfig.json` per module

## Working with Angular Packages

Angular packages (`ngx-acute-common`, `ngx-acute-warden`) require special handling:

1. **Separate build command:** `yarn build-ng` (excluded from main build)
2. **Angular compiler:** Uses `ngc` instead of `tsc`
3. **Dependencies:** Angular 20.3.7 + PrimeNG 20.2.0
4. **Build tool:** Analog.js Vite plugin for compilation
5. **Output format:** ESM2022

## AWS Region Defaults

Most AWS utilities default to `us-east-1` region. This is intentional (author's preference). Override region parameters if needed.

## Publishing Workflow

Publishing is handled via GitHub Actions:
1. Commit changes to branch
2. Create release tag (`mytag release`)
3. Push with tags: `git push origin master --tags`
4. CI runs `set-codependencies.sh` to set versions
5. CI publishes all packages to npm

Version format: `5.1.<GITHUB_RUN_NUMBER>` (or `-alpha` suffix for alpha releases)

## Module-Specific Notes

### ratchet-common
The foundation. Keep dependencies minimal - only luxon and cross-fetch allowed.

### ratchet-aws
Wraps AWS SDK v3 services. Each service wrapper is in a separate file under `src/` (e.g., `s3-ratchet.ts`, `dynamodb-ratchet.ts`).

### ratchet-epsilon-common
Lightweight Lambda framework. Check `epsilon-common/src/` for request/response models and routing utilities.

### ratchet-node-only
Includes `ratchet-cli` binary. To use locally: `npx ratchet-cli <command>`.

### ngx-acute-common
Angular component library with PrimeNG. Components in `src/components/`, services in `src/services/`, pipes in `src/pipes/`.

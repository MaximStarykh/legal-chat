# AGENTS — Guidelines for AI Contributions

This file explains how AI-assisted developers should interact with this repository. It may be overridden by more specific `AGENTS.md` files in subdirectories.

## Code Style

- **Stack**: TypeScript with React 19
- **Indentation**: 2 spaces
- **Imports**: use the `@/` alias for modules under `src`
- **Formatting**: run `npx prettier --write .`
- **Linting**: run `npx eslint . --ext .ts,.tsx`
- Use `camelCase` for variables and `PascalCase` for React components
- Avoid abbreviations

## Running the Project

1. `npm install`
2. `npm run dev`

## Programmatic Checks

Before committing, run:

```sh
npm run build
```

## Pull Request Format

- **Title** prefix: `[Feat]`, `[Fix]`, or `[Chore]`
- **Body** must include:
  - Summary of changes
  - Testing section
  - Linked issue (e.g., `Closes #123`)

## Directory Overview

- `src/components`
- `src/hooks`
- `src/services`
- `src/types`
- `styles`

## Additional Guidelines

- Keep commits small and focused
- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
- Do not modify `/infra` or `/configs` unless explicitly instructed

## Warning

Never commit `.env` files or credentials.

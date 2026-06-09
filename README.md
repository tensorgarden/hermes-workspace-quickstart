# Hermes Workspace Quickstart

A practical guide for setting up a private AI workspace using Hermes Agent. Run
autonomous AI agents on your own hardware with local LLMs -- no data leaves your
network.

## Problem

Engineering teams and technical founders want AI agents that can write code,
review PRs, summarize meetings, and run data pipelines. But:

- Sending proprietary code and internal data to cloud APIs is a security risk.
- Per-token pricing on cloud models adds up fast at scale.
- Many organizations have compliance requirements that mandate on-premise
  processing.
- Opaque data-retention policies make legal teams nervous.

**The solution:** Run capable AI agents entirely on your own infrastructure
using open-source models. This quickstart shows you exactly how.

## What This Covers

- **Provider configuration** -- connect Hermes Agent to Ollama, LM Studio, or
  cloud providers
- **Workspace management** -- bundle models, skills, and schedules into named
  agent instances
- **Skill definitions** -- declare tools and triggers that make agents
  autonomous
- **Agent profiles** -- tailor system prompts, temperature, and token limits
  per role
- **Cron scheduling** -- run agents on a schedule for hands-free operation
- **Verification** -- end-to-end checklist to confirm everything works

## Who It's For

- Engineering leads who want to introduce AI agents without cloud dependencies
- Technical founders building AI-assisted internal tools on private
  infrastructure
- DevOps engineers evaluating on-premise agent orchestration
- Anyone who wants to understand how a private AI agent OS works before
  deploying

## Features

- **100% local** -- models run on your GPU or CPU, zero data exfiltration
- **Open-source stack** -- Ollama, LM Studio, and open-weight models
- **Cron-driven** -- schedule autonomous workflows (code review, standups, ETL)
- **Skill composability** -- install community skills or write your own
- **Multi-provider** -- switch between local and cloud models per workspace
- **Memory support** -- agents retain context across sessions when enabled

## Tech Stack

| Layer          | Technology                               |
| -------------- | ---------------------------------------- |
| Agent OS       | Hermes Agent                             |
| Local LLMs     | Ollama / LM Studio                       |
| Models         | Llama 3.2, CodeLlama, Mistral, DeepSeek  |
| Frontend       | Next.js 15, React 19, Tailwind CSS       |
| Testing        | Vitest                                   |
| Language       | TypeScript                               |

## Quick Start

```bash
# Clone the repo
git clone https://github.com/tensorgarden/hermes-workspace-quickstart.git
cd hermes-workspace-quickstart

# Install dependencies
npm install

# Run the docs site locally
npm run dev
# Open http://localhost:3000

# Run tests
npm test

# Check types and lint
npm run typecheck
npm run lint

# Build for production
npm run build
```

## Verification

All four gates must pass before this repo is considered complete:

```bash
npm run lint       # Zero warnings (--max-warnings=0)
npm run typecheck  # tsc --noEmit passes
npm test           # All vitest tests pass
npm run build      # Next.js production build succeeds
```

## Project Structure

```
hermes-workspace-quickstart/
  src/
    app/
      globals.css        # Tailwind + global styles
      layout.tsx          # Root layout with metadata
      page.tsx            # Documentation-style single page
    lib/
      types.ts            # TypeScript interfaces
      demo-data.ts        # Sample configs and definitions
  tests/
    workspace.test.ts     # Vitest data integrity tests
  next.config.ts
  tailwind.config.ts
  vitest.config.ts
  eslint.config.mjs
  tsconfig.json
  package.json
```

## License

MIT

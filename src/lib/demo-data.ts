import type { WorkspaceConfig, SkillDefinition, AgentProfile, ProviderConfig } from "./types";

export const demoProviders: ProviderConfig[] = [
  {
    name: "Ollama (Local)",
    type: "local",
    endpoint: "http://localhost:11434",
    models: ["llama3.2", "mistral", "deepseek-r1:8b", "codellama"],
    requiresApiKey: false,
    secretHandling: "none",
    securityNotes: [
      "No API key is required for local inference.",
      "Bind the Ollama endpoint to localhost unless remote access is explicitly needed.",
    ],
    setupCommand: "curl -fsSL https://ollama.com/install.sh | sh",
  },
  {
    name: "LM Studio",
    type: "local",
    endpoint: "http://localhost:1234/v1",
    models: ["llama-3.2-3b-instruct", "mistral-7b-instruct-v0.3"],
    requiresApiKey: false,
    secretHandling: "none",
    securityNotes: [
      "Keep the local server bound to localhost for private workspaces.",
      "Disable sharing mode before loading proprietary prompts or documents.",
    ],
    setupCommand: "# Download from https://lmstudio.ai",
  },
  {
    name: "OpenAI (Cloud)",
    type: "cloud",
    endpoint: "https://api.openai.com/v1",
    models: ["gpt-4o", "gpt-4o-mini"],
    requiresApiKey: true,
    secretHandling: "environment-variable",
    securityNotes: [
      "Store the API key outside the repo in the Hermes env file or a secret manager.",
      "Avoid logging environment dumps because crash reports can expose secrets.",
    ],
    setupCommand: "# Add OPENAI_API_KEY to $(hermes config env-path)",
  },
];

export const demoSKills: SkillDefinition[] = [
  {
    name: "code-review",
    description: "Performs automated code review on pull requests, checking for bugs, style issues, and security vulnerabilities.",
    category: "development",
    tools: ["read_file", "search_files", "terminal", "patch"],
    triggers: ["review this PR", "check my code", "audit this file"],
  },
  {
    name: "daily-standup",
    description: "Generates a daily standup summary from git commits and open issues across the team's repos.",
    category: "productivity",
    tools: ["terminal", "search_files"],
    triggers: ["daily standup", "what did we do today", "standup summary"],
  },
  {
    name: "data-pipeline",
    description: "Orchestrates data extraction, transformation, and loading from configured sources into a local database.",
    category: "data",
    tools: ["terminal", "write_file", "read_file"],
    triggers: ["run pipeline", "refresh data", "ETL job"],
  },
  {
    name: "slack-digest",
    description: "Summarizes Slack channel activity from the last 24 hours and surfaces action items.",
    category: "communication",
    tools: ["terminal"],
    triggers: ["slack digest", "channel summary", "what did I miss"],
  },
  {
    name: "docs-generator",
    description: "Generates and updates technical documentation from source code and inline comments.",
    category: "development",
    tools: ["read_file", "search_files", "write_file"],
    triggers: ["generate docs", "update documentation", "docstrings"],
  },
];

const workspaceSafetyBaseline = [
  {
    title: "Workspace-scoped writes",
    description:
      "Allow writes only inside the active workspace; shell dotfiles, global configs, and agent config files stay human-owned.",
    evidence:
      "Mitigates indirect prompt-injection paths that persist through shell startup files or agent settings.",
  },
  {
    title: "Network egress review",
    description:
      "Restrict outbound requests to known provider, repository, and service endpoints; require approval for new destinations.",
    evidence:
      "Reduces exfiltration risk when an agent follows untrusted repository, MCP, or tool output instructions.",
  },
  {
    title: "Runtime audit trail",
    description:
      "Record sensitive terminal, patch, and external API actions with the delegated user, requested scope, and approval reason.",
    evidence:
      "Gives teams replayable accountability for policy decisions across autonomous workspace runs.",
  },
] satisfies WorkspaceConfig["safetyControls"];

export const demoWorkspaces: WorkspaceConfig[] = [
  {
    name: "Engineering Assistant",
    description: "Code review, debugging, and PR management for the platform team.",
    provider: "Ollama (Local)",
    model: "codellama",
    skills: ["code-review", "docs-generator"],
    memory: true,
    cron: ["*/30 * * * * review open PRs"],
    plugins: ["git", "github"],
    toolAllowlist: ["terminal", "read_file", "search_files", "patch", "write_file"],
    safetyControls: workspaceSafetyBaseline,
  },
  {
    name: "Productivity Hub",
    description: "Daily standups, meeting notes, and Slack digest for the product team.",
    provider: "LM Studio",
    model: "llama-3.2-3b-instruct",
    skills: ["daily-standup", "slack-digest"],
    memory: true,
    cron: ["0 9 * * 1-5 generate standup"],
    plugins: ["slack", "notion"],
    toolAllowlist: ["terminal", "search_files", "read_file"],
    safetyControls: workspaceSafetyBaseline,
  },
  {
    name: "Data Pipeline Runner",
    description: "Scheduled ETL jobs pulling from PostgreSQL into local analytics.",
    provider: "Ollama (Local)",
    model: "mistral",
    skills: ["data-pipeline"],
    memory: false,
    cron: ["0 */6 * * * run pipeline"],
    plugins: ["postgres", "duckdb"],
    toolAllowlist: ["terminal", "read_file", "write_file"],
    safetyControls: workspaceSafetyBaseline,
  },
];

export const demoProfiles: AgentProfile[] = [
  {
    name: "Code Reviewer",
    description: "Thorough and constructive code reviewer. Flags bugs, performance issues, and security concerns.",
    systemPrompt: "You are an expert code reviewer. Analyze code changes for correctness, performance, security, and maintainability. Provide actionable feedback with specific line references.",
    skills: ["code-review"],
    provider: "Ollama (Local)",
    model: "codellama",
    temperature: 0.3,
    maxTokens: 4096,
  },
  {
    name: "Standup Bot",
    description: "Concise daily standup generator. Summarizes git activity and open issues.",
    systemPrompt: "You generate daily standup summaries. Be brief and factual. List what was done yesterday, what is planned today, and any blockers.",
    skills: ["daily-standup"],
    provider: "LM Studio",
    model: "llama-3.2-3b-instruct",
    temperature: 0.5,
    maxTokens: 2048,
  },
  {
    name: "Pipeline Operator",
    description: "Reliable data pipeline orchestrator. Handles ETL with error recovery.",
    systemPrompt: "You manage data pipelines. Execute ETL steps in order, log progress, and retry on transient failures. Report summary statistics after each run.",
    skills: ["data-pipeline"],
    provider: "Ollama (Local)",
    model: "mistral",
    temperature: 0.1,
    maxTokens: 8192,
  },
];

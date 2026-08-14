import type { WorkspaceConfig, SkillDefinition, AgentProfile, ProviderConfig, MCPServerConfig } from "./types";

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

export const demoMCPServers: MCPServerConfig[] = [
  {
    name: "Filesystem (built-in)",
    type: "stdio",
    command: "npx",
    args: ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/documents"],
    timeoutSeconds: 10,
    tools: ["read_file", "write_file", "list_files"],
    securityBoundary: "localhost",
    errorRecovery: {
      maxRetries: 3,
      retryDelayMs: 500,
      requiresManualRestart: false,
    },
    runtimeRequirements: ["node >= 18", "npx"],
  },
  {
    name: "Web Browser Control",
    type: "http",
    command: "python -m mcp_browser_server",
    environment: {
      MCP_BROWSER_PORT: "8765",
      MCP_BROWSER_HOST: "localhost",
    },
    timeoutSeconds: 30,
    tools: ["navigate", "click", "type", "screenshot"],
    securityBoundary: "localhost",
    errorRecovery: {
      maxRetries: 2,
      retryDelayMs: 1000,
      requiresManualRestart: false,
    },
    runtimeRequirements: ["python >= 3.10", "chrome or firefox"],
  },
  {
    name: "Git Repository Tools",
    type: "stdio",
    command: "python",
    args: ["-m", "mcp_git"],
    timeoutSeconds: 15,
    tools: ["list_branches", "show_diff", "commit"],
    securityBoundary: "localhost",
    errorRecovery: {
      maxRetries: 2,
      retryDelayMs: 500,
      requiresManualRestart: false,
    },
    runtimeRequirements: ["python >= 3.10", "git"],
  },
  {
    name: "Slack Integration (requires auth)",
    type: "http",
    command: "node slack-mcp-bridge.js",
    environment: {
      SLACK_BOT_TOKEN: "process.env.SLACK_TOKEN",
      MCP_SLACK_PORT: "9000",
    },
    timeoutSeconds: 20,
    tools: ["send_message", "list_channels", "get_thread"],
    securityBoundary: "authenticated-private",
    errorRecovery: {
      maxRetries: 1,
      retryDelayMs: 2000,
      requiresManualRestart: true,
    },
    runtimeRequirements: ["node >= 18", "SLACK_TOKEN env var"],
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
    auditSignals: ["agent-tool-call", "team-project-attribution"],
  },
  {
    title: "Canonical path containment",
    description:
      "Resolve each write target to its canonical path and block symlinks or path traversal that point outside the active workspace boundary.",
    evidence:
      "Prevents a local-looking approval from hiding the true external target, preserving informed consent before filesystem changes.",
    auditSignals: [
      "agent-tool-call",
      "canonical-path-check",
      "team-project-attribution",
    ],
  },
  {
    title: "Credential access review",
    description:
      "Block ambient credential reads such as env dumps, shell history, SSH keys, CI tokens, and cloud profiles unless the run documents the secret class and human-approved need.",
    evidence:
      "Addresses the agent-security failure mode where coding agents inherit user cloud keys, repository tokens, and deployment credentials without a separate agent identity.",
    auditSignals: [
      "developer-prompt",
      "agent-tool-call",
      "credential-access",
      "team-project-attribution",
    ],
  },
  {
    title: "High-impact action checkpoint",
    description:
      "Require a named human to approve the exact tool, target, and parameters for destructive, irreversible, financial, administrative, or externally visible actions; approvals expire and cannot be replayed after scope changes.",
    evidence:
      "Counters excessive agency by separating the model's decision from execution and preventing broad approvals from authorizing a different action.",
    auditSignals: [
      "developer-prompt",
      "agent-tool-call",
      "action-approval",
      "team-project-attribution",
    ],
  },
  {
    title: "Delegated execution boundary",
    description:
      "Give each delegated sub-agent only the minimum tools, data, and destinations required for its task; its authority cannot exceed the parent run or widen through a delegation chain.",
    evidence:
      "Prevents un-scoped privilege inheritance while preserving parent-child lineage when a manager agent hands work to a specialist.",
    auditSignals: [
      "developer-prompt",
      "agent-tool-call",
      "delegation-boundary",
      "team-project-attribution",
    ],
  },
  {
    title: "Extension installation review",
    description:
      "Keep skills, plugins, hooks, and MCP definitions human-owned; require a named reviewer to verify the publisher, pinned version, requested tools, and destination scope before installation or updates.",
    evidence:
      "Contains agent supply-chain risk by preventing untrusted workspace content from silently installing persistent code or widening tool and network authority.",
    auditSignals: [
      "developer-prompt",
      "agent-tool-call",
      "untrusted-source",
      "extension-install-review",
      "team-project-attribution",
    ],
  },
  {
    title: "MCP tool schema integrity",
    description:
      "Snapshot and hash each approved MCP server identity, tool name, description, input schema, and annotation; block calls and require named re-review when the tool list or schema drifts.",
    evidence:
      "Contains tool poisoning, schema poisoning, tool shadowing, and rug-pull updates so model-controlled tools cannot silently change after approval.",
    auditSignals: [
      "developer-prompt",
      "agent-tool-call",
      "untrusted-source",
      "tool-schema-integrity",
      "extension-install-review",
      "action-approval",
      "team-project-attribution",
    ],
  },
  {
    title: "MCP tool output validation",
    description:
      "Validate MCP responses against a strict output schema, reject unexpected fields, and quarantine free-form instructions before any downstream tool or external action.",
    evidence:
      "Contains runtime tool-output poisoning that can bypass installation-time review when a trusted server returns hostile or structurally invalid data.",
    auditSignals: [
      "agent-tool-call",
      "untrusted-source",
      "tool-output-validation",
      "action-approval",
      "team-project-attribution",
    ],
  },
  {
    title: "MCP server exposure review",
    description:
      "Bind MCP servers to localhost or an authenticated private interface; block 0.0.0.0 and public-internet bindings, and deny requests toward link-local cloud metadata endpoints such as 169.254.169.254 or internal address ranges.",
    evidence:
      "Addresses the 2026 pattern of internet-exposed MCP servers running with no authentication and SSRF paths that turn one misconfigured server into cloud credential theft.",
    auditSignals: [
      "agent-tool-call",
      "network-request",
      "untrusted-source",
      "mcp-server-exposure",
      "team-project-attribution",
    ],
  },
  {
    title: "Network egress review",
    description:
      "Restrict outbound requests to known provider, repository, and service endpoints; require approval for new destinations.",
    evidence:
      "Reduces exfiltration risk when an agent follows untrusted repository, MCP, or tool output instructions.",
    auditSignals: ["network-request", "team-project-attribution"],
  },
  {
    title: "Untrusted content quarantine",
    description:
      "Treat repository files, issue comments, web pages, and MCP/tool output as untrusted context; they can inform analysis but cannot choose commands, remotes, or webhook targets.",
    evidence:
      "Addresses prompt-injection attacks where hostile content tries to turn agent tool access into data exfiltration or persistence.",
    auditSignals: ["developer-prompt", "agent-tool-call", "network-request", "untrusted-source"],
  },
  {
    title: "Private-data egress boundary",
    description:
      "When a workspace holds private code, meeting notes, or customer data and also reads untrusted content, any external message or export must show the data class and approval state before it leaves.",
    evidence:
      "Addresses the agentic risk pattern where private data, untrusted prompt content, and external communication combine into an exfiltration path.",
    auditSignals: [
      "agent-tool-call",
      "network-request",
      "untrusted-source",
      "team-project-attribution",
    ],
  },
  {
    title: "Persistent memory review",
    description:
      "Validate and sanitize untrusted content before a durable memory write; isolate memory by workspace and session, block secrets, and expire records unless a named owner approves retention.",
    evidence:
      "Limits memory poisoning so injected instructions or sensitive context cannot silently influence later agent runs.",
    auditSignals: [
      "developer-prompt",
      "untrusted-source",
      "credential-access",
      "memory-write",
      "team-project-attribution",
    ],
  },
  {
    title: "Runtime audit trail",
    description:
      "Record sensitive terminal, patch, and external API actions with the delegated user, requested scope, and approval reason.",
    evidence:
      "Gives teams replayable accountability for policy decisions across autonomous workspace runs.",
    auditSignals: [
      "developer-prompt",
      "agent-tool-call",
      "network-request",
      "team-project-attribution",
    ],
  },
] satisfies WorkspaceConfig["safetyControls"];

const workspaceEgressPolicies = {
  engineering: {
    allowedDestinations: ["localhost:11434", "github.com", "api.github.com"],
    reviewTriggers: [
      "new git remotes",
      "package registries outside the approved mirror",
      "external webhook targets",
    ],
    approvalOwner: "Platform engineering lead",
    approvalRequiredFor: [
      "new git remotes",
      "package registries outside the approved mirror",
      "external webhook targets",
      "exports that include private source snippets",
    ],
    reviewSlaHours: 4,
    evidence:
      "Repository automation can read proprietary source, so every outbound host is explicit and new destinations route through review before the agent can connect.",
  },
  productivity: {
    allowedDestinations: ["localhost:1234", "slack.com", "api.notion.com"],
    reviewTriggers: [
      "new SaaS connectors",
      "public webhook URLs",
      "exports that include meeting notes or customer names",
    ],
    approvalOwner: "Product operations owner",
    approvalRequiredFor: [
      "new SaaS connectors",
      "public webhook URLs",
      "exports that include meeting notes or customer names",
    ],
    reviewSlaHours: 8,
    evidence:
      "Meeting and Slack summaries often contain sensitive context; connector egress is visible before data leaves the workspace.",
  },
  dataPipeline: {
    allowedDestinations: ["localhost:11434", "postgres.internal", "duckdb-local-file"],
    reviewTriggers: [
      "new database hosts",
      "cloud object storage buckets",
      "vendor API exports",
    ],
    approvalOwner: "Data platform steward",
    approvalRequiredFor: [
      "new database hosts",
      "cloud object storage buckets",
      "vendor API exports",
      "bulk exports containing customer or operational data",
    ],
    reviewSlaHours: 4,
    evidence:
      "ETL agents can move bulk data quickly, so database and export destinations are declared separately from generic terminal access.",
  },
} satisfies Record<string, WorkspaceConfig["networkEgressPolicy"]>;

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
    networkEgressPolicy: workspaceEgressPolicies.engineering,
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
    toolAllowlist: ["terminal", "search_files"],
    networkEgressPolicy: workspaceEgressPolicies.productivity,
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
    networkEgressPolicy: workspaceEgressPolicies.dataPipeline,
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

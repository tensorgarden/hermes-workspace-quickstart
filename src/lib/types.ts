export type AuditSignal =
  | "developer-prompt"
  | "agent-tool-call"
  | "network-request"
  | "team-project-attribution";

export interface WorkspaceSafetyControl {
  title: string;
  description: string;
  evidence: string;
  auditSignals: AuditSignal[];
}

export interface NetworkEgressPolicy {
  allowedDestinations: string[];
  reviewTriggers: string[];
  evidence: string;
}

export interface WorkspaceConfig {
  name: string;
  description: string;
  provider: string;
  model: string;
  skills: string[];
  memory: boolean;
  cron: string[];
  plugins: string[];
  toolAllowlist?: string[];
  networkEgressPolicy: NetworkEgressPolicy;
  safetyControls: WorkspaceSafetyControl[];
}

export interface SkillDefinition {
  name: string;
  description: string;
  category: "productivity" | "development" | "data" | "communication";
  tools: string[];
  triggers: string[];
}

export interface AgentProfile {
  name: string;
  description: string;
  systemPrompt: string;
  skills: string[];
  provider: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

export interface ProviderConfig {
  name: string;
  type: "local" | "cloud";
  endpoint: string;
  models: string[];
  requiresApiKey: boolean;
  secretHandling: "none" | "environment-variable" | "runtime-injection";
  securityNotes: string[];
  setupCommand: string;
}

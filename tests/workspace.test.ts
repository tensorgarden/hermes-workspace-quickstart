import { describe, it, expect } from "vitest";
import {
  demoProviders,
  demoSKills,
  demoWorkspaces,
  demoProfiles,
  demoMCPServers,
} from "../src/lib/demo-data";
import type { AuditSignal } from "../src/lib/types";

describe("Provider Configs", () => {
  it("all providers have required fields", () => {
    for (const p of demoProviders) {
      expect(p.name).toBeTruthy();
      expect(["local", "cloud"]).toContain(p.type);
      expect(p.endpoint).toBeTruthy();
      expect(p.models.length).toBeGreaterThan(0);
      expect(typeof p.requiresApiKey).toBe("boolean");
      expect(p.setupCommand).toBeTruthy();
    }
  });

  it("local providers do not require API keys", () => {
    const localProviders = demoProviders.filter((p) => p.type === "local");
    for (const p of localProviders) {
      expect(p.requiresApiKey).toBe(false);
      expect(p.secretHandling).toBe("none");
    }
  });

  it("cloud providers document safe runtime secret handling", () => {
    const cloudProviders = demoProviders.filter((p) => p.type === "cloud");
    for (const p of cloudProviders) {
      expect(p.requiresApiKey).toBe(true);
      expect(p.secretHandling).not.toBe("none");
      expect(p.setupCommand).not.toMatch(/sk-[A-Za-z0-9]/);
      expect(p.securityNotes.join(" ")).toMatch(/runtime|repo|log/i);
    }
  });

  it("all provider endpoints are valid URLs", () => {
    for (const p of demoProviders) {
      const url = new URL(p.endpoint);
      expect(url.protocol).toMatch(/^https?:$/);
      expect(url.hostname).toBeTruthy();
    }
  });
});

describe("Skill Definitions", () => {
  it("all skills have required fields", () => {
    for (const s of demoSKills) {
      expect(s.name).toBeTruthy();
      expect(s.description).toBeTruthy();
      expect([
        "productivity",
        "development",
        "data",
        "communication",
      ]).toContain(s.category);
      expect(s.tools.length).toBeGreaterThan(0);
      expect(s.triggers.length).toBeGreaterThan(0);
    }
  });

  it("skill names do not contain whitespace", () => {
    for (const s of demoSKills) {
      expect(s.name).not.toMatch(/\s/);
    }
  });

  it("all skill triggers are unique within each skill", () => {
    for (const s of demoSKills) {
      const unique = new Set(s.triggers);
      expect(unique.size).toBe(s.triggers.length);
    }
  });
});

describe("Workspace Configs", () => {
  it("all workspaces reference existing providers and skills", () => {
    const providerNames = new Set(demoProviders.map((p) => p.name));
    const skillNames = new Set(demoSKills.map((s) => s.name));

    for (const ws of demoWorkspaces) {
      expect(providerNames.has(ws.provider)).toBe(true);
      for (const skill of ws.skills) {
        expect(skillNames.has(skill)).toBe(true);
      }
    }
  });

  it("all workspaces have at least one skill", () => {
    for (const ws of demoWorkspaces) {
      expect(ws.skills.length).toBeGreaterThan(0);
    }
  });

  it("all workspaces document runtime safety controls", () => {
    for (const ws of demoWorkspaces) {
      expect(ws.safetyControls.length).toBeGreaterThanOrEqual(3);
      const narrative = ws.safetyControls
        .flatMap((control) => [
          control.title,
          control.description,
          control.evidence,
        ])
        .join(" ");

      expect(narrative).toMatch(/workspace|write/i);
      expect(narrative).toMatch(/network|egress|outbound/i);
      expect(narrative).toMatch(/audit|delegated|policy|approval/i);
    }
  });

  it("safety controls cover prompts, tool calls, network activity, and attribution", () => {
    const requiredSignals: AuditSignal[] = [
      "developer-prompt",
      "agent-tool-call",
      "network-request",
      "untrusted-source",
      "team-project-attribution",
      "credential-access",
      "action-approval",
      "extension-install-review",
      "tool-output-validation",
      "memory-write",
      "audit-log-integrity",
    ];

    for (const ws of demoWorkspaces) {
      const signals = new Set(
        ws.safetyControls.flatMap((control) => control.auditSignals)
      );

      for (const signal of requiredSignals) {
        expect(signals.has(signal)).toBe(true);
      }
    }
  });

  it("keeps untrusted prompt sources from choosing outbound actions", () => {
    for (const ws of demoWorkspaces) {
      const signals = new Set(
        ws.safetyControls.flatMap((control) => control.auditSignals)
      );
      const narrative = ws.safetyControls
        .flatMap((control) => [
          control.title,
          control.description,
          control.evidence,
        ])
        .join(" ");

      expect(signals.has("untrusted-source")).toBe(true);
      expect(narrative).toMatch(/untrusted|prompt-injection|MCP|tool output/i);
      expect(narrative).toMatch(/commands|remotes|webhook|outbound|egress/i);
    }
  });

  it("requires parameter-bound human approval for high-impact actions", () => {
    for (const ws of demoWorkspaces) {
      const approvalControl = ws.safetyControls.find((control) =>
        control.auditSignals.includes("action-approval")
      );
      const narrative = approvalControl
        ? [approvalControl.title, approvalControl.description, approvalControl.evidence].join(" ")
        : "";

      expect(approvalControl).toBeDefined();
      expect(narrative).toMatch(/destructive|irreversible|financial|administrative|externally visible/i);
      expect(narrative).toMatch(/human|approve|approval/i);
      expect(narrative).toMatch(/tool|target|parameter|scope/i);
      expect(narrative).toMatch(/expire|replay/i);
      expect(narrative).toMatch(/excessive agency|decision.*execution/i);
    }
  });

  it("documents credential inheritance review before agents can read secrets", () => {
    for (const ws of demoWorkspaces) {
      const signals = new Set(
        ws.safetyControls.flatMap((control) => control.auditSignals)
      );
      const narrative = ws.safetyControls
        .flatMap((control) => [
          control.title,
          control.description,
          control.evidence,
        ])
        .join(" ");

      expect(signals.has("credential-access")).toBe(true);
      expect(narrative).toMatch(/credential|secret|token|cloud key|SSH key/i);
      expect(narrative).toMatch(/block|review|approval|human-approved/i);
      expect(narrative).toMatch(/inherit|separate agent identity|deployment credential/i);
    }
  });

  it("rotates short-lived agent credentials instead of keeping long-lived config secrets", () => {
    for (const ws of demoWorkspaces) {
      const lifecycleControl = ws.safetyControls.find((control) =>
        control.auditSignals.includes("credential-lifecycle")
      );
      const narrative = lifecycleControl
        ? [lifecycleControl.title, lifecycleControl.description, lifecycleControl.evidence].join(" ")
        : "";

      expect(lifecycleControl).toBeDefined();
      expect(narrative).toMatch(/short-lived|just-in-time/i);
      expect(narrative).toMatch(/expir|rotat|revok/i);
      expect(narrative).toMatch(/long-lived|standing privilege|static/i);
      expect(narrative).toMatch(/workspace|task|scope/i);
    }
  });

  it("blocks symlink writes that resolve outside the workspace boundary", () => {
    for (const ws of demoWorkspaces) {
      const pathControl = ws.safetyControls.find((control) =>
        /symlink|canonical path/i.test(`${control.title} ${control.description}`)
      );

      expect(pathControl).toBeDefined();
      expect(pathControl?.auditSignals).toContain("canonical-path-check");
      expect(pathControl?.description).toMatch(/resolve|canonical|real path/i);
      expect(pathControl?.description).toMatch(/outside|workspace boundary/i);
      expect(pathControl?.evidence).toMatch(/true target|approval|consent/i);
    }
  });

  it("keeps private data, untrusted context, and external communications separated until review", () => {
    for (const ws of demoWorkspaces) {
      const narrative = ws.safetyControls
        .flatMap((control) => [
          control.title,
          control.description,
          control.evidence,
        ])
        .join(" ");

      expect(narrative).toMatch(/private (code|data)|meeting notes|customer data/i);
      expect(narrative).toMatch(/untrusted/i);
      expect(narrative).toMatch(/external|export|egress/i);
      expect(narrative).toMatch(/approval|review/i);
    }
  });

  it("keeps runtime audit trails append-only and tied to policy decisions", () => {
    for (const ws of demoWorkspaces) {
      const auditControl = ws.safetyControls.find((control) =>
        /runtime audit/i.test(control.title)
      );

      expect(auditControl).toBeDefined();
      const narrative = auditControl
        ? [
            auditControl.title,
            auditControl.description,
            auditControl.evidence,
          ].join(" ")
        : "";

      expect(auditControl?.auditSignals).toContain("audit-log-integrity");
      expect(narrative).toMatch(/delegated user/i);
      expect(narrative).toMatch(/requested scope/i);
      expect(narrative).toMatch(/approval state|approval reason/i);
      expect(narrative).toMatch(/policy decision/i);
      expect(narrative).toMatch(/downstream result/i);
      expect(narrative).toMatch(/append-only|tamper-evident|signed/i);
      expect(narrative).toMatch(/forensic|replayable|incident/i);
    }
  });

  it("gates durable memory against poisoning and cross-session leakage", () => {
    const memoryEnabledWorkspaces = demoWorkspaces.filter((ws) => ws.memory);

    expect(memoryEnabledWorkspaces.length).toBeGreaterThan(0);
    for (const ws of memoryEnabledWorkspaces) {
      const memoryControl = ws.safetyControls.find((control) =>
        control.auditSignals.includes("memory-write")
      );
      const narrative = memoryControl
        ? [memoryControl.title, memoryControl.description, memoryControl.evidence].join(" ")
        : "";

      expect(memoryControl).toBeDefined();
      expect(narrative).toMatch(/validate|sanitize/i);
      expect(narrative).toMatch(/isolate|workspace|session/i);
      expect(narrative).toMatch(/secret|sensitive/i);
      expect(narrative).toMatch(/expire|retention/i);
      expect(narrative).toMatch(/owner|approve|review/i);
    }
  });

  it("documents explicit network egress review gates for every workspace", () => {
    for (const ws of demoWorkspaces) {
      expect(ws.networkEgressPolicy.allowedDestinations.length).toBeGreaterThan(0);
      expect(ws.networkEgressPolicy.reviewTriggers.length).toBeGreaterThan(0);
      expect(ws.networkEgressPolicy.evidence).toMatch(/egress|outbound|connect|destination|export/i);

      for (const destination of ws.networkEgressPolicy.allowedDestinations) {
        expect(destination).toBeTruthy();
        expect(destination).not.toMatch(/\*|0\.0\.0\.0\/0|anywhere/i);
      }

      for (const trigger of ws.networkEgressPolicy.reviewTriggers) {
        expect(trigger).toMatch(/new|external|export|outside|cloud|public|vendor/i);
      }
    }
  });

  it("requires named approval ownership before sensitive egress changes", () => {
    for (const ws of demoWorkspaces) {
      expect(ws.networkEgressPolicy.approvalOwner).toMatch(/\S/);
      expect(ws.networkEgressPolicy.approvalRequiredFor.length).toBeGreaterThan(0);
      expect(ws.networkEgressPolicy.reviewSlaHours).toBeGreaterThan(0);
      expect(ws.networkEgressPolicy.reviewSlaHours).toBeLessThanOrEqual(24);

      const approvalNarrative = [
        ws.networkEgressPolicy.approvalOwner,
        ...ws.networkEgressPolicy.approvalRequiredFor,
      ].join(" ");

      expect(approvalNarrative).toMatch(/lead|owner|steward/i);
      expect(approvalNarrative).toMatch(/new|external|export|cloud|vendor|database|webhook/i);
    }
  });

  it("prevents delegated agents from inheriting unscoped workspace privileges", () => {
    for (const ws of demoWorkspaces) {
      const delegationControl = ws.safetyControls.find((control) =>
        control.auditSignals.includes("delegation-boundary")
      );
      const narrative = delegationControl
        ? [
            delegationControl.title,
            delegationControl.description,
            delegationControl.evidence,
          ].join(" ")
        : "";

      expect(delegationControl).toBeDefined();
      expect(narrative).toMatch(/delegate|sub-agent/i);
      expect(narrative).toMatch(/least privilege|minimum|no broader|inherit/i);
      expect(narrative).toMatch(/parent|delegation chain|lineage/i);
    }
  });

  it("reviews skills and extensions before they can persist or widen authority", () => {
    for (const ws of demoWorkspaces) {
      const extensionControl = ws.safetyControls.find((control) =>
        control.auditSignals.includes("extension-install-review")
      );
      const narrative = extensionControl
        ? [
            extensionControl.title,
            extensionControl.description,
            extensionControl.evidence,
          ].join(" ")
        : "";

      expect(extensionControl).toBeDefined();
      expect(narrative).toMatch(/skill|plugin|hook|MCP/i);
      expect(narrative).toMatch(/human-owned|named reviewer|review/i);
      expect(narrative).toMatch(/publisher|pinned version/i);
      expect(narrative).toMatch(/tool|network|destination|authority/i);
      expect(narrative).toMatch(/persistent|supply-chain/i);
    }
  });

  it("blocks MCP tool schema drift until named re-review", () => {
    for (const ws of demoWorkspaces) {
      const schemaControl = ws.safetyControls.find((control) =>
        control.auditSignals.includes("tool-schema-integrity")
      );
      const narrative = schemaControl
        ? [
            schemaControl.title,
            schemaControl.description,
            schemaControl.evidence,
          ].join(" ")
        : "";

      expect(schemaControl).toBeDefined();
      expect(narrative).toMatch(/\bMCP\b/i);
      expect(narrative).toMatch(/server identity/i);
      expect(narrative).toMatch(/tool name/i);
      expect(narrative).toMatch(/description/i);
      expect(narrative).toMatch(/input schema/i);
      expect(narrative).toMatch(/annotation/i);
      expect(narrative).toMatch(/snapshot/i);
      expect(narrative).toMatch(/hash/i);
      expect(narrative).toMatch(/\bblock(?:s|ed|ing)?\b/i);
      expect(narrative).toMatch(/\bdrift(?:s|ed|ing)?\b/i);
      expect(narrative).toMatch(/named re-review/i);
      expect(narrative).toMatch(/tool poisoning/i);
      expect(narrative).toMatch(/schema poisoning/i);
      expect(narrative).toMatch(/tool shadowing/i);
      expect(narrative).toMatch(/rug[- ]?pull/i);
    }
  });

  it("quarantines poisoned MCP output before it can trigger downstream action", () => {
    for (const ws of demoWorkspaces) {
      const outputControl = ws.safetyControls.find((control) =>
        control.auditSignals.includes("tool-output-validation")
      );
      const narrative = outputControl
        ? [
            outputControl.title,
            outputControl.description,
            outputControl.evidence,
          ].join(" ")
        : "";

      expect(outputControl).toBeDefined();
      expect(narrative).toMatch(/\bMCP\b/i);
      expect(narrative).toMatch(/strict output schema/i);
      expect(narrative).toMatch(/reject unexpected fields/i);
      expect(narrative).toMatch(/quarantine/i);
      expect(narrative).toMatch(/free-form instructions/i);
      expect(narrative).toMatch(/downstream tool|external action/i);
      expect(narrative).toMatch(/runtime tool-output poisoning/i);
    }
  });

  it("keeps MCP servers bound, authenticated, and away from metadata SSRF paths", () => {
    for (const ws of demoWorkspaces) {
      const exposureControl = ws.safetyControls.find((control) =>
        control.auditSignals.includes("mcp-server-exposure")
      );
      const narrative = exposureControl
        ? [
            exposureControl.title,
            exposureControl.description,
            exposureControl.evidence,
          ].join(" ")
        : "";

      expect(exposureControl).toBeDefined();
      expect(narrative).toMatch(/\bMCP\b/i);
      expect(narrative).toMatch(/localhost|private interface/i);
      expect(narrative).toMatch(/authentication/i);
      expect(narrative).toMatch(/0\.0\.0\.0|public/i);
      expect(narrative).toMatch(/metadata|SSRF|169\.254/i);
    }
  });

});

describe("Workspace Tool Allowlists", () => {
  it("all allowlist entries are non-empty and have no whitespace", () => {
    for (const ws of demoWorkspaces) {
      if (!ws.toolAllowlist) continue;
      for (const tool of ws.toolAllowlist) {
        expect(tool).toBeTruthy();
        expect(tool).not.toMatch(/\s/);
      }
    }
  });

  it("workspaces with an allowlist scope down to at least two tools", () => {
    for (const ws of demoWorkspaces) {
      if (ws.toolAllowlist) {
        expect(ws.toolAllowlist.length).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("allowlist entries reference tools the workspace skills depend on", () => {
    const skillTools = new Map(
      demoSKills.map((s) => [
        s.name,
        new Set(s.tools),
      ] as [string, Set<string>])
    );

    for (const ws of demoWorkspaces) {
      if (!ws.toolAllowlist) continue;
      const allowed = new Set(ws.toolAllowlist);
      for (const skillName of ws.skills) {
        const required = skillTools.get(skillName);
        if (!required) continue;
        for (const tool of required) {
          expect(allowed.has(tool)).toBe(true);
        }
      }
    }
  });

  it("allowlists stay minimal: no tool is allowed unless a selected skill requires it", () => {
    const skillTools = new Map(
      demoSKills.map((s) => [
        s.name,
        new Set(s.tools),
      ] as [string, Set<string>])
    );

    for (const ws of demoWorkspaces) {
      if (!ws.toolAllowlist) continue;
      const requiredBySelectedSkills = new Set<string>();
      for (const skillName of ws.skills) {
        const required = skillTools.get(skillName);
        if (!required) continue;
        for (const tool of required) requiredBySelectedSkills.add(tool);
      }

      for (const tool of ws.toolAllowlist) {
        expect(requiredBySelectedSkills.has(tool)).toBe(true);
      }
    }
  });

  it("no workspace allowlists tools it can never invoke (sanity check)", () => {
    const allKnownTools = new Set(demoSKills.flatMap((s) => s.tools));
    allKnownTools.add("terminal");
    for (const ws of demoWorkspaces) {
      if (!ws.toolAllowlist) continue;
      for (const tool of ws.toolAllowlist) {
        expect(allKnownTools.has(tool)).toBe(true);
      }
    }
  });
});

describe("Agent Profiles", () => {
  it("all profiles have valid temperature range", () => {
    for (const p of demoProfiles) {
      expect(p.temperature).toBeGreaterThanOrEqual(0);
      expect(p.temperature).toBeLessThanOrEqual(2);
    }
  });

  it("all profiles have reasonable maxTokens", () => {
    for (const p of demoProfiles) {
      expect(p.maxTokens).toBeGreaterThan(0);
      expect(p.maxTokens).toBeLessThanOrEqual(32768);
    }
  });

  it("profile models match known provider models", () => {
    const allModels = new Set(demoProviders.flatMap((p) => p.models));
    for (const p of demoProfiles) {
      expect(allModels.has(p.model)).toBe(true);
    }
  });
});

describe("MCP Server Configs", () => {
  it("all MCP servers have required fields", () => {
    for (const mcp of demoMCPServers) {
      expect(mcp.name).toBeTruthy();
      expect(["stdio", "sse", "http"]).toContain(mcp.type);
      expect(mcp.command).toBeTruthy();
      expect(mcp.timeoutSeconds).toBeGreaterThan(0);
      expect(mcp.tools.length).toBeGreaterThan(0);
      expect(["localhost", "authenticated-private", "public"]).toContain(
        mcp.securityBoundary
      );
      expect(mcp.errorRecovery).toBeDefined();
      expect(mcp.errorRecovery.maxRetries).toBeGreaterThanOrEqual(0);
      expect(mcp.errorRecovery.retryDelayMs).toBeGreaterThanOrEqual(0);
      expect(typeof mcp.errorRecovery.requiresManualRestart).toBe("boolean");
    }
  });

  it("MCP timeout values are reasonable (5s-60s range)", () => {
    for (const mcp of demoMCPServers) {
      expect(mcp.timeoutSeconds).toBeGreaterThanOrEqual(5);
      expect(mcp.timeoutSeconds).toBeLessThanOrEqual(60);
    }
  });

  it("stdio-type servers include retry configuration for transient failures", () => {
    const stdioServers = demoMCPServers.filter((mcp) => mcp.type === "stdio");
    for (const mcp of stdioServers) {
      expect(mcp.errorRecovery.maxRetries).toBeGreaterThan(0);
      expect(mcp.errorRecovery.retryDelayMs).toBeGreaterThan(0);
    }
  });

  it("public-boundary or authenticated-private servers document runtime requirements", () => {
    const restrictedServers = demoMCPServers.filter(
      (mcp) =>
        mcp.securityBoundary === "public" ||
        mcp.securityBoundary === "authenticated-private"
    );
    for (const mcp of restrictedServers) {
      expect(mcp.runtimeRequirements).toBeDefined();
      expect(mcp.runtimeRequirements!.length).toBeGreaterThan(0);
    }
  });

  it("authenticated-private servers document environment variables or auth tokens", () => {
    const authServers = demoMCPServers.filter(
      (mcp) => mcp.securityBoundary === "authenticated-private"
    );
    for (const mcp of authServers) {
      const narrative = [
        mcp.name,
        mcp.command,
        ...(mcp.runtimeRequirements || []),
      ].join(" ");
      expect(narrative).toMatch(/token|auth|credential|env|secret/i);
    }
  });

  it("all MCP server tools are non-empty strings", () => {
    for (const mcp of demoMCPServers) {
      for (const tool of mcp.tools) {
        expect(tool).toBeTruthy();
        expect(typeof tool).toBe("string");
      }
    }
  });

  it("servers with requiresManualRestart=true have justification in name/command", () => {
    const manualRestartServers = demoMCPServers.filter(
      (mcp) => mcp.errorRecovery.requiresManualRestart
    );
    for (const mcp of manualRestartServers) {
      const narrative = [mcp.name, mcp.command, mcp.runtimeRequirements || []].join(
        " "
      );
      expect(narrative).toMatch(
        /slack|webhook|integration|external|stateful|long.?lived/i
      );
    }
  });

  it("HTTP-type servers bind only to localhost or authenticated interfaces", () => {
    const httpServers = demoMCPServers.filter((mcp) => mcp.type === "http");
    for (const mcp of httpServers) {
      if (mcp.environment && mcp.environment.MCP_BROWSER_HOST) {
        expect(mcp.environment.MCP_BROWSER_HOST).toBe("localhost");
      }
      if (
        mcp.environment &&
        (mcp.environment.MCP_SLACK_PORT || mcp.environment.MCP_BROWSER_PORT)
      ) {
        expect(mcp.securityBoundary).not.toBe("public");
      }
    }
  });
});

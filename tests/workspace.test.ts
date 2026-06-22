import { describe, it, expect } from "vitest";
import {
  demoProviders,
  demoSKills,
  demoWorkspaces,
  demoProfiles,
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
      "team-project-attribution",
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

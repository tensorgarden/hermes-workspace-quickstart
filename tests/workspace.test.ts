import { describe, it, expect } from "vitest";
import {
  demoProviders,
  demoSKills,
  demoWorkspaces,
  demoProfiles,
} from "../src/lib/demo-data";

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

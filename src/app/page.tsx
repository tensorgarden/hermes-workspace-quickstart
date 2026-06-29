import { demoProviders, demoSKills, demoWorkspaces, demoProfiles } from "@/lib/demo-data";

function Card({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="rounded-2xl border border-slate-200/60 bg-white/70 backdrop-blur p-6 sm:p-8 shadow-sm"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-ink mb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function CodeBlock({
  language,
  children,
}: {
  language?: string;
  children: string;
}) {
  return (
    <pre className="rounded-xl border border-slate-200 bg-slate-950 text-slate-50 p-5 overflow-x-auto text-sm leading-relaxed font-mono">
      {language && (
        <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
          {language}
        </div>
      )}
      <code>{children}</code>
    </pre>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-20">
      {/* --- Hero --- */}
      <header className="mb-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
          <svg
            className="h-8 w-8 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
            />
          </svg>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-ink">
          Hermes Workspace Quickstart
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Set up a private AI workspace that runs entirely on your hardware.
          Configure local LLMs, define autonomous skills, schedule cron-driven
          workflows, and keep your data under your control.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Private
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20">
            Local LLMs
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700 ring-1 ring-inset ring-violet-600/20">
            Autonomous
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
            Open Source
          </span>
        </div>
      </header>

      {/* --- Problem --- */}
      <Card id="why" title="Why Run AI Privately?">
        <p className="text-slate-600 leading-relaxed">
          Teams and founders want AI agents that can write code, review PRs,
          summarize meetings, and run data pipelines. But sending proprietary
          code and internal data to cloud APIs is a non-starter for many
          organizations. This quickstart shows you how to run capable AI agents
          entirely on your own infrastructure using open-source models,
          retaining full control over your data.
        </p>
        <ul className="mt-4 space-y-2 text-slate-600">
          <li className="flex items-start gap-2">
            <span className="mt-1 text-emerald-500 font-bold">&#10003;</span>
            No data leaves your network
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-emerald-500 font-bold">&#10003;</span>
            No per-token billing surprises
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-emerald-500 font-bold">&#10003;</span>
            Works with consumer GPUs (Apple Silicon, RTX 3060+)
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 text-emerald-500 font-bold">&#10003;</span>
            Fully offline capable
          </li>
        </ul>
      </Card>

      <div className="mt-8 space-y-8">
        {/* --- Setup Steps --- */}
        <Card id="setup" title="1. Install the Agent OS">
          <p className="text-slate-600 leading-relaxed mb-4">
            Hermes Agent is a single binary that manages workspaces, skills,
            and provider connections. Install it with one command.
          </p>
          <CodeBlock language="shell">{`# macOS / Linux
curl -fsSL https://get.hermes-agent.com | sh

# Verify installation
hermes version
# > Hermes Agent v2.1.0 (linux/amd64)

# Initialize your config directory
hermes init`}</CodeBlock>
        </Card>

        {/* --- Provider Setup --- */}
        <Card id="providers" title="2. Configure a Provider">
          <p className="text-slate-600 leading-relaxed mb-4">
            Providers connect your agent to an LLM. For private AI, use a local
            provider like Ollama or LM Studio. Both run models entirely on your
            machine.
          </p>

          <h3 className="text-lg font-semibold text-ink mt-6 mb-3">
            Supported Providers
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-4 font-semibold text-ink">Name</th>
                  <th className="py-2 pr-4 font-semibold text-ink">Type</th>
                  <th className="py-2 pr-4 font-semibold text-ink">Models</th>
                  <th className="py-2 pr-4 font-semibold text-ink">API Key</th>
                  <th className="py-2 font-semibold text-ink">Secret Handling</th>
                </tr>
              </thead>
              <tbody>
                {demoProviders.map((p) => (
                  <tr key={p.name} className="border-b border-slate-100">
                    <td className="py-2 pr-4 font-medium text-ink">
                      {p.name}
                    </td>
                    <td className="py-2 pr-4 text-slate-600">
                      <span
                        className={
                          p.type === "local"
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }
                      >
                        {p.type}
                      </span>
                    </td>
                    <td className="py-2 pr-4 text-slate-600">
                      {p.models.join(", ")}
                    </td>
                    <td className="py-2 pr-4 text-slate-600">
                      {p.requiresApiKey ? "Yes" : "No"}
                    </td>
                    <td className="py-2 text-slate-600">
                      {p.secretHandling.replace("-", " ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-ink mt-6 mb-3">
            Example: Ollama Setup
          </h3>
          <CodeBlock language="shell">{`# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull a capable model
ollama pull llama3.2    # 3B, fast, great for most tasks
ollama pull codellama    # code-specific tasks

# Configure Hermes to use it
hermes provider add ollama \\
  --endpoint http://localhost:11434 \\
  --default-model llama3.2`}</CodeBlock>

          <h3 className="text-lg font-semibold text-ink mt-6 mb-3">
            Provider Configuration (YAML)
          </h3>
          <CodeBlock language="yaml">{`# ~/.hermes/providers.yaml
providers:
  ollama:
    type: local
    endpoint: http://localhost:11434
    default_model: llama3.2
    models:
      - llama3.2        # general purpose (3B)
      - codellama       # code generation
      - mistral         # reasoning
      - deepseek-r1:8b  # chain-of-thought

  lmstudio:
    type: local
    endpoint: http://localhost:1234/v1
    default_model: llama-3.2-3b-instruct

  openai:
    type: cloud
    endpoint: https://api.openai.com/v1
    api_key: \${OPENAI_API_KEY}
    models:
      - gpt-4o
      - gpt-4o-mini`}</CodeBlock>

          <h3 className="text-lg font-semibold text-ink mt-6 mb-3">
            Secret Safety Guardrails
          </h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            Current AI-agent deployments increasingly trip over leaked API keys:
            environment dumps, crash reports, and verbose tool logs can expose
            secrets. For cloud providers, keep keys outside the repository and
            inject them only when the agent process starts.
          </p>
          <div className="space-y-3">
            {demoProviders.map((p) => (
              <div key={p.name} className="rounded-lg border border-slate-200 p-3">
                <div className="text-sm font-semibold text-ink">{p.name}</div>
                <ul className="mt-2 space-y-1 text-sm text-slate-600">
                  {p.securityNotes.map((note) => (
                    <li key={note} className="flex gap-2">
                      <span className="text-emerald-500">&#10003;</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* --- Workspace Management --- */}
        <Card id="workspaces" title="3. Create Workspaces">
          <p className="text-slate-600 leading-relaxed mb-4">
            A workspace bundles a provider, model, skills, and schedule into a
            named configuration. Each workspace is an independent agent
            instance.
          </p>

          <h3 className="text-lg font-semibold text-ink mt-6 mb-3">
            Example Workspaces
          </h3>
          <div className="space-y-4">
            {demoWorkspaces.map((ws) => (
              <div
                key={ws.name}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-ink">{ws.name}</h4>
                  <span className="text-xs font-mono text-slate-500">
                    {ws.provider} / {ws.model}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  {ws.description}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {ws.skills.map((s) => (
                    <span
                      key={s}
                      className="inline-flex rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent"
                    >
                      {s}
                    </span>
                  ))}
                  {ws.memory && (
                    <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                      memory
                    </span>
                  )}
                </div>
                {ws.cron.length > 0 && (
                  <div className="mt-2 text-xs text-slate-500 font-mono">
                    {ws.cron.map((c, i) => (
                      <div key={i}>cron: {c}</div>
                    ))}
                  </div>
                )}
                <div className="mt-4 rounded-lg border border-emerald-100 bg-white/70 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    Safety controls
                  </div>
                  <ul className="mt-2 space-y-2 text-xs text-slate-600">
                    {ws.safetyControls.map((control) => (
                      <li key={control.title}>
                        <span className="font-semibold text-ink">
                          {control.title}:
                        </span>{" "}
                        {control.description}
                        <div className="mt-1 text-slate-500">
                          {control.evidence}
                        </div>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {control.auditSignals.map((signal) => (
                            <span
                              key={signal}
                              className="rounded bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-emerald-100"
                            >
                              {signal.split("-").join(" ")}
                            </span>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-3 rounded-lg border border-sky-100 bg-sky-50/70 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wide text-sky-700">
                    Network egress allowlist
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ws.networkEgressPolicy.allowedDestinations.map((destination) => (
                      <span
                        key={destination}
                        className="rounded bg-white px-1.5 py-0.5 text-[11px] font-medium text-sky-700 ring-1 ring-sky-100"
                      >
                        {destination}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    <span className="font-semibold text-ink">Review before:</span>{" "}
                    {ws.networkEgressPolicy.reviewTriggers.join(", ")}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {ws.networkEgressPolicy.evidence}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-ink mt-6 mb-3">
            Workspace Configuration (YAML)
          </h3>
          <CodeBlock language="yaml">{`# ~/.hermes/workspaces/engineering.yaml
name: Engineering Assistant
provider: ollama
model: codellama
skills:
  - code-review
  - docs-generator
memory: true
cron:
  - "*/30 * * * * review open PRs"
plugins:
  - git
  - github`}</CodeBlock>
        </Card>

        {/* --- Skills --- */}
        <Card id="skills" title="4. Define Skills">
          <p className="text-slate-600 leading-relaxed mb-4">
            Skills are the building blocks of agent autonomy. Each skill
            declares which tools it needs and which natural-language triggers
            activate it. You can write custom skills or install community ones.
          </p>

          <h3 className="text-lg font-semibold text-ink mt-6 mb-3">
            Available Skills
          </h3>
          <div className="space-y-4">
            {demoSKills.map((skill) => (
              <div
                key={skill.name}
                className="rounded-xl border border-slate-200 p-4"
              >
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-ink font-mono text-sm">
                    {skill.name}
                  </h4>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {skill.category}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">
                  {skill.description}
                </p>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="text-xs font-semibold text-slate-500 mr-1">
                    Tools:
                  </span>
                  {skill.tools.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-slate-200/70 px-1.5 py-0.5 text-xs font-mono text-slate-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs font-semibold text-slate-500 mr-1">
                    Triggers:
                  </span>
                  {skill.triggers.map((t) => (
                    <span
                      key={t}
                      className="rounded bg-accent/5 px-1.5 py-0.5 text-xs text-accent italic"
                    >
                      &ldquo;{t}&rdquo;
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold text-ink mt-6 mb-3">
            Skill Definition (YAML)
          </h3>
          <CodeBlock language="yaml">{`# ~/.hermes/skills/code-review.yaml
name: code-review
description: >
  Automated PR review checking for bugs,
  style issues, and security vulnerabilities.
category: development
tools:
  - read_file
  - search_files
  - terminal
  - patch
triggers:
  - "review this PR"
  - "check my code"
  - "audit this file"

# Install community skills
hermes skill install code-review
hermes skill install daily-standup

# Create your own
hermes skill create my-skill --template typescript`}</CodeBlock>
        </Card>

        {/* --- Agent Profiles --- */}
        <Card id="profiles" title="5. Configure Agent Profiles">
          <p className="text-slate-600 leading-relaxed mb-4">
            Profiles tailor the agent&apos;s behavior for specific roles. Each
            profile has a system prompt, model, temperature, and token limit.
          </p>

          <div className="space-y-4">
            {demoProfiles.map((profile) => (
              <div
                key={profile.name}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <h4 className="font-semibold text-ink mb-1">
                  {profile.name}
                </h4>
                <p className="text-sm text-slate-600 mb-2">
                  {profile.description}
                </p>
                <div className="text-xs text-slate-500 space-y-1">
                  <div>
                    Model:{" "}
                    <span className="font-mono">{profile.model}</span>
                  </div>
                  <div>
                    Temperature: {profile.temperature} | Max Tokens:{" "}
                    {profile.maxTokens}
                  </div>
                  <div className="mt-1 text-slate-400 italic max-h-16 overflow-hidden">
                    {profile.systemPrompt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* --- Verification Checklist --- */}
        <Card id="verify" title="6. Verification Checklist">
          <p className="text-slate-600 leading-relaxed mb-4">
            Run through these checks to confirm your workspace is operational.
          </p>
          <div className="space-y-3">
            {[
              {
                check: "Provider is reachable",
                cmd: "hermes provider test ollama",
              },
              {
                check: "Model responds to prompts",
                cmd: "hermes chat --model llama3.2 'Hello, are you running locally?'",
              },
              {
                check: "Workspace is valid",
                cmd: "hermes workspace validate engineering",
              },
              {
                check: "Skills are loaded",
                cmd: "hermes skill list",
              },
              {
                check: "Cron schedule is active",
                cmd: "hermes cron status",
              },
              {
                check: "End-to-end workflow runs",
                cmd: "hermes workspace run engineering --task 'Review the latest commit'",
              },
            ].map((item) => (
              <div
                key={item.check}
                className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
              >
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded border border-slate-300 text-xs text-slate-400">
                  &#x25A1;
                </span>
                <div>
                  <div className="text-sm font-medium text-ink">
                    {item.check}
                  </div>
                  <code className="text-xs text-slate-500 font-mono">
                    {item.cmd}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* --- Quick Start Summary --- */}
        <Card id="summary" title="Quick Start (TL;DR)">
          <CodeBlock language="shell">{`# 1. Install Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2

# 2. Install Hermes Agent
curl -fsSL https://get.hermes-agent.com | sh

# 3. Initialize
hermes init
hermes provider add ollama --endpoint http://localhost:11434

# 4. Create your first workspace
hermes workspace create engineering \\
  --provider ollama \\
  --model llama3.2 \\
  --skill code-review

# 5. Start using it
hermes workspace run engineering --task "Review the latest commit"

# 6. Schedule autonomous runs
hermes cron add engineering "0 9 * * 1-5" --task "daily standup"`}</CodeBlock>
        </Card>
      </div>

      {/* --- Footer --- */}
      <footer className="mt-16 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
        <p>
          Hermes Workspace Quickstart &mdash; Run AI on your terms, on your
          hardware.
        </p>
        <p className="mt-1">
          Built with{" "}
          <a
            href="https://nextjs.org"
            className="text-accent hover:underline"
          >
            Next.js
          </a>
          ,{" "}
          <a
            href="https://tailwindcss.com"
            className="text-accent hover:underline"
          >
            Tailwind CSS
          </a>
          , and open-source LLMs.
        </p>
      </footer>
    </div>
  );
}

# OhMyOpenCode Agent & Category Configuration Report

## Subagent Configurations

The following table summarizes the default configurations for the builtin subagents. Note that "Default" temperature typically means the provider's default (often 1.0 or 0.7 depending on the model).

| Agent | Role | Default Model | Variant | Temperature | Thinking / Reasoning | Permissions |
|-------|------|---------------|---------|-------------|----------------------|-------------|
| **Sisyphus** | Primary Orchestrator | `claude-opus-4-5` | `max` | Default | Thinking: 32k (Non-GPT) <br> Reasoning: Medium (GPT) | `delegate_task`, `question`, `task_*`, `teammate` (No `call_omo_agent`) |
| **Hephaestus** | Autonomous Deep Worker | `gpt-5.2-codex` | `medium` | Default | Reasoning: Medium <br> MaxTokens: 32k | `delegate_task`, `question` (No `call_omo_agent`) |
| **Prometheus** | Planner | `claude-opus-4-5` | `max` | Default | Thinking: 32k (Non-GPT) | `edit`, `bash`, `webfetch`, `question`, `delegate_task` |
| **Atlas** | Master Orchestrator | `kimi-k2.5-free` (or `claude-sonnet-4-5`) | - | 0.1 | - | `delegate_task`, `task_*`, `teammate` (No `task`, `call_omo_agent`) |
| **Oracle** | Expert Advisor | `gpt-5.2` | `high` | 0.1 | Reasoning: Medium (GPT) <br> Thinking: 32k (Non-GPT) | Read-only tools |
| **Librarian** | Researcher (Docs/Code) | `glm-4.7` (or `claude-sonnet-4-5`) | - | 0.1 | - | Read-only + `grep_app_*` |
| **Explore** | Codebase Navigator | `grok-code-fast-1` (or `claude-haiku-4-5`) | - | 0.1 | - | Read-only |
| **Multimodal Looker** | Vision/File Analyst | `gemini-3-flash` | - | 0.1 | - | Read-only + `read` (No `task`, `look_at`) |
| **Metis** | Pre-planning Consultant | `claude-opus-4-5` | `max` | 0.3 | Thinking: 32k | Read-only |
| **Momus** | Plan Reviewer | `gpt-5.2` | `medium` | 0.1 | Reasoning: Medium (GPT) <br> Thinking: 32k (Non-GPT) | Read-only |

### Notes on Fallback Models
Most agents have a "Fallback Chain". If the primary model is unavailable, they try the next one.
- **Sisyphus/Prometheus/Metis**: Fall back to `k2p5`, `kimi-k2.5-free`, `glm-4.7`.
- **Hephaestus**: Strictly requires `gpt-5.2-codex` (no fallback listed in requirements, though code might handle it).
- **Oracle**: Falls back to `gemini-3-pro` (`high`), then `claude-opus-4-5` (`max`).
- **Atlas**: Falls back to `claude-sonnet-4-5`, `gpt-5.2`, `gemini-3-pro`.

---

## Category Configurations

Categories determine the model and settings used when `Sisyphus` delegates tasks via `delegate_task(category="...")`.

| Category | Description | Model | Variant | Settings |
|----------|-------------|-------|---------|----------|
| **visual-engineering** | Frontend, UI/UX, Design | `gemini-3-pro` | - | - |
| **ultrabrain** | Complex Architecture, Deep Logic | `gpt-5.2-codex` | `xhigh` | - |
| **deep** | Autonomous Problem Solving | `gpt-5.2-codex` | `medium` | - |
| **artistry** | Creative/Artistic Tasks | `gemini-3-pro` | `high` | - |
| **quick** | Trivial/Small Tasks | `claude-haiku-4-5` | - | - |
| **unspecified-low** | Moderate Effort | `claude-sonnet-4-5` | - | - |
| **unspecified-high** | High Effort | `claude-opus-4-5` | `max` | - |
| **writing** | Documentation/Prose | `gemini-3-flash` | - | - |

---

## Suggested Workflow

To maximize efficiency and quality, follow this orchestrated workflow:

### 1. Inception & Planning
- **Start with Sisyphus** (your default agent).
- **Ambiguous Request?** Sisyphus should consult **Metis** (`delegate_task(subagent_type="metis")`) to clarify scope and hidden requirements.
- **Complex Project?** Sisyphus should ask **Prometheus** (`delegate_task(subagent_type="prometheus")`) to draft a detailed work plan.
- **Architectural Doubts?** Sisyphus or Prometheus should consult **Oracle** (`delegate_task(subagent_type="oracle")`) for high-level design advice.

### 2. Review
- **Plan Review**: Before executing a Prometheus plan, have **Momus** (`delegate_task(subagent_type="momus")`) critique it for blockers, gaps, and assumptions.

### 3. Execution (The Sisyphus Loop)
Sisyphus manages the execution, delegating specific tasks based on their nature:

- **Frontend / UI**: Delegate to `visual-engineering` category.
- **Hard Logic / Algorithms**: Delegate to `ultrabrain` category.
- **Deep/Autonomous Modules**: Delegate to **Hephaestus** (`delegate_task(subagent_type="hephaestus")`). Hephaestus is best for tasks needing extensive self-directed exploration and implementation without constant hand-holding.
- **Quick Fixes**: Delegate to `quick` category.
- **Documentation**: Delegate to `writing` category.

### 4. Context Gathering (Parallel)
- While working, Sisyphus/Hephaestus should fire background agents:
    - **Code Search**: **Explore** (`delegate_task(subagent_type="explore", run_in_background=true)`) to find files/patterns.
    - **External Docs**: **Librarian** (`delegate_task(subagent_type="librarian", run_in_background=true)`) to fetch documentation or open-source examples.

### 5. Large Scale Orchestration
- If you have a massive Todo list (e.g., from a plan file), invoke **Atlas** (`delegate_task(subagent_type="atlas")`). Atlas acts as a "Task Runner" that systematically works through the list, verifying each step.

### Summary of Agent "Superpowers"
- **Sisyphus**: The Manager. Good at everything, master of delegation.
- **Hephaestus**: The Senior Engineer. Deep focus, autonomy, high reasoning.
- **Oracle**: The Architect. Pure thought, no action.
- **Prometheus**: The Project Manager. Plans and organizes.
- **Metis**: The Business Analyst. Clarifies intent.
- **Momus**: The QA Lead. Finds flaws in plans.
- **Librarian/Explore**: The Research Assistants. Fetch info fast.

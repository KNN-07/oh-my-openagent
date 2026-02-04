# OhMyOpenCode Configuration Report

This report details the configurations for Subagents and Categories found in the codebase.

## Categories

Categories are used to delegate tasks to specialized models with specific prompt contexts.
These settings are defined in `src/tools/delegate-task/constants.ts`.

| Category | Description | Default Model | Variant | Temperature | Thinking |
|----------|-------------|---------------|---------|-------------|----------|
| `visual-engineering` | Frontend, UI/UX, design, styling, animation | `google/gemini-3-pro` | - | - | - |
| `ultrabrain` | Deep logical reasoning, complex architecture. Use ONLY for genuinely hard, logic-heavy tasks. | `openai/gpt-5.2-codex` | `xhigh` | - | - |
| `deep` | Goal-oriented autonomous problem-solving. Thorough research before action. | `openai/gpt-5.2-codex` | `medium` | - | - |
| `artistry` | Highly creative/artistic tasks, novel ideas. | `google/gemini-3-pro` | `high` | - | - |
| `quick` | Trivial tasks - single file, typo fixes, simple modifications. | `anthropic/claude-haiku-4-5` | - | - | - |
| `unspecified-low` | Moderate effort, doesn't fit other categories. | `anthropic/claude-sonnet-4-5` | - | - | - |
| `unspecified-high` | High effort, doesn't fit other categories. | `anthropic/claude-opus-4-5` | `max` | - | - |
| `writing` | Documentation, prose, technical writing. | `google/gemini-3-flash` | - | - | - |

> **Note:** "Thinking" and "Temperature" are not explicitly defined in `DEFAULT_CATEGORIES`, so they typically inherit system defaults (usually `temperature: 0`).

## Subagents (Builtin Agents)

Subagents are specialized agents that can be invoked to perform specific roles.

### Primary Agents

| Agent | Role | Default Model | Temperature | Thinking / Reasoning |
|-------|------|---------------|-------------|----------------------|
| **Sisyphus** | Primary / Utility | *User Selected* | - | `enabled` (32k) OR `medium` (GPT) |
| **Hephaestus**| Primary | *User Selected* | - | `medium` (Reasoning Effort) |
| **Atlas** | Primary / Advisor | *User Selected* | `0.1` | - |

### Specialist / Subagents

| Agent | Role | Cost | Temperature | Thinking / Reasoning |
|-------|------|------|-------------|----------------------|
| **Oracle** | Advisor | EXPENSIVE | `0.1` | `enabled` (32k) OR `medium` (GPT) |
| **Librarian** | Exploration | CHEAP | `0.1` | - |
| **Explore** | Exploration | FREE | `0.1` | - |
| **Multimodal-Looker**| Utility | CHEAP | `0.1` | - |
| **Metis** | Advisor | EXPENSIVE | `0.3` | `enabled` (32k) |
| **Momus** | Advisor | EXPENSIVE | `0.1` | `enabled` (32k) OR `medium` (GPT) |

## Suggested Workflows

### Sisyphus Orchestration Workflow
*Best for: General software engineering tasks, feature implementation, refactoring.*

1.  **Phase 0: Intent Gate**
    *   Classify request (Trivial, Explicit, Exploratory, Open-ended, Ambiguous).
    *   **Ambiguity Check**: Ask *one* clarifying question if interpretations differ significantly.
    *   **Delegation Check**: Can a specialist (Hephaestus, Oracle) or Category handle this better?

2.  **Phase 1: Codebase Assessment** (For open-ended tasks)
    *   Determine if codebase is **Disciplined** (follow strict patterns) or **Chaotic** (propose patterns).

3.  **Phase 2A: Exploration & Research**
    *   **Parallel Execution**: Fire `explore` (internal code) and `librarian` (external docs) agents in parallel background tasks.
    *   **Stop Condition**: Stop when context is confident; do not over-explore.

4.  **Phase 2B: Implementation**
    *   **Task Management**: Create granular tasks/todos for any multi-step work.
    *   **Delegation**: Use `delegate_task` with specific Categories and Skills.
        *   *Mandatory*: `session_id` must be preserved for continuity.
    *   **Verification**: Run `lsp_diagnostics` on changed files, run tests, and build.

5.  **Phase 2C: Failure Recovery**
    *   If fixes fail 3 times: **Stop**, **Revert**, **Document**, and **Consult Oracle**.

6.  **Phase 3: Completion**
    *   Ensure all todos are done, diagnostics are clean, and user request is fully addressed.

### Hephaestus Deep Work Workflow
*Best for: Autonomous, complex, goal-oriented tasks where user provides a goal rather than steps.*

1.  **Step 1: EXPLORE**
    *   Fire 2-5 `explore`/`librarian` agents IN PARALLEL to gather comprehensive context.

2.  **Step 2: PLAN**
    *   Create a concrete work plan listing files to modify and dependencies.

3.  **Step 3: DECIDE**
    *   **Trivial** (<10 lines): Do it yourself.
    *   **Moderate** (<100 lines): Do it yourself or Delegate.
    *   **Complex** (>100 lines, multi-file): **MUST Delegate**.

4.  **Step 4: EXECUTE**
    *   Execute the plan surgically.

5.  **Step 5: VERIFY**
    *   Run `lsp_diagnostics`, build, and tests.
    *   If verification fails, return to Step 1 (max 3 iterations).

### Metis Pre-Planning Workflow
*Best for: Ambiguous, high-stakes, or "scratchpad" phases before committing to a plan.*

1.  **Intent Classification**: Identify if task is Refactoring, Build, Mid-sized, Collaborative, Architecture, or Research.
2.  **Intent-Specific Analysis**:
    *   *Refactoring*: Focus on safety and regression prevention.
    *   *Build*: Discover patterns first.
    *   *Architecture*: Consult Oracle.
3.  **Directives**: Generate specific `MUST` and `MUST NOT` directives for the planner/executor (Prometheus/Sisyphus).

# OhMyOpenCode Configuration Report

This report details the configurations for Subagents and Categories found in the codebase.

## Categories

Categories are used to delegate tasks to specialized models with specific prompt contexts.

| Category | Description | Default Model | Variant |
|----------|-------------|---------------|---------|
| `visual-engineering` | Frontend, UI/UX, design, styling, animation | `google/gemini-3-pro` | - |
| `ultrabrain` | Deep logical reasoning, complex architecture. Use ONLY for genuinely hard, logic-heavy tasks. | `openai/gpt-5.2-codex` | `xhigh` |
| `deep` | Goal-oriented autonomous problem-solving. Thorough research before action. | `openai/gpt-5.2-codex` | `medium` |
| `artistry` | Highly creative/artistic tasks, novel ideas. | `google/gemini-3-pro` | `high` |
| `quick` | Trivial tasks - single file, typo fixes, simple modifications. | `anthropic/claude-haiku-4-5` | - |
| `unspecified-low` | Moderate effort, doesn't fit other categories. | `anthropic/claude-sonnet-4-5` | - |
| `unspecified-high` | High effort, doesn't fit other categories. | `anthropic/claude-opus-4-5` | `max` |
| `writing` | Documentation, prose, technical writing. | `google/gemini-3-flash` | - |

## Subagents (Builtin Agents)

Subagents are specialized agents that can be invoked to perform specific roles.

### Primary Agents

| Agent | Description | Role |
|-------|-------------|------|
| **Sisyphus** | Powerful AI orchestrator. Plans obsessively with todos, assesses search complexity, delegates strategically. | Primary / Utility |
| **Hephaestus** | Autonomous Deep Worker. Goal-oriented execution. Explores thoroughly before acting. | Primary |
| **Atlas** | Master Orchestrator Agent. Orchestrates work via `delegate_task` to complete ALL tasks in a todo list. | Primary / Advisor |

### Specialist / Subagents

| Agent | Description | Cost | Triggers |
|-------|-------------|------|----------|
| **Oracle** | Read-only consultation agent. High-IQ reasoning specialist for debugging hard problems and high-difficulty architecture design. | EXPENSIVE | Architecture decisions, Self-review, Hard debugging |
| **Librarian** | Specialized codebase understanding agent for multi-repository analysis, searching remote codebases, retrieving official documentation. | CHEAP | External library/source mentioned, Unfamiliar packages |
| **Explore** | Contextual grep for codebases. Answers "Where is X?". | FREE | 2+ modules involved, Find existing codebase structure |
| **Multimodal-Looker**| Analyze media files (PDFs, images, diagrams). Extracts specific information or summaries. | CHEAP | - |
| **Metis** | Pre-planning consultant. Analyzes requests to identify hidden intentions, ambiguities, and AI failure points. | EXPENSIVE | Pre-planning analysis, Ambiguous or complex request |
| **Momus** | Expert reviewer for evaluating work plans against rigorous clarity standards. | EXPENSIVE | Plan review, Quality assurance |
| **Prometheus** | Planner Agent. Operates in Interview/Consultant mode to gather requirements and generate work plans. | - | - |

## Agent Details

### Sisyphus
- **Mode**: Primary
- **Category**: Utility
- **Cost**: EXPENSIVE
- **Key Traits**: Orchestration, Parallel Execution, Task Management (Todos), Delegation.

### Hephaestus
- **Mode**: Primary
- **Reasoning**: Medium (GPT 5.2 Codex)
- **Key Traits**: Autonomous, Deep Exploration, Goal-Oriented, "Do not stop early".

### Oracle
- **Mode**: Subagent
- **Category**: Advisor
- **Cost**: EXPENSIVE
- **Key Traits**: Read-only, High-IQ, Strategic Technical Advisor.

### Librarian
- **Mode**: Subagent
- **Category**: Exploration
- **Cost**: CHEAP
- **Key Traits**: External References, Documentation Discovery, GitHub Search.

### Explore
- **Mode**: Subagent
- **Category**: Exploration
- **Cost**: FREE
- **Key Traits**: Contextual Grep, Internal Codebase Search, Parallel Execution.

### Metis
- **Mode**: Subagent
- **Category**: Advisor
- **Cost**: EXPENSIVE
- **Key Traits**: Intent Classification, Pre-planning Analysis, Risk Identification.

### Momus
- **Mode**: Subagent
- **Category**: Advisor
- **Cost**: EXPENSIVE
- **Key Traits**: Plan Review, "Blocker-finder", Clarity Verification.

### Atlas
- **Mode**: Primary
- **Category**: Advisor
- **Cost**: EXPENSIVE
- **Key Traits**: Todo List Orchestration, Multi-agent Coordination.

### Prometheus
- **Mode**: Planner (Primary/Special)
- **Key Traits**: Interview Mode, Plan Generation, High Accuracy Mode.

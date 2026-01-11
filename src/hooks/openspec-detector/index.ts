import type { PluginInput } from "@opencode-ai/plugin"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import {
  HOOK_NAME,
  OPENSPEC_PROJECT_FILE,
  OPENSPEC_AGENTS_FILE,
  OPENSPEC_DIR,
} from "./constants"
import type { OpenSpecDetectorOptions, OpenSpecState } from "./types"

interface ToolExecuteInput {
  tool: string
  sessionID: string
}

interface ToolExecuteOutput {
  output: string
}

interface EventInput {
  event: {
    type: string
    properties?: unknown
  }
}

function detectOpenSpecState(projectDir: string): OpenSpecState {
  const projectPath = join(projectDir, OPENSPEC_PROJECT_FILE)
  const agentsPath = join(projectDir, OPENSPEC_AGENTS_FILE)
  const changesDir = join(projectDir, OPENSPEC_DIR, "changes")
  const specsDir = join(projectDir, OPENSPEC_DIR, "specs")

  const isInitialized = existsSync(projectPath)

  let activeChanges = 0
  let specsCount = 0

  if (isInitialized) {
    // Count active changes (exclude archive)
    if (existsSync(changesDir)) {
      try {
        const entries = readdirSync(changesDir, { withFileTypes: true })
        activeChanges = entries.filter(
          (e) => e.isDirectory() && e.name !== "archive"
        ).length
      } catch {
        // Ignore errors
      }
    }

    // Count specs
    if (existsSync(specsDir)) {
      try {
        const entries = readdirSync(specsDir, { withFileTypes: true })
        specsCount = entries.filter((e) => e.isDirectory()).length
      } catch {
        // Ignore errors
      }
    }
  }

  return {
    isInitialized,
    projectPath: isInitialized ? projectPath : undefined,
    agentsPath: existsSync(agentsPath) ? agentsPath : undefined,
    activeChanges,
    specsCount,
  }
}

function formatOpenSpecContext(state: OpenSpecState, projectDir: string): string {
  const lines: string[] = [
    "<openspec-context>",
    "**OpenSpec Detected** - This project uses spec-driven development.",
    "",
  ]

  if (state.activeChanges > 0) {
    lines.push(`Active Changes: ${state.activeChanges}`)
  }
  if (state.specsCount > 0) {
    lines.push(`Existing Specs: ${state.specsCount}`)
  }

  lines.push("")
  lines.push("**OpenSpec Workflow (AGENT INSTRUCTIONS):**")
  lines.push("")
  lines.push("When user requests work that matches these scenarios, ASK FOR CONFIRMATION then invoke the workflow directly:")
  lines.push("")
  lines.push("| Scenario | Action |")
  lines.push("|----------|--------|")
  lines.push("| New feature, breaking change, formal requirements | Ask: \"This looks like a feature request. Should I create an OpenSpec proposal?\" → If yes, call `slashcommand(command=\"openspec-proposal\")` and follow the returned instructions |")
  lines.push("| Implementing an existing proposal | Ask: \"Should I implement the OpenSpec proposal `<name>`?\" → If yes, call `slashcommand(command=\"openspec-apply\")` and follow the returned instructions |")
  lines.push("| After deployment/completion of a change | Ask: \"Should I archive this OpenSpec change?\" → If yes, call `slashcommand(command=\"openspec-archive\")` and follow the returned instructions |")
  lines.push("")
  lines.push("**Commands for context:**")
  lines.push("- `openspec list` - See active changes")
  lines.push("- `openspec list --specs` - See existing capabilities")
  lines.push("")
  lines.push("**IMPORTANT**: Do NOT just suggest the user type slash commands. Instead, ask for confirmation and invoke the workflow yourself via `slashcommand` tool.")

  // Include AGENTS.md content if available
  if (state.agentsPath) {
    try {
      const agentsContent = readFileSync(state.agentsPath, "utf-8")
      if (agentsContent.length < 10000) {
        lines.push("")
        lines.push("---")
        lines.push("")
        lines.push("[OpenSpec AGENTS.md Instructions]")
        lines.push(agentsContent)
      }
    } catch {
      // Ignore read errors
    }
  }

  lines.push("</openspec-context>")
  return lines.join("\n")
}

export function createOpenSpecDetectorHook(
  ctx: PluginInput,
  options: OpenSpecDetectorOptions = {}
) {
  const { injectContext = true, suggestWorkflow = true } = options
  const injectedSessions = new Set<string>()
  let cachedState: OpenSpecState | null = null

  function getState(): OpenSpecState {
    if (!cachedState) {
      cachedState = detectOpenSpecState(ctx.directory)
    }
    return cachedState
  }

  return {
    name: HOOK_NAME,

    // Inject OpenSpec context on first tool use in session
    "tool.execute.after": async (
      input: ToolExecuteInput,
      output: ToolExecuteOutput
    ): Promise<{ output?: string } | void> => {
      if (!injectContext) return
      
      const state = getState()
      if (!state.isInitialized) return
      if (injectedSessions.has(input.sessionID)) return

      // Inject on first Read tool to provide context early
      if (input.tool === "Read") {
        injectedSessions.add(input.sessionID)
        const context = formatOpenSpecContext(state, ctx.directory)
        return {
          output: output.output + "\n\n" + context,
        }
      }
    },

    // Handle events like session.create
    handler: async ({ event }: EventInput) => {
      if (event.type === "session.create") {
        // Reset cache on new session
        cachedState = null
      }
    },
  }
}

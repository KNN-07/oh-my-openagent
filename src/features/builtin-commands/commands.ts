import type { CommandDefinition } from "../claude-code-command-loader"
import type { BuiltinCommandName, BuiltinCommands } from "./types"
import { INIT_DEEP_TEMPLATE } from "./templates/init-deep"
import { RALPH_LOOP_TEMPLATE, CANCEL_RALPH_TEMPLATE } from "./templates/ralph-loop"
import { REFACTOR_TEMPLATE } from "./templates/refactor"
import { START_WORK_TEMPLATE } from "./templates/start-work"
import { OPENSPEC_PROPOSAL_TEMPLATE } from "./templates/openspec-proposal"
import { OPENSPEC_APPLY_TEMPLATE } from "./templates/openspec-apply"
import { OPENSPEC_ARCHIVE_TEMPLATE } from "./templates/openspec-archive"

const BUILTIN_COMMAND_DEFINITIONS: Record<BuiltinCommandName, Omit<CommandDefinition, "name">> = {
  "init-deep": {
    description: "(builtin) Initialize hierarchical AGENTS.md knowledge base",
    template: `<command-instruction>
${INIT_DEEP_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[--create-new] [--max-depth=N]",
  },
  "ralph-loop": {
    description: "(builtin) Start self-referential development loop until completion",
    template: `<command-instruction>
${RALPH_LOOP_TEMPLATE}
</command-instruction>

<user-task>
$ARGUMENTS
</user-task>`,
    argumentHint: '"task description" [--completion-promise=TEXT] [--max-iterations=N]',
  },
  "cancel-ralph": {
    description: "(builtin) Cancel active Ralph Loop",
    template: `<command-instruction>
${CANCEL_RALPH_TEMPLATE}
</command-instruction>`,
  },
  refactor: {
    description:
      "(builtin) Intelligent refactoring command with LSP, AST-grep, architecture analysis, codemap, and TDD verification.",
    template: `<command-instruction>
${REFACTOR_TEMPLATE}
</command-instruction>`,
    argumentHint: "<refactoring-target> [--scope=<file|module|project>] [--strategy=<safe|aggressive>]",
  },
  "start-work": {
    description: "(builtin) Start Sisyphus work session from Prometheus plan",
    agent: "orchestrator-sisyphus",
    template: `<command-instruction>
${START_WORK_TEMPLATE}
</command-instruction>

<session-context>
Session ID: $SESSION_ID
Timestamp: $TIMESTAMP
</session-context>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "[plan-name]",
  },
  "openspec-proposal": {
    description: "(builtin) Create OpenSpec change proposal for spec-driven development",
    template: `<command-instruction>
${OPENSPEC_PROPOSAL_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "<change-name> [description]",
  },
  "openspec-apply": {
    description: "(builtin) Implement an approved OpenSpec change proposal",
    template: `<command-instruction>
${OPENSPEC_APPLY_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "<change-name>",
  },
  "openspec-archive": {
    description: "(builtin) Archive completed OpenSpec change after deployment",
    template: `<command-instruction>
${OPENSPEC_ARCHIVE_TEMPLATE}
</command-instruction>

<user-request>
$ARGUMENTS
</user-request>`,
    argumentHint: "<change-name> [--skip-specs]",
  },
}

export function loadBuiltinCommands(
  disabledCommands?: BuiltinCommandName[]
): BuiltinCommands {
  const disabled = new Set(disabledCommands ?? [])
  const commands: BuiltinCommands = {}

  for (const [name, definition] of Object.entries(BUILTIN_COMMAND_DEFINITIONS)) {
    if (!disabled.has(name as BuiltinCommandName)) {
      const { argumentHint: _argumentHint, ...openCodeCompatible } = definition
      commands[name] = openCodeCompatible as CommandDefinition
    }
  }

  return commands
}

import type { CommandDefinition } from "../claude-code-command-loader"

export type BuiltinCommandName = "init-deep" | "ralph-loop" | "cancel-ralph" | "refactor" | "start-work" | "openspec-proposal" | "openspec-apply" | "openspec-archive"

export interface BuiltinCommandConfig {
  disabled_commands?: BuiltinCommandName[]
}

export type BuiltinCommands = Record<string, CommandDefinition>

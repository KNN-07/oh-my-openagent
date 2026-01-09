export interface OpenSpecDetectorOptions {
  /** Whether to inject OpenSpec context on session init */
  injectContext?: boolean
  /** Whether to remind about OpenSpec workflow on feature requests */
  suggestWorkflow?: boolean
}

export interface OpenSpecState {
  /** Whether OpenSpec is initialized in the project */
  isInitialized: boolean
  /** Path to openspec/project.md if exists */
  projectPath?: string
  /** Path to openspec/AGENTS.md if exists */
  agentsPath?: string
  /** Number of active changes */
  activeChanges: number
  /** Number of specs */
  specsCount: number
}

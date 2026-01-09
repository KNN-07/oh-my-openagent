import { describe, expect, test, beforeEach, mock } from "bun:test"
import * as fs from "node:fs"
import { HOOK_NAME } from "./constants"

const originalExistsSync = fs.existsSync.bind(fs)
const originalReadFileSync = fs.readFileSync.bind(fs)
const originalReaddirSync = fs.readdirSync.bind(fs)

let mockExistsSync: ((path: fs.PathLike) => boolean) | null = null
let mockReadFileSync: ((path: fs.PathLike) => string) | null = null
let mockReaddirSync: ((path: fs.PathLike) => fs.Dirent[]) | null = null

mock.module("node:fs", () => ({
  ...fs,
  existsSync: (path: fs.PathLike) => {
    if (mockExistsSync) return mockExistsSync(path)
    return originalExistsSync(path)
  },
  readFileSync: (path: fs.PathLike, encoding?: BufferEncoding) => {
    if (mockReadFileSync && typeof path === "string" && path.includes("openspec/")) {
      return mockReadFileSync(path)
    }
    return originalReadFileSync(path, encoding as BufferEncoding)
  },
  readdirSync: (path: fs.PathLike, options?: any) => {
    if (mockReaddirSync && typeof path === "string" && path.includes("openspec/")) {
      return mockReaddirSync(path)
    }
    return originalReaddirSync(path, options)
  },
}))

import { createOpenSpecDetectorHook } from "./index"

describe("openspec-detector hook", () => {
  const mockProjectDir = "/test/project"

  function createMockPluginInput(directory: string = mockProjectDir) {
    return {
      directory,
      client: {
        tui: {
          showToast: async () => {},
        },
      },
    } as any
  }

  beforeEach(() => {
    mockExistsSync = null
    mockReadFileSync = null
    mockReaddirSync = null
  })

  describe("hook name", () => {
    test("should have correct hook name", () => {
      // #given
      const ctx = createMockPluginInput()

      // #when
      const hook = createOpenSpecDetectorHook(ctx)

      // #then
      expect(hook.name).toBe(HOOK_NAME)
      expect(hook.name).toBe("openspec-detector")
    })
  })

  describe("OpenSpec detection", () => {
    test("should detect when OpenSpec is not initialized", async () => {
      // #given
      mockExistsSync = () => false

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)

      // #when
      const input = { tool: "Read", sessionID: "session-1" }
      const output = { output: "file content" }
      const result = await hook["tool.execute.after"](input, output)

      // #then
      expect(result).toBeUndefined()
    })

    test("should detect when OpenSpec is initialized", async () => {
      // #given
      mockExistsSync = (p) => String(p).includes("openspec/project.md")

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)

      // #when
      const input = { tool: "Read", sessionID: "session-1" }
      const output = { output: "file content" }
      const result = await hook["tool.execute.after"](input, output)

      // #then
      expect(result).toBeDefined()
      expect(result?.output).toContain("<openspec-context>")
      expect(result?.output).toContain("OpenSpec Detected")
    })

    test("should include active changes count in context", async () => {
      // #given
      mockExistsSync = (p) => {
        const pathStr = String(p)
        return pathStr.includes("openspec/project.md") || pathStr.includes("openspec/changes")
      }
      mockReaddirSync = (p) => {
        const pathStr = String(p)
        if (pathStr.includes("changes")) {
          return [
            { isDirectory: () => true, name: "feature-1" },
            { isDirectory: () => true, name: "feature-2" },
            { isDirectory: () => true, name: "archive" },
          ] as fs.Dirent[]
        }
        return []
      }

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)

      // #when
      const input = { tool: "Read", sessionID: "session-1" }
      const output = { output: "file content" }
      const result = await hook["tool.execute.after"](input, output)

      // #then
      expect(result?.output).toContain("Active Changes: 2")
    })

    test("should include specs count in context", async () => {
      // #given
      mockExistsSync = (p) => {
        const pathStr = String(p)
        return pathStr.includes("openspec/project.md") || pathStr.includes("openspec/specs")
      }
      mockReaddirSync = (p) => {
        const pathStr = String(p)
        if (pathStr.includes("specs")) {
          return [
            { isDirectory: () => true, name: "auth" },
            { isDirectory: () => true, name: "payments" },
            { isDirectory: () => true, name: "users" },
          ] as fs.Dirent[]
        }
        return []
      }

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)

      // #when
      const input = { tool: "Read", sessionID: "session-1" }
      const output = { output: "file content" }
      const result = await hook["tool.execute.after"](input, output)

      // #then
      expect(result?.output).toContain("Existing Specs: 3")
    })

    test("should include AGENTS.md content if available", async () => {
      // #given
      const agentsMdContent = "# OpenSpec Agent Instructions\nFollow these rules..."
      mockExistsSync = (p) => {
        const pathStr = String(p)
        return pathStr.includes("openspec/project.md") || pathStr.includes("openspec/AGENTS.md")
      }
      mockReadFileSync = () => agentsMdContent

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)

      // #when
      const input = { tool: "Read", sessionID: "session-1" }
      const output = { output: "file content" }
      const result = await hook["tool.execute.after"](input, output)

      // #then
      expect(result?.output).toContain("[OpenSpec AGENTS.md Instructions]")
      expect(result?.output).toContain(agentsMdContent)
    })

    test("should not include AGENTS.md if too large", async () => {
      // #given
      const largeContent = "x".repeat(15000)
      mockExistsSync = (p) => {
        const pathStr = String(p)
        return pathStr.includes("openspec/project.md") || pathStr.includes("openspec/AGENTS.md")
      }
      mockReadFileSync = () => largeContent

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)

      // #when
      const input = { tool: "Read", sessionID: "session-1" }
      const output = { output: "file content" }
      const result = await hook["tool.execute.after"](input, output)

      // #then
      expect(result?.output).not.toContain("[OpenSpec AGENTS.md Instructions]")
      expect(result?.output).not.toContain(largeContent)
    })
  })

  describe("context injection behavior", () => {
    test("should only inject on Read tool", async () => {
      // #given
      mockExistsSync = (p) => String(p).includes("openspec/project.md")

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)

      // #when
      const input = { tool: "Write", sessionID: "session-1" }
      const output = { output: "file written" }
      const result = await hook["tool.execute.after"](input, output)

      // #then
      expect(result).toBeUndefined()
    })

    test("should only inject once per session", async () => {
      // #given
      mockExistsSync = (p) => String(p).includes("openspec/project.md")

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)
      const sessionID = "session-1"

      // #when
      const input = { tool: "Read", sessionID }
      const output = { output: "file content" }

      const result1 = await hook["tool.execute.after"](input, output)
      const result2 = await hook["tool.execute.after"](input, output)

      // #then
      expect(result1?.output).toContain("<openspec-context>")
      expect(result2).toBeUndefined()
    })

    test("should inject for different sessions", async () => {
      // #given
      mockExistsSync = (p) => String(p).includes("openspec/project.md")

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)

      // #when
      const input1 = { tool: "Read", sessionID: "session-1" }
      const input2 = { tool: "Read", sessionID: "session-2" }
      const output = { output: "file content" }

      const result1 = await hook["tool.execute.after"](input1, output)
      const result2 = await hook["tool.execute.after"](input2, output)

      // #then
      expect(result1?.output).toContain("<openspec-context>")
      expect(result2?.output).toContain("<openspec-context>")
    })

    test("should not inject when injectContext option is false", async () => {
      // #given
      mockExistsSync = (p) => String(p).includes("openspec/project.md")

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx, { injectContext: false })

      // #when
      const input = { tool: "Read", sessionID: "session-1" }
      const output = { output: "file content" }
      const result = await hook["tool.execute.after"](input, output)

      // #then
      expect(result).toBeUndefined()
    })
  })

  describe("session.create event", () => {
    test("should reset cache on session.create event", async () => {
      // #given
      let openspecExists = true
      mockExistsSync = (p) => openspecExists && String(p).includes("openspec/project.md")

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)

      const input1 = { tool: "Read", sessionID: "session-1" }
      const output = { output: "file content" }
      const result1 = await hook["tool.execute.after"](input1, output)
      expect(result1?.output).toContain("<openspec-context>")

      // #when
      await hook.handler({ event: { type: "session.create" } })
      openspecExists = false

      // #then
      const input2 = { tool: "Read", sessionID: "session-2" }
      const result2 = await hook["tool.execute.after"](input2, output)
      expect(result2).toBeUndefined()
    })
  })

  describe("workflow reminder content", () => {
    test("should include all workflow commands in context", async () => {
      // #given
      mockExistsSync = (p) => String(p).includes("openspec/project.md")

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)

      // #when
      const input = { tool: "Read", sessionID: "session-1" }
      const output = { output: "file content" }
      const result = await hook["tool.execute.after"](input, output)

      // #then
      expect(result?.output).toContain("/openspec-proposal")
      expect(result?.output).toContain("/openspec-apply")
      expect(result?.output).toContain("/openspec-archive")
      expect(result?.output).toContain("openspec list")
      expect(result?.output).toContain("</openspec-context>")
    })
  })

  describe("error handling", () => {
    test("should handle readdirSync errors gracefully", async () => {
      // #given
      mockExistsSync = (p) => {
        const pathStr = String(p)
        return pathStr.includes("openspec/project.md") || pathStr.includes("openspec/changes")
      }
      mockReaddirSync = () => {
        throw new Error("Permission denied")
      }

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)

      // #when
      const input = { tool: "Read", sessionID: "session-1" }
      const output = { output: "file content" }
      const result = await hook["tool.execute.after"](input, output)

      // #then
      expect(result?.output).toContain("<openspec-context>")
      expect(result?.output).not.toContain("Active Changes:")
    })

    test("should handle readFileSync errors gracefully", async () => {
      // #given
      mockExistsSync = (p) => {
        const pathStr = String(p)
        return pathStr.includes("openspec/project.md") || pathStr.includes("openspec/AGENTS.md")
      }
      mockReadFileSync = () => {
        throw new Error("File not readable")
      }

      const ctx = createMockPluginInput()
      const hook = createOpenSpecDetectorHook(ctx)

      // #when
      const input = { tool: "Read", sessionID: "session-1" }
      const output = { output: "file content" }
      const result = await hook["tool.execute.after"](input, output)

      // #then
      expect(result?.output).toContain("<openspec-context>")
      expect(result?.output).not.toContain("[OpenSpec AGENTS.md Instructions]")
    })
  })
})

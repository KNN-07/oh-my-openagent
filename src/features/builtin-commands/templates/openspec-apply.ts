export const OPENSPEC_APPLY_TEMPLATE = `# /openspec-apply

Implement an approved OpenSpec change proposal.

## Prerequisites

1. **Verify change exists and is valid**:
   \`\`\`bash
   openspec validate <change-name> --strict
   \`\`\`
   
   If validation fails, fix issues first or ask user to approve anyway.

2. **Read the proposal context**:
   - Read \`openspec/changes/<change-name>/proposal.md\` - understand WHY
   - Read \`openspec/changes/<change-name>/design.md\` (if exists) - technical decisions
   - Read \`openspec/changes/<change-name>/tasks.md\` - implementation checklist

---

## Workflow

### Phase 1: Create TODO List from tasks.md

Parse tasks.md and create a TODO list:
\`\`\`
TodoWrite([
  { id: "1.1", content: "<task description>", status: "pending", priority: "high" },
  { id: "1.2", content: "<task description>", status: "pending", priority: "high" },
  ...
])
\`\`\`

### Phase 2: Implement Tasks Sequentially

For each task:
1. Mark as \`in_progress\`
2. Implement the change
3. Verify with \`lsp_diagnostics\` on changed files
4. Mark as \`completed\`
5. Update tasks.md: change \`- [ ]\` to \`- [x]\`

### Phase 3: Update tasks.md

After completing each task, update the checkbox in tasks.md:
\`\`\`markdown
## 1. Implementation
- [x] 1.1 Create database schema  ← Mark complete
- [ ] 1.2 Implement API endpoint  ← Next task
\`\`\`

### Phase 4: Verification

After all tasks complete:
1. Run build (if exists): \`bun run build\` or \`npm run build\`
2. Run tests (if exists): \`bun test\` or \`npm test\`
3. Run final validation: \`openspec validate <change-name> --strict\`

---

## Critical Rules

- **NEVER skip tasks** - implement every item in tasks.md
- **NEVER mark done without verification** - run lsp_diagnostics, build, tests
- **Update tasks.md in real-time** - checkboxes reflect actual progress
- **Follow the spec** - implementation must match the requirements in spec deltas
- **Reference the spec** - add comments linking to spec when implementing complex logic

---

## Output

When all tasks are complete:
\`\`\`
=== OpenSpec Apply Complete ===

Change: <change-name>
Tasks Completed: N/N

Verification:
  ✓ All tasks marked complete in tasks.md
  ✓ LSP diagnostics clean
  ✓ Build passed (if applicable)
  ✓ Tests passed (if applicable)

Next Steps:
1. Review implementation with stakeholders
2. Create PR / merge to main
3. After deployment, run: /openspec-archive <change-name>
\`\`\`

---

## Error Handling

If a task fails:
1. Document the issue
2. Consult oracle if stuck after 2+ attempts
3. Update tasks.md with notes about blockers
4. Ask user for guidance before continuing`

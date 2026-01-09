export const OPENSPEC_ARCHIVE_TEMPLATE = `# /openspec-archive

Archive a completed OpenSpec change after deployment.

## Prerequisites

1. **Verify all tasks are complete**:
   \`\`\`bash
   cat openspec/changes/<change-name>/tasks.md | grep -E "^- \\[ \\]"
   \`\`\`
   
   If any unchecked tasks remain, complete them first with \`/openspec-apply\`.

2. **Verify the change was deployed** (ask user if unclear)

---

## Workflow

### Phase 1: Pre-Archive Validation

\`\`\`bash
openspec validate <change-name> --strict
\`\`\`

### Phase 2: Archive the Change

\`\`\`bash
openspec archive <change-name> --yes
\`\`\`

This will:
- Move \`changes/<change-name>/\` → \`changes/archive/YYYY-MM-DD-<change-name>/\`
- Update \`specs/\` with the approved delta changes
- Merge ADDED/MODIFIED/REMOVED requirements into the source of truth

### Phase 3: Verify Archive

\`\`\`bash
# Verify change is archived
ls openspec/changes/archive/ | grep <change-name>

# Verify specs are updated
openspec list --specs
\`\`\`

---

## Special Cases

### Skip Spec Updates (infrastructure-only changes)

For changes that don't modify capability specs (e.g., CI/CD, tooling):
\`\`\`bash
openspec archive <change-name> --skip-specs --yes
\`\`\`

### Multiple Changes

If archiving multiple changes, process in dependency order:
1. Archive base changes first
2. Then archive dependent changes

---

## Output

\`\`\`
=== OpenSpec Archive Complete ===

Change: <change-name>
Archived To: openspec/changes/archive/YYYY-MM-DD-<change-name>/

Specs Updated:
  ✓ specs/<capability>/spec.md (N requirements merged)

The change is now part of the project's living documentation.
Run \`openspec list --specs\` to see updated capabilities.
\`\`\`

---

## Rollback

If archive was premature:
1. Move folder back: \`mv openspec/changes/archive/YYYY-MM-DD-<name>/ openspec/changes/<name>/\`
2. Manually revert spec changes (check git diff)
3. Re-run \`/openspec-apply\` if needed`

export const OPENSPEC_PROPOSAL_TEMPLATE = `# /openspec-proposal

Create an OpenSpec change proposal for spec-driven development.

## Prerequisites

1. **Check if OpenSpec is initialized**:
   \`\`\`bash
   ls openspec/project.md 2>/dev/null || echo "NOT_INITIALIZED"
   \`\`\`
   
   If NOT_INITIALIZED:
   \`\`\`bash
   npx @fission-ai/openspec init
   \`\`\`

2. **Check existing context**:
   \`\`\`bash
   openspec list          # Active changes
   openspec list --specs  # Existing capabilities
   \`\`\`

---

## Workflow

### Phase 1: Context Gathering

1. Read \`openspec/project.md\` for conventions
2. Search existing specs: \`rg -n "Requirement:|Scenario:" openspec/specs\`
3. Check for conflicts with pending changes

### Phase 2: Create Change Directory

Use the provided change name (kebab-case, verb-led):
\`\`\`bash
CHANGE_NAME="<provided-name>"
mkdir -p openspec/changes/$CHANGE_NAME/specs
\`\`\`

### Phase 3: Write Proposal Files

**proposal.md**:
\`\`\`markdown
## Why
[1-2 sentences on problem/opportunity]

## What Changes
- [Bullet list of changes]
- [Mark breaking changes with **BREAKING**]

## Impact
- Affected specs: [list capabilities]
- Affected code: [key files/systems]
\`\`\`

**tasks.md**:
\`\`\`markdown
## 1. [Category]
- [ ] 1.1 [Specific task]
- [ ] 1.2 [Specific task]

## 2. [Category]
- [ ] 2.1 [Specific task]
\`\`\`

**design.md** (optional - create if cross-cutting, new patterns, or complex):
\`\`\`markdown
## Context
[Background, constraints]

## Goals / Non-Goals
- Goals: [...]
- Non-Goals: [...]

## Decisions
- [What and why]

## Risks / Trade-offs
- [Risk] → Mitigation
\`\`\`

### Phase 4: Write Spec Deltas

For each affected capability, create \`specs/<capability>/spec.md\`:
\`\`\`markdown
## ADDED Requirements
### Requirement: [Name]
The system SHALL [normative statement].

#### Scenario: [Name]
- **WHEN** [condition]
- **THEN** [expected outcome]

## MODIFIED Requirements
### Requirement: [Existing Name]
[Complete updated requirement - paste FULL content, not just changes]

#### Scenario: [Name]
- **WHEN** [condition]
- **THEN** [expected outcome]

## REMOVED Requirements
### Requirement: [Name]
**Reason**: [Why removing]
**Migration**: [How to handle]
\`\`\`

### Phase 5: Validate

\`\`\`bash
openspec validate $CHANGE_NAME --strict
\`\`\`

Fix any validation errors before presenting proposal.

---

## Critical Rules

- **Every requirement MUST have at least one \`#### Scenario:\` block**
- **Use \`###\` for requirements, \`####\` for scenarios**
- **MODIFIED requirements must include FULL content (not just changes)**
- **Use SHALL/MUST for normative language**
- **Change IDs: verb-led, kebab-case (add-, update-, remove-, refactor-)**

---

## Output

Present the proposal summary:
\`\`\`
=== OpenSpec Proposal Created ===

Change: <change-name>
Path: openspec/changes/<change-name>/

Files:
  ✓ proposal.md
  ✓ tasks.md
  ✓ design.md (if created)
  ✓ specs/<capability>/spec.md

Affected Capabilities: [list]

Next Steps:
1. Review the proposal with stakeholders
2. Run: /openspec-apply <change-name>
\`\`\`

Do NOT start implementation until proposal is approved.`

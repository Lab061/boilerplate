# PRD-NNN: [Feature Title]

> **Status**: draft | ready | in-progress | done
> **Author**: [name]
> **Created**: YYYY-MM-DD
> **Depends On**: PRD-000

---

## 1. Summary

One paragraph: what this feature does and why it matters.

## 2. User Stories & Acceptance Criteria

**US-NNN-1**: As a [persona], I want to [action] so that [outcome].

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2
- [ ] Acceptance criterion 3

**US-NNN-2**: As a [persona], I want to [action] so that [outcome].

- [ ] Acceptance criterion 1
- [ ] Acceptance criterion 2

## 3. Technical Spec

### 3.1 API Changes

| Method | Path | Auth | Request Body | Response | Notes |
| ------ | ---- | ---- | ------------ | -------- | ----- |
|        |      |      |              |          |       |

If no API changes, write "None".

### 3.2 DynamoDB Changes

New entities or attributes added to the single table:

| Entity | PK  | SK  | New/Changed Attributes |
| ------ | --- | --- | ---------------------- |
|        |     |     |                        |

New access patterns:

| Pattern | Key Condition |
| ------- | ------------- |
|         |               |

If no DB changes, write "None".

### 3.3 S3 / Storage Changes

Describe any new prefixes, lifecycle rules, or bucket changes. Write "None" if not applicable.

### 3.4 Infrastructure (sst.config.ts / infra/)

List any new SST resources, permissions, environment variables, or event subscriptions needed. Write "None" if not applicable.

### 3.5 Implementation Approach

Step-by-step plan, ordered by dependency. Reference existing code patterns:

1. **packages/core** — New Zod schemas and ElectroDB entities
   - Reference: `packages/core/src/schemas.ts` for schema patterns
   - Reference: `packages/core/src/entities.ts` for entity patterns
2. **packages/functions** — New or modified Lambda handlers
   - Reference: `packages/functions/src/register.ts` for handler pattern
3. **packages/frontend** — New components or pages
   - Reference: `packages/frontend/src/api.ts` for API call patterns
   - Reference: `packages/frontend/src/main.tsx` for routing patterns
4. **infra/** — Infrastructure changes
   - Reference: `infra/api.ts` for route definitions and resource linking

### 3.6 Affected Files

List every file that will be created or modified:

**New files:**

- `packages/functions/src/newHandler.ts`
- `packages/frontend/src/pages/NewPage.tsx`

**Modified files:**

- `packages/core/src/schemas.ts` — add new schemas
- `infra/api.ts` — add new route

## 4. Edge Cases & Error Handling

| Scenario | Expected Behavior |
| -------- | ----------------- |
|          |                   |

## 5. Security Considerations

Bullet list of security implications and mitigations. Consider:

- Auth/authorization requirements
- Input validation
- IAM scope changes
- Data isolation between users

## 6. Testing Plan

### Manual Verification

- [ ] Step-by-step manual test scenario 1
- [ ] Step-by-step manual test scenario 2

### Automated Tests (if applicable)

- [ ] Unit test for [specific function]
- [ ] Integration test for [specific endpoint]

## 7. Out of Scope

Bullet list of things explicitly NOT included in this PRD.

## 8. Open Questions

- [ ] Any unresolved decisions that need answers before status can move to `ready`

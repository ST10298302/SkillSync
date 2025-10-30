# SonarCloud Fix Plan

## Issues to Fix

### 1. Coverage: 0.0% → ≥80.0%
**Priority: HIGH**

Files with 0% coverage (need tests):
- `services/`: All services have 0% coverage
  - `analyticsService.ts`
  - `biometricService.ts`
  - `challengeService.ts`
  - `mediaService.ts`
  - `optimizedSupabaseService.ts`
  - `performanceMonitor.ts`
  - `pinService.ts`
  - `sessionTimeoutService.ts`
  - `skillManagementService.ts`
  - `socialService.ts`
  - `supabaseService.ts`
  - `techniqueService.ts`
  - `tutorService.ts`
- `utils/`: 
  - `base64.ts` (0%)
  - `supabase.ts` (0%)
  - `skillProgression.ts` (0%)

**Action**: Write unit tests for these files, prioritizing:
1. Utility functions (base64.ts, supabase.ts)
2. Core services (pinService.ts, biometricService.ts, sessionTimeoutService.ts)
3. Other services

### 2. Duplicated Lines: 9.7% → ≤3.0%
**Priority: MEDIUM**

Common patterns to refactor:
- Error handling patterns
- Alert dialog patterns
- Async/await patterns
- Component styling patterns

**Action**: Extract common patterns into utilities/components

### 3. Maintainability Rating: C → A
**Priority: MEDIUM**

Issues to fix:
- Fix remaining async onPress handlers
- Reduce code complexity
- Improve code organization

**Action**: Refactor complex functions, extract utilities

## Implementation Steps

1. ✅ Fix async onPress handlers in ReactionButton.tsx
2. ⏳ Write tests for utility functions (base64.ts, supabase.ts)
3. ⏳ Write tests for core services (pinService.ts, biometricService.ts)
4. ⏳ Extract duplicated code patterns
5. ⏳ Refactor complex functions


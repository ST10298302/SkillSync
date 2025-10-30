# SonarCloud Fix Strategy

## Current Status
- ❌ Coverage: 0.0% (needs ≥80%)
- ❌ Duplicated Lines: 9.7% (needs ≤3.0%)
- ❌ Maintainability Rating: C (needs A)

---

## Quick Wins (Do These First)

### 1. ✅ Fix Async onPress Handlers (DONE)
- Fixed: `components/ReactionButton.tsx`
- Fixed: `components/ChallengeCard.tsx`
- Fixed: `components/TechniqueCard.tsx`
- Already fixed: `app/settings/privacy-security.tsx`, `app/(tabs)/profile.tsx`

### 2. ✅ Write Tests for Utilities (STARTED)
- ✅ Created: `__tests__/utils/base64.test.ts` (5 tests passing)

---

## Strategy to Fix Coverage (0% → ≥80%)

### Priority 1: Utility Functions (Quick wins)
Write tests for these small, isolated functions first:
- ✅ `utils/base64.ts` - DONE (5 tests)
- ⏳ `utils/supabase.ts` - Next (has AsyncStorage adapter)
- ⏳ `utils/skillProgression.ts` - Next

### Priority 2: Core Services (Medium complexity)
These are critical for app functionality:
- ⏳ `services/pinService.ts` - Core security feature
- ⏳ `services/biometricService.ts` - Core security feature  
- ⏳ `services/sessionTimeoutService.ts` - Core security feature

### Priority 3: Other Services (Lower priority)
- ⏳ All other services (can be done incrementally)

### Test Coverage Target
- Aim for **80%+ coverage** on new code
- Focus on **critical paths** (happy paths + error handling)
- Don't need 100% coverage - focus on quality over quantity

---

## Strategy to Fix Duplicated Lines (9.7% → ≤3.0%)

### Common Patterns to Extract:

1. **Alert Delete Confirmation Pattern**
   - Used in: `TechniqueCard.tsx`, `ChallengeCard.tsx`, `SkillCard.tsx`
   - Extract to: `utils/alertHelpers.ts` → `confirmDelete()`

2. **Error Handling Pattern**
   - Common try/catch with Alert.alert
   - Extract to: `utils/errorHandling.ts` → `handleError()`

3. **Theme Colors Pattern**
   - `const safeTheme = resolvedTheme === 'light' || resolvedTheme === 'dark' ? resolvedTheme : 'light';`
   - Extract to: `hooks/useSafeTheme.ts`

4. **Async Handler Wrapper**
   - Pattern: `() => { void (async () => { ... })(); }`
   - Extract to: `utils/asyncHelpers.ts` → `voidAsync()`

### Action Plan:
1. Identify duplicated code blocks (use SonarCloud duplication report)
2. Extract common patterns into utilities
3. Update all files to use new utilities
4. Re-run SonarCloud analysis

---

## Strategy to Fix Maintainability Rating (C → A)

### Code Quality Issues:
1. ✅ Fix async onPress handlers (DONE)
2. ✅ Fix conditional rendering (DONE - converted to explicit booleans)
3. ✅ Use Number.parseInt/parseFloat (DONE)
4. ✅ Use Number.isNaN (DONE)
5. ✅ Use codePointAt instead of charCodeAt (DONE)
6. ⏳ Reduce function complexity (split large functions)
7. ⏳ Reduce nesting depth (extract functions)
8. ⏳ Improve code organization

### Action Plan:
1. Run SonarCloud analysis to get specific maintainability issues
2. Fix high-severity issues first
3. Refactor complex functions (>20 lines, >3 nesting levels)
4. Extract repeated logic into utilities

---

## Recommended Fix Order

### Week 1: Quick Wins
1. ✅ Fix async onPress handlers
2. ✅ Write tests for `utils/base64.ts`
3. ⏳ Write tests for `utils/supabase.ts`
4. ⏳ Write tests for `utils/skillProgression.ts`

### Week 2: Core Services
1. ⏳ Write tests for `services/pinService.ts`
2. ⏳ Write tests for `services/biometricService.ts`
3. ⏳ Write tests for `services/sessionTimeoutService.ts`

### Week 3: Reduce Duplication
1. ⏳ Extract alert helpers
2. ⏳ Extract error handling utilities
3. ⏳ Extract theme utilities
4. ⏳ Update all files to use new utilities

### Week 4: Maintainability
1. ⏳ Refactor complex functions
2. ⏳ Reduce nesting depth
3. ⏳ Improve code organization

---

## Commands to Run

```bash
# Run tests with coverage
npm run test:coverage

# Check coverage report
open coverage/lcov-report/index.html

# Run lint
npm run lint

# Run SonarCloud analysis (via GitHub Actions)
# Push to main branch or create PR
```

---

## Notes

- **Don't aim for 100% coverage** - focus on 80%+ with quality tests
- **Test critical paths** - happy paths + error handling
- **Refactor incrementally** - don't try to fix everything at once
- **Use SonarCloud dashboard** - it shows exactly which files need attention


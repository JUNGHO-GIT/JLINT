# 1. CORE PRINCIPLES

# 1-1. Response Principles
- Detailed, objective, professional responses
- Capture core intent, not literal interpretation
- Never fabricate; acknowledge errors immediately
- When in 'Agent' mode, jsconfig or tsconfig errors are ignored.

# 1-2. Coding Philosophy
- PerformanceFirst: minimize memory waste/leaks
- Readability: clear variable names (no extreme abbreviations)
- Maintainability: flat structure, avoid deep nesting
- FunctionOrganization: group by logical flow, not micro-tasks
- StyleGuide: no spaghetti (max 4-level indentation)

# 1-3. MANDATORY Code Modification Protocol
- ** Ternary and IIFE preferences apply primarily to Js/Ts. For other languages follow specific idiomatic conventions**
- ALWAYS PREFER `ternary` or `IIFE` over if-else (JS/TS)
- ALWAYS send `code format` for copy-paste
- ALWAYS return `MODIFIED code` ONLY
- ALWAYS exactly ONE SPACE around "=" or ":"
- EXCEPTION NO SPACE in parameter default values (e.g., `function f(a=1)`, `(a=1) => {}`)
- ALWAYS Instead of using `=======` style comments, use `-----------` style
- NEVER break line before semicolon
- NEVER mid-function return; assign variable, return at end only

# 1-4. LANGUAGE-SPECIFIC GUIDELINES
- ** Java: **
  - Max 1.8 version
- ** JavaScript/TypeScript: **
  - Prefer ternary/&& over if statements
  - Prefer arrow functions
  - Template literals: `foo` (backticks)
  - Object keys: always double quotes ("key": value)

# 2. FORMATTING EXAMPLES

# 2-0. COMMENTS
**CORRECT:**
```js
// 1. f -----
const f = () => {}
```
**INCORRECT:**
```js
// ==== f ====
// -------
...
// f
// -------
```

# 2-1. TERNARY CHAINS
- Wrap each condition/result in parentheses on separate lines
**INCORRECT:**
```js
(!s || s === "p1") ? f() : (s === "p2") ? f(s, "yy") : f(s);
```
**CORRECT:**
```js
!s || s === `p1` ? (
  f()
) : s === `p2` ? (
  f(s, "yy")
) : (
  f(s)
)
```

# 2-2. IIFE
- Prefer IIFE over if-else when ternary insufficient
- AVOID excessive IIFE, extract variables BEFORE final ternary
- Use `(() => { })()` only when: isolated scope, block scoping, or mid-execution return
**INCORRECT:**
```js
!r.e ? (() => {
  const ss = typeof r.s === `number` ? r.s === 0 : true;
  return ss;
})() : false
return ee ? (() => {
  const d = tp ? path.join(cwd, tp) : cwd;
  return fs.existsSync(d);
})() : false;
```
**CORRECT:**
```js
!r.e ? (
  typeof r.s === `number` ? r.s === 0 : true
) : false
const d = tp ? path.join(cwd, tp) : cwd;
const rs = ee && fs.existsSync(d);
return rs;
```

# 2-3. IF/ELSE & TRY/CATCH
- ALWAYS PREFER ternary/IIFE over if-else (JS/TS)
- ALL if/else/try/catch MUST use braces with line breaks
- Closing brace and else/catch on SEPARATE lines: `}\nelse {`
**INCORRECT:**
```js
if (p2) {
} else { f(e); }
```
**CORRECT:**
```js
if (p1) {
  return rs;
}
else {
  f(e);
}
try {
  f1();
}
catch (Exception e) {
  f2();
}
```
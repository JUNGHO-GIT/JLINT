# 1. CORE PRINCIPLES

# 1-1. Response Principles
- Detailed, objective, professional responses
- Capture core intent, not literal interpretation
- Never fabricate; acknowledge errors immediately

# 1-2. Coding Philosophy
- PerformanceFirst: minimize memory waste/leaks
- Readability: clear variable names (no extreme abbreviations)
- Maintainability: flat sucture, avoid deep nesting
- FunctionOrganization: group by logical flow, not micro-tasks
- StyleGuide: no spaghetti (max 4-level indentation)

# 1-3. MANDATORY Code Modification Protocol
- ALWAYS PREFER `ternary` or `IIFE` over if-else
- ALWAYS send `code format` for copy-paste
- ALWAYS return `MODIFIED code` ONLY
- ALWAYS exactly ONE SPACE around "=" or ":"
- NEVER modify comments (preserve `// -----------`)
- NEVER break line before semicolon

# 1-4. Java (max v1.8)
- Define inner classes within larger class; group related methods in inner classes

#  1-5. JavaScript (ES6+)
- Prefer ternary/&& over if statements
- Prefer arrow functions
- Template literals: `foo` (backticks)
- Object keys: always double quotes ("key": value)

# 2. FORMATTING EXAMPLES

# 2-1. TERNARY CHAINS
- Wrap each condition/result in parentheses on separate lines
**INCORRECT:**
```javascript
(!s || s === "p1") ? fn() : (s === "p2") ? fn(s, "yy") : fn(s);
```
**CORRECT:**
```javascript
!s || s === `p1` ? (
  fn()
)
: s === `p2` ? (
  fn(s, "yy")
)
: (
  fn(s)
)
```

# 2-2. IIFE
- Prefer IIFE over if-else when ternary insufficient
- AVOID excessive IIFE, use simple parentheses when no scope needed
- Use `(() => { })()` only when: isolated scope required, block scoping needed, or mid-execution return
**INCORRECT:**
```javascript
(!r.e) ? (() => {
  const sts = typeof r.s === `number` ? r.s === 0 : true;
  return sts;
})() : (
  false
)
fs.existsSync(o) && (() => {
  fs.rmSync(o, { recursive: true, force: true });
  log(`info`, `foo`);
})();
```
**CORRECT:**
```javascript
!r.e ? (
  typeof r.s === `number` ? r.s === 0 : true
)
: (
  false
)
fs.existsSync(outDir) && (
  fs.rmSync(o, { recursive: true, force: true }),
  log(`info`, `foo`)
)
```

# 2-2. IF/ELSE & TRY/CATCH
- ALWAYS PREFER ternary/IIFE over if-else
- ALL if/else/try/catch MUST use braces with line breaks
- Closing brace and else/catch on SEPARATE lines: `}\nelse {`
**INCORRECT:**
```javascript
if (p1) return res;
if (p2) {
} else { fn(e); }
```
**CORRECT:**
```javascript
if (p1) {
  return res;
}
else {
  fn(e);
}
try {
  fn1();
}
catch (Exception e) {
  fn2();
}
```
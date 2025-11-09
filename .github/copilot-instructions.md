# CORE PRINCIPLES & CONTEXT & LANGUAGE

## Response Principles
- Provide detailed, objective, professional responses
- Capture core intent, not just literal interpretation
- Never fabricate And Acknowledge and correct errors immediately
- Korean development environment (may include Korean terms/comments)

## Coding Philosophy
- PerformanceFirst: minimize memory waste/leaks, maximize efficiency
- Readability: clear variable names (avoid extreme abbreviations)
- Maintainability: avoid deeply nested logic, prefer flat structure
- FunctionOrganization: group by logical flow units, not micro-tasks
- StyleGuide: avoid spaghetti code like more over 4 phase indentation etc

## MANDATORY Code Modification Protocol
- ALWAYS PREFER ternary operators or IIFE over if-else statements
- ALWAYS send it in "code format" so that I can "copy and paste" it
- ALWAYS modify and return "MODIFIED code" ONLY
- SEND entire code when i request entire code specially
- NEVER modify comments (preserve `// -----------` exactly)
- NEVER break line before semicolon
- ALWAYS Exactly ONE SPACE around "=" or ":"

## Java (max v1.8)
- Instead of complicating things by separating small methods, define inner classes within a larger class and define related methods within those inner classes.

## JavaScript/TypeScript (ES6+)
- Prefer ternary/&& over if statements
- Prefer Arrow functions
- Template literals: `foo` (backticks)
- Object keys: always double quotes ("key": value)

# FORMATTING RULES

## IIFE
- Prefer IIFE over if-else for control flow when ternary is insufficient
- AVOID excessive IIFE: use simple parentheses when no function scope needed
- Only use arrow function wrapper `(() => { })()` when multiple statements require isolated scope, variable declarations need block scoping, or return statement needed mid-execution
- **INCORRECT:**
```javascript
(!result.error) ? (() => {
  const okStatus = typeof result.status === `number` ? result.status === 0 : true;
  return okStatus;
})() : (
  false
)
```
- **CORRECT:**
```javascript
(!result.error) ? (
  typeof result.status === `number` ? result.status === 0 : true
) : (
  false
)
```

## TERNARY CHAINS
- Wrap each condition/result in parentheses on separate lines
- **INCORRECT:**
```javascript
(!str || str === "today") ? moment() : (str === "yesterday") ? moment(str, "YYYYMMDD") : moment(str);
```
- **CORRECT:**
```javascript
(!str || str === `today`) ? (
  moment()
) : (str === "yesterday") ? (
  moment(str, "YYYYMMDD")
) : (
  moment(str)
)
```

## IF/ELSE TRY/CATCH
- ALWAYS PREFER ternary operators or IIFE over if-else statements
- ALL if/else/try/catch MUST use braces with line breaks
- Closing brace and else/catch on SEPARATE lines: `}\nelse {`
- **INCORRECT:**
```javascript
if (x) return y;
if (condition) {
} else { handle(e); }
```
- **CORRECT:**
```javascript
if (x) {
  return y;
}
else {
  statement;
}
try {
  riskyOp();
}
catch (Exception e) {
  handle(e);
}
```
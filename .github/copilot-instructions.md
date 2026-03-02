# Jlint — Coding Rules & Agent Instructions

> 모든 코딩 규칙과 에이전트 행동 지침을 이 파일 하나에 담는다.

---

## 1. 핵심 원칙

- **Readability > Performance > Cleverness** — 읽기 쉬운 코드가 최우선
- **SRP** — 하나의 함수는 하나의 일만 수행
- **Fail-fast** — 오류는 빠르게 감지하고 명확한 메시지와 함께 전파
- 명확하고 서술적인 이름 사용 (`request` not `req`)
- 규칙은 **의도**를 설명한다 — 플레이스홀더 이름을 그대로 복사하지 말 것

---

## 2. 포매팅

- NEVER single-line `if/else/try/catch/loop`. ALWAYS braces `{}` + line breaks
- `else`와 `catch`는 반드시 닫는 `}` 다음 **새 줄**에서 시작
- `=`과 `:` 주위에 공백 한 칸 (예외: arrow param defaults `(a=1)=>{}`)
- NEVER pad spaces to vertically align `=` across lines
- Max 4-level nesting — 초과 시 helper 함수로 추출
- Comments: `// 1. name ---- (pad dashes to col 90)`
- 2-space indent, LF line endings, trim trailing whitespace (`.editorconfig` 참조)

```typescript
// ✅ DO
if (isValid) {
  process(data);
}
else {
  handleError();
}

// ❌ DON'T
if (isValid) process(data);
```

---

## 3. 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 소스 파일 | `PascalCase.ts` | `Controller.ts`, `Html.ts` |
| 클래스 | `PascalCase` | `class HtmlFormatter {}` |
| 함수 / 변수 | `camelCase` | `const formatCode = () => {}` |
| 상수 | `UPPER_SNAKE_CASE` | `const MAX_RETRIES = 3` |
| 빌드 스크립트 | `camelCase.mjs` | `swc.mjs`, `fix.mjs` |
| Object keys | always double-quoted | `{ "key": value }` |

---

## 4. Java 규칙

- Java 11 기준
- NEVER return `null`. Use `Optional<T>` or `Collections.emptyList()`
- `Objects.requireNonNull()` for required parameters
- ALWAYS try-with-resources for `AutoCloseable`
- Prefer `final` for fields and local variables; return defensive copies
- Declare by interface: `List<T>` not `ArrayList<T>`
- Prefer Stream API over traditional loops
- No magic values — extract to `private static final` constants
- `StringBuilder` in loops; `String.format()` for complex concat

---

## 5. TypeScript 규칙

### Single Exit Point

```typescript
// ✅ DO: assign to one named variable, return at end
const formatHtml = (code: string): string => {
  const formatted = doFormat(code);
  return formatted;
};

// ❌ DON'T: multiple early returns
const formatHtml = (code: string): string => {
  if (!code) return "";
  return doFormat(code);
};
```

### Ternary Chains

```typescript
// ✅ DO: parentheses + newlines per branch
const label = isError ? (
  "Error"
) : isWarn ? (
  "Warning"
) : (
  "Info"
);
```

### 기타 규칙

- NEVER use `any`. Use `unknown` or define a specific interface
- Prefer `interface` over `type` alias for object shapes
- Prefer arrow functions for callbacks
- IIFE: extract variables first; minimize usage
- Path alias 사용 필수 (`tsconfig.paths.json`):

```typescript
// ✅ DO
import { main } from "@exportCores";

// ❌ DON'T
import { main } from "../../exports/ExportCores";
```

- `require()` 사용 금지 — ESM `import` 사용
- `console.log`/`console.info` 금지 — `console.warn`/`console.error`만 허용
- `object-shorthand: never` — `{ name }` 대신 `{ "name": name }` 사용

---

## 6. SQL/MyBatis 규칙

- SQL 키워드는 대문자: `SELECT`, `FROM`, `WHERE`, `INSERT`, `UPDATE`
- 파라미터 바인딩 시 `#{}` 강제 사용, `${}` 사용 금지 (SQL injection 방지)
- SQL formatter (`sql-formatter`) 적용 규칙 준수

---

## 7. 테스트 규칙

- Given-When-Then 패턴 사용
- 한글 메서드명 허용 (테스트 의도를 명확히 전달)
- `tsconfig.json`에서 `**/*.spec.ts` 제외 — 테스트 파일은 빌드에 포함되지 않음

---

## 8. 에러 핸들링

- NEVER empty catch — always log or rethrow with context
- Catch **specific** exceptions, not generic ones (`Exception`/`Throwable` 금지)
- Fail-fast: 잘못된 입력은 즉시 reject
- 에러 메시지에 context 포함 (어디서, 왜 실패했는지)

```typescript
// ❌ DON'T: empty catch
try {
  riskyOperation();
}
catch (error) {
  // empty
}

// ✅ DO: log or rethrow with context
try {
  riskyOperation();
}
catch (error) {
  console.error("[formatHtml] failed:", error);
  throw error;
}
```

---

## 9. Commit 메시지

Conventional Commits 형식을 따른다:

```
<type>: <short imperative description>

# Examples:
feat: add YAML formatter module
fix: correct indentation for nested JSX
chore: update SWC to 1.15.11
refactor: extract common logic to helper
docs: update architecture.md
```

PR title도 동일한 형식: `<type>: <description>`

---

## 10. 에이전트 행동 규칙

- **Surgical edit** — 요청된 부분만 변경. 관련 없는 코드 수정 금지
- NEVER refactor, reformat, rename unrelated code
- NEVER convert if-else to ternary/IIFE unless asked
- Preserve original style for untouched code
- **ESLint 자동 fix 금지** — lint error를 report만 하고, 승인 없이 auto-fix 하지 말 것
- **빌드 자동 실행 금지** — `npm run build`는 bun 필요, 확인 없이 실행하지 말 것
- `out/` 디렉토리 직접 수정 금지 — `src/`에서 수정 후 rebuild
- `.node/mjs/*.mjs`, `.node/lib/*.mjs`는 upstream 동기화 파일 — 직접 수정 금지
- 명령어 실패 시 대안을 자동 시도하지 말 것 — 실패 메시지를 보고하라

---

## 11. Changes 섹션

작업 완료 후 반드시 **파일별 한 줄 요약**을 포함한다:

```markdown
## Changes
- `.github/copilot-instructions.md` — 코딩 규칙 통합 및 에이전트 지침 추가
- `.github/architecture.md` — 프로젝트 구조 및 빌드 명령어 문서화
```

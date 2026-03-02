# Jlint — Architecture

## 1. 프로젝트 설명

Jlint는 JavaScript, TypeScript, JSX, TSX, Java, JSP, HTML, CSS, JSON, XML, YAML, SQL을
`Alt+Shift+F`로 포맷팅·린트하는 **VS Code 확장 프로그램**이다.

---

## 2. 기술 스택

| 항목 | 값 |
|------|-----|
| **Language** | TypeScript 5.9.3 (ESNext target) |
| **Runtime** | Node.js >=21.0.0 |
| **Framework** | VS Code Extension API (vscode >=1.109.0) |
| **Build** | SWC (`@swc/cli` 0.8.x + `@swc/core` 1.15.11) — `.server.swcrc` 설정 |
| **Type-check** | `tsc --noEmit` (빌드와 별도 실행) |
| **Lint** | ESLint 10.0.0 (flat config) + `@typescript-eslint` 8.54.0 + `@stylistic/eslint-plugin` |
| **Package manager** | bun (primary), npm >=10 (bootstrap) |
| **Formatter deps** | Prettier 3.7.4, prettier-plugin-java, prettier-plugin-jsp, @prettier/plugin-xml, sql-formatter, clean-css, html-minifier-terser, terser |
| **Packaging** | `@vscode/vsce` 3.7.1 |

---

## 3. 디렉토리 구조

```
.
├── src/
│   ├── extension.ts              # VS Code 진입점 (activation)
│   ├── cores/                    # 파이프라인 오케스트레이션
│   │   ├── Main.ts               # 전체 포맷팅 파이프라인 조율
│   │   ├── Controller.ts         # 언어 감지 → 모듈 위임
│   │   └── Contents.ts           # 파일 읽기 및 전처리
│   ├── langs/                    # 언어별 포맷터 모듈
│   │   ├── Javascript.ts         # JS/JSX/TS/TSX
│   │   ├── Java.ts, Jsp.ts       # Java, JSP
│   │   ├── Html.ts, Css.ts       # HTML, CSS
│   │   ├── Json.ts, Xml.ts       # JSON, XML
│   │   ├── Yaml.ts, Sql.ts       # YAML, SQL
│   │   └── ...react.ts           # JSX/TSX 변형
│   ├── rules/                    # 글로벌 후처리 규칙
│   │   ├── Syntax.ts             # 구문 교정
│   │   ├── Logic.ts              # 논리 구분자 및 정리
│   │   └── FinalCheck.ts         # 최종 검증
│   ├── exports/                  # 배럴 re-export (path alias 용)
│   └── assets/
│       ├── scripts/              # logger, notify, modules
│       └── type/domain/          # 프로젝트 타입 정의
├── out/                          # ⚠ SWC 빌드 산출물 (src/에서 수정 후 rebuild)
├── .node/
│   ├── mjs/                      # 빌드/배포 스크립트 (bun 기반)
│   └── lib/                      # 스크립트 공유 유틸리티
├── .github/
│   ├── copilot-instructions.md   # 코딩 규칙 + 에이전트 지침
│   └── architecture.md           # 이 파일
├── eslint.config.mjs             # ESLint flat config
├── tsconfig.json                 # TypeScript 설정 (noEmit)
├── tsconfig.paths.json           # Path alias (@cores/*, @langs/*, @exportCores 등)
├── .server.swcrc                 # SWC 컴파일러 설정
├── package.json                  # 확장 매니페스트 + npm scripts
└── .editorconfig                 # 2-space indent, LF, UTF-8
```

### 아키텍처 패턴: Pipeline-Controller-Module

```
User (Alt+Shift+F) → extension.ts → Main → Controller → langs/* → rules/* → 결과 출력
```

1. **extension.ts** — VS Code 이벤트 캡처, `Main` 호출
2. **Contents** — 줄바꿈/들여쓰기 정규화
3. **Controller** — 언어 감지 → 적절한 `langs/*` 모듈 선택
4. **langs/\*** — 언어별 포맷팅 실행
5. **rules/\*** — Syntax, Logic, FinalCheck 글로벌 규칙 적용
6. 포맷팅된 코드를 에디터에 반영

---

## 4. 빌드/실행 명령어

| 작업 | 명령어 (bun 설치 시) | bun 없이 대체 |
|------|---------------------|--------------|
| **의존성 설치** | `npm install --legacy-peer-deps` | 동일 |
| **빌드** | `npm run build` | `node .node/mjs/swc.mjs --npm --build --server` |
| **Type-check** | `npx tsc --noEmit` | 동일 |
| **Lint** | `npx eslint .` | 동일 |
| **VSIX 패키징** | `npm run vsce` | `node .node/mjs/vsce.mjs --npm --package` |

> ⚠ `npm run build`는 SWC로 트랜스파일만 수행. 타입 체크는 `npx tsc --noEmit`을 별도 실행해야 한다.

---

## 5. 사용 가능한 스크립트

| 스크립트 | 명령어 | 설명 |
|----------|--------|------|
| `sync` | `npm run sync` | upstream JNODE_PRIVATE에서 빌드 스크립트 동기화 |
| `start` | `npm run start` | SWC watch 모드로 개발 서버 시작 |
| `build` | `npm run build` | SWC 빌드 → `out/` 디렉토리에 산출물 생성 |
| `fix` | `npm run fix` | ts-prune 기반 dead-code 정리 (소스 파일 변경됨 — 주의) |
| `reset` | `npm run reset` | 프로젝트 초기화 |
| `vsce` | `npm run vsce` | VSIX 패키지 생성 (`jlint-{version}.vsix`) |
| `git-push-y` | `npm run git-push-y` | git push (확인 있음) |
| `git-push-n` | `npm run git-push-n` | git push (확인 없음) |

### Path Alias 매핑 (`tsconfig.paths.json`)

| Alias | 실제 경로 |
|-------|----------|
| `@cores/*` | `src/cores/*` |
| `@langs/*` | `src/langs/*` |
| `@rules/*` | `src/rules/*` |
| `@scripts/*` | `src/assets/scripts/*` |
| `@type/*` | `src/assets/type/domain/*` |
| `@exportCores` | `src/exports/ExportCores` |
| `@exportLangs` | `src/exports/ExportLangs` |
| `@exportRules` | `src/exports/ExportRules` |
| `@exportScripts` | `src/exports/ExportScripts` |
| `@exportLibs` | `src/exports/ExportLibs` |
| `@exportTypes` | `src/exports/ExportTypes` |

/**
 * @file run-http-loop.mjs
 * @description HTTP 요청 반복 테스트 도구 (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { ui, getFileName } from "./lib/classes.mjs";
import { envPaths } from "./lib/env.mjs";
import { runScript } from "./lib/script-runtime.mjs";

// 1. 전역변수 설정 ---------------------------------------------------------------------------
const outputDir = envPaths.outputDir;
let httpMethod = `GET`;
let httpUrl = ``;
let httpHeaders = {};
let httpBody = ``;
let httpBodyObj = null;
let selectedKey = ``;
let loopValues = [];
let results = [];

const headerPresets = {
  "1": { name: `JSON 기본`, headers: { "Content-Type": `application/json; charset=utf-8` } },
  "2": { name: `Bearer Token`, headers: { "Content-Type": `application/json; charset=utf-8`, "Authorization": `Bearer {TOKEN}` } },
  "3": { name: `API Key`, headers: { "Content-Type": `application/json; charset=utf-8`, "X-API-Key": `{API_KEY}` } },
  "4": { name: `Cookie 인증`, headers: { "Content-Type": `application/json; charset=utf-8`, "Cookie": `{COOKIE}` } },
};

// 2. 유틸 함수 -------------------------------------------------------------------------------

const extractJsonKeys = (obj, prefix = ``) => {
  const keys = [];
  if (obj && typeof obj === `object` && !Array.isArray(obj)) {
    for (const key of Object.keys(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      keys.push({
        path: fullKey,
        type: getValueType(value),
        preview: getValuePreview(value),
      });
      if (value && typeof value === `object` && !Array.isArray(value)) {
        keys.push(...extractJsonKeys(value, fullKey));
      }
    }
  }
  return keys;
};

const getValueType = (value) => {
  if (value === null || value === undefined) return `null`;
  if (Array.isArray(value)) return `array`;
  if (typeof value === `object`) return `object`;
  if (typeof value === `boolean`) return `bool`;
  if (typeof value === `number`) return `number`;
  return `string`;
};

const getValuePreview = (value) => {
  if (value === null || value === undefined) return `null`;
  if (Array.isArray(value)) {
    const cnt = value.length;
    const preview = value.slice(0, 2).map((v) => String(v)).join(`, `);
    const suffix = cnt > 2 ? `...` : ``;
    return `[${preview}${suffix}] (${cnt})`;
  }
  if (typeof value === `object`) return `{...}`;
  const str = String(value);
  return str.length > 40 ? str.substring(0, 40) + `...` : str;
};

const setJsonValue = (original, keyPath, newValue) => {
  const clone = JSON.parse(JSON.stringify(original));
  const keys = keyPath.split(`.`);
  let current = clone;
  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]];
  }
  current[keys[keys.length - 1]] = newValue;
  return clone;
};

const executeRequest = async (method, url, headers, body) => {
  const result = { success: false, statusCode: 0, body: ``, error: ``, elapsed: 0 };

  try {
    const options = { method, headers: { ...headers } };

    if (body && method !== `GET` && method !== `HEAD`) {
      options.body = body;
      if (!options.headers[`Content-Type`]) {
        options.headers[`Content-Type`] = `application/json; charset=utf-8`;
      }
    }

    const start = Date.now();
    const response = await fetch(url, options);
    result.elapsed = Date.now() - start;
    result.statusCode = response.status;
    result.body = await response.text();
    result.success = response.ok;
  }
  catch (error) {
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
};

const parseInputValues = (input) => {
  const values = [];
  const parts = input.split(/[,\r\n]+/);

  for (const p of parts) {
    const trimmed = p.trim();
    if (!trimmed) continue;

    if (/^-?\d+$/.test(trimmed)) {
      values.push(Number(trimmed));
    }
    else if (trimmed === `true`) {
      values.push(true);
    }
    else if (trimmed === `false`) {
      values.push(false);
    }
    else if (trimmed === `null`) {
      values.push(null);
    }
    else {
      values.push(trimmed);
    }
  }
  return values;
};

const formatResultsTable = (resultList) => {
  const lines = [];
  lines.push(`| # | Value | Status | Time(ms) | Response |`);
  lines.push(`|---|-------|--------|----------|----------|`);

  let idx = 1;
  for (const r of resultList) {
    const valStr = String(r.inputValue);
    const valPreview = valStr.length > 20 ? valStr.substring(0, 20) + `...` : valStr;
    const status = r.success ? `✅ ${r.statusCode}` : `❌ ${r.statusCode}`;
    let respPreview = r.body.length > 30 ? r.body.substring(0, 30) + `...` : r.body;
    respPreview = respPreview.replace(/\r?\n/g, ` `);
    lines.push(`| ${idx} | ${valPreview} | ${status} | ${r.elapsed} | ${respPreview} |`);
    idx++;
  }
  return lines.join(`\n`);
};

const prettyJson = (json) => {
  try {
    return JSON.stringify(JSON.parse(json), null, 2);
  }
  catch {
    return json;
  }
};

const formatTimestamp = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, `0`);
  const d = String(now.getDate()).padStart(2, `0`);
  const h = String(now.getHours()).padStart(2, `0`);
  const mi = String(now.getMinutes()).padStart(2, `0`);
  const s = String(now.getSeconds()).padStart(2, `0`);
  return `${y}${m}${d}_${h}${mi}${s}`;
};

// 3. HTTP 루프 실행 ---------------------------------------------------------------------------

const selectMethod = async () => {
  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ HTTP 메서드 선택`);
  ui.printText(`White`, `  1. GET`);
  ui.printText(`White`, `  2. POST`);
  ui.printText(`White`, `  3. PUT`);
  ui.printText(`White`, `  4. PATCH`);
  ui.printText(`White`, `  5. DELETE`);
  ui.printEmpty();

  const input = await ui.textInput(`Green`, `▶ 번호 선택 (기본=2 POST):`);
  const methods = { "1": `GET`, "2": `POST`, "3": `PUT`, "4": `PATCH`, "5": `DELETE` };
  httpMethod = !input ? `POST` : (methods[input] || `POST`);
  ui.printText(`Green`, `▶ 선택: ${httpMethod}`);
};

const inputUrl = async () => {
  ui.printLine(`Cyan`);
  const input = await ui.textInput(`Green`, `▶ URL 입력:`);

  if (!input) {
    ui.printText(`Red`, `! URL은 필수입니다.`);
    await ui.printContinue(getFileName());
  }

  httpUrl = input.trim();
  ui.printText(`Green`, `▶ URL: ${httpUrl}`);
};

const configureHeaders = async () => {
  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ 헤더 프리셋 선택`);

  for (const key of Object.keys(headerPresets).sort()) {
    ui.printText(`White`, `  ${key}. ${headerPresets[key].name}`);
  }
  ui.printText(`White`, `  5. 직접 입력`);
  ui.printText(`White`, `  0. 헤더 없음`);
  ui.printEmpty();

  const input = await ui.textInput(`Green`, `▶ 번호 선택 (기본=1):`);
  const choice = !input ? `1` : input;

  if (choice === `0`) {
    httpHeaders = {};
    ui.printText(`Yellow`, `▶ 헤더 없음`);
    return;
  }

  if (choice === `5`) {
    await inputCustomHeaders();
    return;
  }

  if (headerPresets[choice]) {
    httpHeaders = { ...headerPresets[choice].headers };

    // 플레이스홀더 치환
    for (const key of Object.keys(httpHeaders)) {
      const val = httpHeaders[key];
      const match = val.match(/\{(.+)\}/);
      if (match) {
        const placeholder = match[1];
        const replacement = await ui.textInput(`Yellow`, `  ▶ ${placeholder} 값 입력:`);
        httpHeaders[key] = val.replace(`{${placeholder}}`, replacement);
      }
    }

    ui.printText(`Green`, `▶ 헤더 설정 완료:`);
    for (const [k, v] of Object.entries(httpHeaders)) {
      const preview = v.length > 50 ? v.substring(0, 50) + `...` : v;
      ui.printText(`White`, `  - ${k}: ${preview}`);
    }
  }
  else {
    httpHeaders = { ...headerPresets[`1`].headers };
    ui.printText(`Green`, `▶ 기본 JSON 헤더 적용`);
  }
};

const inputCustomHeaders = async () => {
  ui.printText(`Cyan`, `▶ 커스텀 헤더 입력 (빈 줄 입력 시 종료)`);
  ui.printText(`White`, `  형식: Header-Name: Header-Value`);
  ui.printEmpty();

  httpHeaders = {};

  while (true) {
    const input = await ui.textInput(`White`, `  >`);
    if (!input) break;

    const match = input.match(/^([^:]+):\s*(.+)$/);
    if (match) {
      httpHeaders[match[1].trim()] = match[2].trim();
    }
    else {
      ui.printText(`Yellow`, `  ! 잘못된 형식, 다시 입력`);
    }
  }

  ui.printText(`Green`, `▶ 헤더 ${Object.keys(httpHeaders).length}개 설정됨`);
};

const inputBody = async () => {
  if (httpMethod === `GET`) {
    ui.printLine(`Yellow`);
    ui.printText(`Yellow`, `▶ GET 요청은 Body를 사용하지 않습니다.`);
    httpBody = ``;
    httpBodyObj = null;
    return;
  }

  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ JSON Body 입력`);
  ui.printText(`White`, `  - 여러 줄 입력 가능`);
  ui.printText(`White`, `  - 빈 줄 2번 연속 입력 시 종료`);
  ui.printText(`White`, `  - 'file:경로' 입력 시 파일에서 로드`);
  ui.printEmpty();

  const lines = [];
  let emptyCount = 0;

  while (true) {
    const input = await ui.textInput(`White`, `  >`);

    if (!input) {
      emptyCount++;
      if (emptyCount >= 2) break;
      lines.push(``);
      continue;
    }

    emptyCount = 0;

    // 파일 로드
    const fileMatch = input.match(/^file:(.+)$/);
    if (fileMatch) {
      const filePath = fileMatch[1].trim();
      if (fs.existsSync(filePath)) {
        httpBody = fs.readFileSync(filePath, `utf8`);
        ui.printText(`Green`, `  ▶ 파일에서 로드됨: ${filePath}`);
        break;
      }
      else {
        ui.printText(`Red`, `  ! 파일을 찾을 수 없음: ${filePath}`);
        continue;
      }
    }

    lines.push(input);
  }

  if (!httpBody) {
    httpBody = lines.join(`\n`).trim();
  }

  if (!httpBody) {
    ui.printText(`Yellow`, `▶ Body 없음`);
    httpBodyObj = null;
    return;
  }

  // JSON 파싱 검증
  try {
    httpBodyObj = JSON.parse(httpBody);
    ui.printText(`Green`, `▶ JSON 파싱 성공`);
  }
  catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    ui.printText(`Red`, `! JSON 파싱 실패: ${errMsg}`);
    ui.printText(`Red`, `! 유효한 JSON을 입력해주세요.`);
    await ui.printContinue(getFileName());
  }
};

const selectMode = async () => {
  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ 실행 모드 선택`);
  ui.printText(`White`, `  1. 단일 실행 (1회)`);
  ui.printText(`White`, `  2. 루프 실행 (특정 키 값 변경하며 반복)`);
  ui.printEmpty();

  const input = await ui.textInput(`Green`, `▶ 번호 선택:`);

  if (input === `1`) {
    await executeSingle();
  }
  else {
    await configureLoop();
  }
};

const executeSingle = async () => {
  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ 요청 실행 중...`);

  const result = await executeRequest(httpMethod, httpUrl, httpHeaders, httpBody);

  ui.printLine(`Green`);
  const statusColor = result.success ? `Green` : `Red`;
  ui.printText(statusColor, `▶ Status: ${result.statusCode}`);
  ui.printText(`Cyan`, `▶ Time: ${result.elapsed}ms`);
  ui.printEmpty();

  if (result.error) {
    ui.printText(`Red`, `▶ Error: ${result.error}`);
  }

  ui.printText(`Cyan`, `▶ Response:`);
  console.log(prettyJson(result.body));

  // 결과 저장 여부
  ui.printEmpty();
  const save = await ui.textInput(`Yellow`, `▶ 결과 저장? (y/n):`);

  if (save === `y`) {
    saveSingleResult(result);
  }
};

const configureLoop = async () => {
  if (!httpBodyObj) {
    ui.printText(`Red`, `! 루프 실행은 JSON Body가 필요합니다.`);
    await ui.printContinue(getFileName());
  }

  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ JSON Body 키 목록:`);
  ui.printEmpty();

  const keys = extractJsonKeys(httpBodyObj);
  const keyMap = {};
  let idx = 1;

  for (const k of keys) {
    keyMap[String(idx)] = k.path;
    ui.printText(`White`, `  ${String(idx).padStart(2)}. [${k.type.padEnd(7)}] ${k.path} = ${k.preview}`);
    idx++;
  }

  ui.printEmpty();
  const input = await ui.textInput(`Green`, `▶ 변경할 키 번호 선택:`);

  if (!keyMap[input]) {
    ui.printText(`Red`, `! 유효한 번호를 선택해주세요.`);
    await ui.printContinue(getFileName());
  }

  selectedKey = keyMap[input];
  ui.printText(`Green`, `▶ 선택된 키: ${selectedKey}`);

  // 루프 값 입력
  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ 반복할 값 입력`);
  ui.printText(`White`, `  - 쉼표(,) 또는 줄바꿈으로 구분`);
  ui.printText(`White`, `  - 빈 줄 2번 연속 입력 시 종료`);
  ui.printEmpty();

  const lines = [];
  let emptyCount = 0;

  while (true) {
    const valInput = await ui.textInput(`White`, `  >`);

    if (!valInput) {
      emptyCount++;
      if (emptyCount >= 2) break;
      continue;
    }

    emptyCount = 0;
    lines.push(valInput);
  }

  loopValues = parseInputValues(lines.join(`,`));

  if (loopValues.length === 0) {
    ui.printText(`Red`, `! 최소 1개의 값이 필요합니다.`);
    await ui.printContinue(getFileName());
  }

  ui.printText(`Green`, `▶ 입력된 값 ${loopValues.length}개:`);
  for (const v of loopValues) {
    ui.printText(`White`, `  - ${v}`);
  }

  await executeLoop();
};

const executeLoop = async () => {
  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ 루프 실행 시작 (${loopValues.length}건)`);
  ui.printEmpty();

  results = [];
  let idx = 1;
  const total = loopValues.length;

  for (const val of loopValues) {
    ui.printText(`White`, `  [${idx}/${total}] ${selectedKey} = ${val}`);

    const modifiedBody = setJsonValue(httpBodyObj, selectedKey, val);
    const bodyJson = JSON.stringify(modifiedBody);

    const result = await executeRequest(httpMethod, httpUrl, httpHeaders, bodyJson);
    result.inputValue = val;
    result.inputKey = selectedKey;
    results.push(result);

    const statusIcon = result.success ? `✅` : `❌`;
    const color = result.success ? `Green` : `Red`;
    ui.printText(color, `    ${statusIcon} ${result.statusCode} (${result.elapsed}ms)`);

    idx++;
    await new Promise((r) => setTimeout(r, 100));
  }

  await showLoopResults();
};

const showLoopResults = async () => {
  ui.printLine(`Green`);
  ui.printText(`Green`, `▶ 실행 완료!`);
  ui.printEmpty();

  // 통계
  const success = results.filter((r) => r.success).length;
  const fail = results.length - success;
  const avgTime = Math.round(results.reduce((sum, r) => sum + r.elapsed, 0) / results.length);

  ui.printText(`Cyan`, `▶ 통계:`);
  ui.printText(`White`, `  - 총 요청: ${results.length}건`);
  ui.printText(`Green`, `  - 성공: ${success}건`);
  ui.printText(`Red`, `  - 실패: ${fail}건`);
  ui.printText(`White`, `  - 평균 응답시간: ${avgTime}ms`);

  // 결과 테이블
  ui.printLine(`Cyan`);
  ui.printText(`Cyan`, `▶ 결과 상세:`);
  ui.printEmpty();
  console.log(formatResultsTable(results));

  // 저장 여부
  ui.printEmpty();
  const save = await ui.textInput(`Yellow`, `▶ 결과 저장? (y/n):`);

  if (save === `y`) {
    saveLoopResults();
  }

  // 개별 응답 조회
  ui.printEmpty();
  let view = await ui.textInput(`Yellow`, `▶ 개별 응답 조회? (번호 입력, 종료=엔터):`);

  while (view) {
    const num = Number(view);
    if (!isNaN(num) && num >= 1 && num <= results.length) {
      const r = results[num - 1];
      ui.printLine(`Cyan`);
      ui.printText(`Cyan`, `▶ [${num}] ${selectedKey} = ${r.inputValue}`);
      ui.printText(`White`, `  Status: ${r.statusCode} | Time: ${r.elapsed}ms`);
      ui.printEmpty();
      console.log(prettyJson(r.body));
    }
    else {
      ui.printText(`Red`, `! 유효한 번호를 입력하세요 (1-${results.length})`);
    }

    view = await ui.textInput(`Yellow`, `▶ 다른 응답 조회? (번호 입력, 종료=엔터):`);
  }
};

const saveSingleResult = (result) => {
  const timestamp = formatTimestamp();
  const fileName = `api-result-${timestamp}.json`;
  const filePath = path.join(outputDir, fileName);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const output = {
    timestamp: getCurrentTime(),
    request: {
      method: httpMethod,
      url: httpUrl,
      headers: httpHeaders,
      body: httpBodyObj,
    },
    response: {
      statusCode: result.statusCode,
      elapsed: result.elapsed,
      body: result.body,
      error: result.error,
    },
  };

  fs.writeFileSync(filePath, JSON.stringify(output, null, 2), `utf8`);
  ui.printText(`Green`, `▶ 저장 완료: ${filePath}`);
};

const saveLoopResults = () => {
  const timestamp = formatTimestamp();
  const fileName = `api-loop-result-${timestamp}.json`;
  const filePath = path.join(outputDir, fileName);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const success = results.filter((r) => r.success).length;
  const fail = results.filter((r) => !r.success).length;
  const avgTime = Math.round(results.reduce((sum, r) => sum + r.elapsed, 0) / results.length);

  const output = {
    timestamp: getCurrentTime(),
    request: {
      method: httpMethod,
      url: httpUrl,
      headers: httpHeaders,
      bodyTemplate: httpBodyObj,
    },
    loop: {
      key: selectedKey,
      values: loopValues,
    },
    summary: {
      total: results.length,
      success,
      fail,
      avgTime,
    },
    results: results.map((r) => ({
      inputValue: r.inputValue,
      statusCode: r.statusCode,
      elapsed: r.elapsed,
      success: r.success,
      body: r.body,
      error: r.error,
    })),
  };

  fs.writeFileSync(filePath, JSON.stringify(output, null, 2), `utf8`);
  ui.printText(`Green`, `▶ 저장 완료: ${filePath}`);
};

// 99. 실행 ----------------------------------------------------------------------------------
const executeScript = async () => {
  ui.printStart();
  await selectMethod();
  await inputUrl();
  await configureHeaders();
  await inputBody();
  await selectMode();
  await ui.printContinue(getFileName());
};

await runScript(import.meta.url, executeScript);

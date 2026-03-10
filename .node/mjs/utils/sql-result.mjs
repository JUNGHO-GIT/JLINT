/**
 * @file sql-result.mjs
 * @description MYSQL 쿼리 코스트 및 성능 종합 분석
 * @author Jungho
 * @since 2025-12-10 (Refactored for Analysis Accuracy and Safety)
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createConnection } from "mysql2/promise";
import { envKorpay } from "../../../../private/node/lib/env.2.mjs";
import { logger } from "../../lib/utils.mjs";

// 0. 상수 -----------------------------------------------------------------------------------------------
const mysql2Tooling = envKorpay?.mysql2 || {};
const CONNECTION_URI_ENV_KEY = mysql2Tooling.connectionUriEnvKey || `MYSQL2_CONNECTION_URI`;
const CONNECTION_URI = String(process.env[CONNECTION_URI_ENV_KEY] || mysql2Tooling.connectionUri || ``).trim();
const EXIT_CODE_SUCCESS = 0;
const EXIT_CODE_ERROR = 1;
const DISPLAY_LIMIT = 1;
const DEFAULT_TERM_WIDTH = 120;
const MAX_COMPACT_PREVIEW = 20;
const MAX_LONG_VALUE_PREVIEW = 50;
const EXPLAIN_PREFIX_PATTERN = /^\s*explain\s+(?:format\s*=\s*json\s+|analyze\s+)?/i;
const ANALYZE_SUPPORT_TEST_SQL = `EXPLAIN ANALYZE SELECT 1`;
const READ_ONLY_TYPES = new Set([ `SELECT`, `WITH_SELECT` ]);

// 0-1. 색상 코드 -----------------------------------------------------------------------------------------
const C = {
  reset: `\u001B[0m`,
  bold: `\u001B[1m`,
  dim: `\u001B[2m`,
  cyan: `\u001B[36m`,
  yellow: `\u001B[33m`,
  green: `\u001B[32m`,
  red: `\u001B[31m`,
  gray: `\u001B[90m`,
  white: `\u001B[37m`,
};

// 1. 공통 유틸 -------------------------------------------------------------------------------------------
const toErrorMessage = (error) => {
  let message = ``;

  message = error instanceof Error ? error.message : String(error ?? `알 수 없는 오류`);

  return message;
};

const toFiniteNumber = (value) => {
  let result = null;
  const parsed = Number(value);

  if (Number.isFinite(parsed)) {
    result = parsed;
  }

  return result;
};

const clampNumber = (value, min, max) => {
  let clamped = value;

  if (clamped < min) {
    clamped = min;
  }
  else if (clamped > max) {
    clamped = max;
  }

  return clamped;
};

const formatNumber = (value) => {
  let result = `-`;

  if (typeof value === `number` && Number.isFinite(value)) {
    result = value.toLocaleString(`ko-KR`, {
      maximumFractionDigits: 2,
    });
  }

  return result;
};

const stringifyValue = (value) => {
  let result = ``;

  if (typeof value === `string`) {
    result = value;
  }
  else if (value === null || value === undefined) {
    result = ``;
  }
  else {
    result = String(value);
  }

  return result;
};

const getObjectValues = (row) => {
  let values = [];

  if (row && typeof row === `object`) {
    values = Object.values(row);
  }

  return values;
};

const getFirstRowExplainText = (rows) => {
  let explainText = null;

  if (Array.isArray(rows) && rows.length > 0) {
    const firstRow = rows[0];

    if (firstRow && typeof firstRow === `object`) {
      if (typeof firstRow.EXPLAIN === `string`) {
        explainText = firstRow.EXPLAIN;
      }
      else {
        const values = getObjectValues(firstRow);
        const candidate = values[0];

        if (typeof candidate === `string`) {
          explainText = candidate;
        }
      }
    }
  }

  return explainText;
};

// 2. SQL 입력/정규화 --------------------------------------------------------------------------------------
const getSqlFromFile = (filePath) => {
  let result = ``;
  const absPath = resolve(process.cwd(), filePath || ``);

  if (!filePath || !existsSync(absPath)) {
    throw new Error(`SQL 파일을 찾을 수 없습니다. 경로를 확인하세요. (입력 경로: '${filePath}')`);
  }
  else {
    result = readFileSync(absPath, `utf8`).trim();

    if (!result) {
      throw new Error(`SQL 파일에 내용이 없습니다. 파일을 확인하세요. (경로: '${absPath}')`);
    }
  }

  return result;
};

const normalizeSqlInput = (rawSql) => {
  const normalization = {
    ok: false,
    sql: ``,
    message: ``,
    removedExplainPrefix: false,
    removedTrailingSemicolon: false,
  };
  let normalizedSql = stringifyValue(rawSql);
  let loopCount = 0;
  let continueLoop = true;

  normalizedSql = normalizedSql.replace(/^\uFEFF/, ``);
  normalizedSql = normalizedSql.trim();

  while (normalizedSql.endsWith(`;`)) {
    normalization.removedTrailingSemicolon = true;
    normalizedSql = normalizedSql.slice(0, -1).trim();
  }

  while (continueLoop) {
    const before = normalizedSql;

    if (EXPLAIN_PREFIX_PATTERN.test(normalizedSql)) {
      normalizedSql = normalizedSql.replace(EXPLAIN_PREFIX_PATTERN, ``).trim();
      normalization.removedExplainPrefix = true;
    }

    loopCount += 1;

    if (before === normalizedSql || loopCount >= 10) {
      continueLoop = false;
    }
  }

  if (!normalizedSql) {
    normalization.ok = false;
    normalization.message = `정규화 후 SQL이 비어 있습니다. 입력 내용을 확인하세요.`;
  }
  else {
    normalization.ok = true;
    normalization.sql = normalizedSql;
  }

  return normalization;
};

// 3. SQL 토큰화/검증/분류 ---------------------------------------------------------------------------------
const isWhitespaceChar = (char) => {
  let result = false;

  if (/\s/.test(char)) {
    result = true;
  }

  return result;
};

const isWordStartChar = (char) => {
  let result = false;

  if (/[A-Z_a-z]/.test(char)) {
    result = true;
  }

  return result;
};

const isWordChar = (char) => {
  let result = false;

  if (/[\w$]/.test(char)) {
    result = true;
  }

  return result;
};

const isDashCommentStart = (sql, index) => {
  let result = false;
  const current = sql[index] || ``;
  const next = sql[index + 1] || ``;
  const nextNext = sql[index + 2] || ` `;

  if (current === `-` && next === `-` && /\s/.test(nextNext)) {
    result = true;
  }

  return result;
};

const skipQuotedString = (sql, startIndex, quoteChar) => {
  let index = startIndex + 1;
  let closed = false;

  while (index < sql.length && !closed) {
    const current = sql[index];
    const next = sql[index + 1] || ``;

    if (current === `\\`) {
      index += 2;
    }
    else if (current === quoteChar) {
      if (next === quoteChar) {
        index += 2;
      }
      else {
        index += 1;
        closed = true;
      }
    }
    else {
      index += 1;
    }
  }

  return index;
};

const readBacktickIdentifier = (sql, startIndex) => {
  let index = startIndex + 1;
  let closed = false;
  let identifier = ``;

  while (index < sql.length && !closed) {
    const current = sql[index];
    const next = sql[index + 1] || ``;

    if (current === "`") {
      if (next === "`") {
        identifier += "`";
        index += 2;
      }
      else {
        index += 1;
        closed = true;
      }
    }
    else {
      identifier += current;
      index += 1;
    }
  }

  return {
    nextIndex: index,
    identifier: identifier,
  };
};

const tokenizeSql = (sql) => {
  const tokens = [];
  let index = 0;
  let parenDepth = 0;

  while (index < sql.length) {
    const current = sql[index];
    const next = sql[index + 1] || ``;

    if (isWhitespaceChar(current)) {
      index += 1;
    }
    else if (isDashCommentStart(sql, index)) {
      index += 2;

      while (index < sql.length && sql[index] !== `\n`) {
        index += 1;
      }
    }
    else if (current === `#`) {
      index += 1;

      while (index < sql.length && sql[index] !== `\n`) {
        index += 1;
      }
    }
    else if (current === `/` && next === `*`) {
      index += 2;

      while (index < sql.length) {
        const blockCurrent = sql[index];
        const blockNext = sql[index + 1] || ``;

        if (blockCurrent === `*` && blockNext === `/`) {
          index += 2;
          break;
        }
        else {
          index += 1;
        }
      }
    }
    else if (current === `'` || current === `"`) {
      index = skipQuotedString(sql, index, current);
    }
    else if (current === "`") {
      const backtickInfo = readBacktickIdentifier(sql, index);
      const identifier = backtickInfo.identifier.trim();

      if (identifier) {
        tokens.push({
          type: `word`,
          value: identifier,
          upper: identifier.toUpperCase(),
          depth: parenDepth,
          index: index,
        });
      }

      index = backtickInfo.nextIndex;
    }
    else if (isWordStartChar(current)) {
      const start = index;
      let word = current;
      index += 1;

      while (index < sql.length && isWordChar(sql[index])) {
        word += sql[index];
        index += 1;
      }

      tokens.push({
        type: `word`,
        value: word,
        upper: word.toUpperCase(),
        depth: parenDepth,
        index: start,
      });
    }
    else if (current === `(`) {
      tokens.push({
        type: `symbol`,
        value: current,
        depth: parenDepth,
        index: index,
      });
      parenDepth += 1;
      index += 1;
    }
    else if (current === `)`) {
      if (parenDepth > 0) {
        parenDepth -= 1;
      }

      tokens.push({
        type: `symbol`,
        value: current,
        depth: parenDepth,
        index: index,
      });
      index += 1;
    }
    else if (current === `,` || current === `;`) {
      tokens.push({
        type: `symbol`,
        value: current,
        depth: parenDepth,
        index: index,
      });
      index += 1;
    }
    else {
      index += 1;
    }
  }

  return tokens;
};

const validateSingleStatement = (sql, tokens) => {
  const validation = {
    ok: false,
    message: ``,
    tokens: tokens,
  };
  let hasTopLevelSemicolon = false;
  let hasWordToken = false;

  if (!sql) {
    validation.ok = false;
    validation.message = `분석할 SQL이 없습니다.`;
  }
  else {
    for (const token of tokens) {
      if (token.type === `word`) {
        hasWordToken = true;
      }

      if (token.type === `symbol` && token.value === `;` && token.depth === 0) {
        hasTopLevelSemicolon = true;
      }
    }

    if (!hasWordToken) {
      validation.ok = false;
      validation.message = `SQL 토큰을 인식하지 못했습니다. 주석/문자열만 포함된 입력일 수 있습니다.`;
    }
    else if (hasTopLevelSemicolon) {
      validation.ok = false;
      validation.message = `다중 SQL 문장은 지원하지 않습니다. 단일 문장만 입력하세요.`;
    }
    else {
      validation.ok = true;
    }
  }

  return validation;
};

const findNextWordTokenIndex = (tokens, startIndex) => {
  let foundIndex = -1;

  for (let index = startIndex; index < tokens.length; index += 1) {
    if (tokens[index].type === `word`) {
      foundIndex = index;
      break;
    }
  }

  return foundIndex;
};

const consumeBalancedParentheses = (tokens, startIndex) => {
  const consumeResult = {
    ok: false,
    nextIndex: startIndex,
    message: ``,
  };
  let index = startIndex;
  let balance = 0;

  if (tokens[index]?.type === `symbol` && tokens[index]?.value === `(`) {
    balance = 1;
    index += 1;

    while (index < tokens.length && balance > 0) {
      const token = tokens[index];

      if (token.type === `symbol` && token.value === `(`) {
        balance += 1;
      }
      else if (token.type === `symbol` && token.value === `)`) {
        balance -= 1;
      }

      index += 1;
    }

    if (balance === 0) {
      consumeResult.ok = true;
      consumeResult.nextIndex = index;
    }
    else {
      consumeResult.ok = false;
      consumeResult.message = `괄호 짝이 맞지 않아 WITH CTE를 판별할 수 없습니다.`;
    }
  }
  else {
    consumeResult.ok = false;
    consumeResult.message = `WITH CTE 구문에서 여는 괄호를 찾지 못했습니다.`;
  }

  return consumeResult;
};

const resolveWithMainStatement = (tokens, withIndex) => {
  const resolution = {
    ok: false,
    mainKeyword: `UNKNOWN`,
    message: ``,
  };
  let index = withIndex + 1;
  let parseFailed = false;
  let parseMessage = ``;
  let cteLoop = true;

  if (tokens[index]?.type === `word` && tokens[index].upper === `RECURSIVE`) {
    index += 1;
  }

  while (cteLoop && !parseFailed) {
    const cteNameIndex = findNextWordTokenIndex(tokens, index);

    if (cteNameIndex < 0) {
      parseFailed = true;
      parseMessage = `WITH CTE 이름을 찾지 못했습니다.`;
    }
    else {
      index = cteNameIndex + 1;

      if (tokens[index]?.type === `symbol` && tokens[index]?.value === `(`) {
        const columnsConsume = consumeBalancedParentheses(tokens, index);

        if (columnsConsume.ok) {
          index = columnsConsume.nextIndex;
        }
        else {
          parseFailed = true;
          parseMessage = columnsConsume.message;
        }
      }

      if (!parseFailed) {
        if (tokens[index]?.type === `word` && tokens[index]?.upper === `AS`) {
          index += 1;
        }
        else {
          parseFailed = true;
          parseMessage = `WITH CTE에서 AS 키워드를 찾지 못했습니다.`;
        }
      }

      if (!parseFailed) {
        const cteBodyConsume = consumeBalancedParentheses(tokens, index);

        if (cteBodyConsume.ok) {
          index = cteBodyConsume.nextIndex;
        }
        else {
          parseFailed = true;
          parseMessage = cteBodyConsume.message;
        }
      }

      if (!parseFailed) {
        if (tokens[index]?.type === `symbol` && tokens[index]?.value === `,`) {
          index += 1;
        }
        else {
          cteLoop = false;
        }
      }
    }
  }

  if (parseFailed) {
    resolution.ok = false;
    resolution.message = parseMessage;
  }
  else {
    const mainIndex = findNextWordTokenIndex(tokens, index);

    if (mainIndex >= 0) {
      resolution.ok = true;
      resolution.mainKeyword = tokens[mainIndex].upper;
    }
    else {
      resolution.ok = false;
      resolution.message = `WITH 뒤의 본문 SQL 키워드를 찾지 못했습니다.`;
    }
  }

  return resolution;
};

const classifyStatement = (sql, tokens) => {
  const profile = {
    statementType: `UNKNOWN`,
    isReadOnly: false,
    isExplainable: false,
    reason: `문장 유형을 판별하지 못했습니다. 안전을 위해 자동 실행을 차단합니다.`,
    leadingKeyword: `UNKNOWN`,
    mainKeyword: `UNKNOWN`,
  };
  const firstWordIndex = findNextWordTokenIndex(tokens, 0);

  if (firstWordIndex >= 0) {
    const firstKeyword = tokens[firstWordIndex].upper;
    let resolvedKeyword = firstKeyword;
    let withResolution = null;

    profile.leadingKeyword = firstKeyword;

    if (firstKeyword === `WITH`) {
      withResolution = resolveWithMainStatement(tokens, firstWordIndex);

      if (withResolution.ok) {
        resolvedKeyword = withResolution.mainKeyword;
      }
      else {
        resolvedKeyword = `UNKNOWN`;
        profile.reason = `WITH 문장 판별 실패: ${withResolution.message} (안전 우선으로 자동 실행 차단)`;
      }
    }

    profile.mainKeyword = resolvedKeyword;

    if (resolvedKeyword === `SELECT`) {
      if (firstKeyword === `WITH`) {
        profile.statementType = `WITH_SELECT`;
        profile.reason = `WITH 절을 포함한 SELECT로 판별되어 읽기 전용 자동 실행 대상입니다.`;
      }
      else {
        profile.statementType = `SELECT`;
        profile.reason = `SELECT 문으로 판별되어 읽기 전용 자동 실행 대상입니다.`;
      }

      profile.isReadOnly = true;
      profile.isExplainable = true;
    }
    else if (resolvedKeyword === `UPDATE`) {
      profile.statementType = `UPDATE`;
      profile.isReadOnly = false;
      profile.isExplainable = true;
      profile.reason = `UPDATE 문으로 판별되어 자동 실행을 차단합니다 (분석은 가능).`;
    }
    else if (resolvedKeyword === `DELETE`) {
      profile.statementType = `DELETE`;
      profile.isReadOnly = false;
      profile.isExplainable = true;
      profile.reason = `DELETE 문으로 판별되어 자동 실행을 차단합니다 (분석은 가능).`;
    }
    else if (resolvedKeyword === `INSERT`) {
      profile.statementType = `INSERT`;
      profile.isReadOnly = false;
      profile.isExplainable = true;
      profile.reason = `INSERT 문으로 판별되어 자동 실행을 차단합니다 (분석은 가능).`;
    }
    else if (resolvedKeyword === `REPLACE`) {
      profile.statementType = `REPLACE`;
      profile.isReadOnly = false;
      profile.isExplainable = true;
      profile.reason = `REPLACE 문으로 판별되어 자동 실행을 차단합니다 (분석은 가능).`;
    }
    else if (resolvedKeyword === `WITH`) {
      profile.statementType = `WITH`;
      profile.isReadOnly = false;
      profile.isExplainable = false;
      profile.reason = `WITH 본문 키워드를 판별하지 못해 자동 실행 및 분석을 보수적으로 제한합니다.`;
    }
    else if ([ `EXPLAIN`, `SHOW`, `DESCRIBE`, `DESC` ].includes(resolvedKeyword)) {
      profile.statementType = resolvedKeyword;
      profile.isReadOnly = false;
      profile.isExplainable = false;
      profile.reason = `입력 SQL은 분석 대상이 아닌 진단/메타 명령으로 판별됩니다.`;
    }
    else {
      profile.statementType = resolvedKeyword;
      profile.isReadOnly = false;
      profile.isExplainable = false;
      profile.reason = `${resolvedKeyword} 문은 자동 실행 및 EXPLAIN 분석을 수행하지 않습니다.`;
    }
  }
  else {
    profile.reason = `SQL에서 유효한 키워드를 찾지 못했습니다.`;
  }

  return profile;
};

const getExecutionPolicy = (statementProfile) => {
  const policy = {
    shouldExecute: false,
    mode: `skip`,
    reason: `자동 실행 조건을 만족하지 않습니다.`,
  };

  if (READ_ONLY_TYPES.has(statementProfile.statementType) && statementProfile.isReadOnly) {
    policy.shouldExecute = true;
    policy.mode = `auto_execute`;
    policy.reason = `읽기 전용 쿼리로 판별되어 자동 실행합니다.`;
  }
  else {
    policy.shouldExecute = false;
    policy.mode = `skip`;
    policy.reason = statementProfile.reason;
  }

  return policy;
};

// 4. EXPLAIN 분석 엔진 ------------------------------------------------------------------------------------
const detectAnalyzeCapability = async (conn) => {
  const capability = {
    checked: true,
    supported: false,
    status: `unsupported`,
    message: `EXPLAIN ANALYZE 미지원 또는 권한 제한`,
  };

  try {
    await conn.query(ANALYZE_SUPPORT_TEST_SQL);
    capability.supported = true;
    capability.status = `supported`;
    capability.message = `EXPLAIN ANALYZE 지원 확인`;
  }
  catch (error) {
    capability.supported = false;
    capability.status = `unsupported`;
    capability.message = `EXPLAIN ANALYZE 폴백: ${toErrorMessage(error)}`;
    logger(`warn`, capability.message);
  }

  return capability;
};

const buildExplainQueries = (sql, statementProfile, analyzeCapability) => {
  const explainQueries = {
    json: `EXPLAIN FORMAT=JSON\n${sql}`,
    analyze: null,
  };

  if (statementProfile.isReadOnly && analyzeCapability.supported) {
    explainQueries.analyze = `EXPLAIN ANALYZE\n${sql}`;
  }

  return explainQueries;
};

const runExplainJson = async (conn, explainSql) => {
  const explainResult = {
    ok: false,
    status: `error`,
    message: `EXPLAIN JSON 분석을 수행하지 못했습니다.`,
    rawJson: null,
    parsedPlan: null,
  };

  try {
    const [rows] = await conn.query(explainSql);
    const explainText = getFirstRowExplainText(rows);

    if (typeof explainText === `string` && explainText.trim()) {
      explainResult.rawJson = explainText;

      try {
        explainResult.parsedPlan = JSON.parse(explainText);
        explainResult.ok = true;
        explainResult.status = `ok`;
        explainResult.message = `EXPLAIN JSON 분석 성공`;
      }
      catch (error) {
        explainResult.ok = false;
        explainResult.status = `parse_error`;
        explainResult.message = `EXPLAIN JSON 파싱 실패: ${toErrorMessage(error)}`;
      }
    }
    else {
      explainResult.ok = false;
      explainResult.status = `empty`;
      explainResult.message = `EXPLAIN JSON 결과를 가져오지 못했습니다.`;
    }
  }
  catch (error) {
    explainResult.ok = false;
    explainResult.status = `query_error`;
    explainResult.message = `EXPLAIN JSON 실행 실패: ${toErrorMessage(error)}`;
  }

  return explainResult;
};

const parseExplainAnalyzeSummary = (analyzeText) => {
  const summary = {
    available: false,
    nodeCount: 0,
    maxActualTimeEndMs: null,
    maxRows: null,
    maxLoops: null,
    rawPreview: ``,
  };
  const text = stringifyValue(analyzeText);
  const regex = /actual time=([\d.]+)\.\.([\d.]+)\s+rows=(\d+)\s+loops=(\d+)/g;
  let match = null;
  let preview = text;

  if (preview.length > 160) {
    preview = `${preview.slice(0, 157)}...`;
  }

  summary.rawPreview = preview;

  while (true) {
    match = regex.exec(text);

    if (!match) {
      break;
    }

    const endMs = toFiniteNumber(match[2]);
    const rows = toFiniteNumber(match[3]);
    const loops = toFiniteNumber(match[4]);

    summary.available = true;
    summary.nodeCount += 1;

    if (endMs !== null && (summary.maxActualTimeEndMs === null || endMs > summary.maxActualTimeEndMs)) {
      summary.maxActualTimeEndMs = endMs;
    }

    if (rows !== null && (summary.maxRows === null || rows > summary.maxRows)) {
      summary.maxRows = rows;
    }

    if (loops !== null && (summary.maxLoops === null || loops > summary.maxLoops)) {
      summary.maxLoops = loops;
    }
  }

  return summary;
};

const joinExplainAnalyzeRows = (rows) => {
  let text = ``;

  if (Array.isArray(rows)) {
    const lines = [];

    for (const row of rows) {
      if (row && typeof row === `object`) {
        if (typeof row.EXPLAIN === `string`) {
          lines.push(row.EXPLAIN);
        }
        else {
          const values = getObjectValues(row);
          const candidate = values[0];

          if (candidate !== undefined) {
            lines.push(String(candidate));
          }
        }
      }
      else if (row !== undefined) {
        lines.push(String(row));
      }
    }

    text = lines.join(`\n`).trim();
  }

  return text;
};

const runExplainAnalyze = async (conn, explainSql, shouldAttempt) => {
  const analyzeResult = {
    attempted: false,
    ok: false,
    status: `skipped`,
    message: `EXPLAIN ANALYZE 미시도`,
    text: ``,
    summary: null,
  };

  if (shouldAttempt && explainSql) {
    analyzeResult.attempted = true;

    try {
      const [rows] = await conn.query(explainSql);
      const analyzeText = joinExplainAnalyzeRows(rows);

      if (analyzeText) {
        analyzeResult.ok = true;
        analyzeResult.status = `ok`;
        analyzeResult.message = `EXPLAIN ANALYZE 분석 성공`;
        analyzeResult.text = analyzeText;
        analyzeResult.summary = parseExplainAnalyzeSummary(analyzeText);
      }
      else {
        analyzeResult.ok = false;
        analyzeResult.status = `warning`;
        analyzeResult.message = `EXPLAIN ANALYZE 결과를 읽지 못해 JSON 분석 결과만 사용합니다.`;
      }
    }
    catch (error) {
      analyzeResult.ok = false;
      analyzeResult.status = `warning`;
      analyzeResult.message = `EXPLAIN ANALYZE 실패(폴백): ${toErrorMessage(error)}`;
    }
  }

  return analyzeResult;
};

const createMetricsAccumulator = () => {
  return {
    tables: [],
    tableSignatureSet: new Set(),
    flags: {
      filesort: false,
      temporary: false,
      hasOrderingOperation: false,
      hasGroupingOperation: false,
      hasDuplicatesRemoval: false,
      hasMaterializedSubquery: false,
      hasNestedLoop: false,
    },
    counts: {
      orderingOperation: 0,
      groupingOperation: 0,
      duplicatesRemoval: 0,
      materializedSubquery: 0,
      nestedLoop: 0,
      attachedCondition: 0,
      indexCondition: 0,
    },
    costs: {
      queryCost: null,
      maxPrefixCost: null,
      maxReadCost: null,
      maxEvalCost: null,
    },
  };
};

const normalizeStringArray = (value) => {
  const normalized = [];

  if (Array.isArray(value)) {
    for (const item of value) {
      if (item !== null && item !== undefined && String(item).trim()) {
        normalized.push(String(item));
      }
    }
  }
  else if (typeof value === `string` && value.trim()) {
    normalized.push(value.trim());
  }

  return normalized;
};

const extractTableMetric = (tableNode) => {
  const metric = {
    tableName: `Unknown`,
    accessType: `Unknown`,
    key: null,
    possibleKeys: [],
    usedKeyParts: [],
    rowsExaminedPerScan: null,
    rowsProducedPerJoin: null,
    filtered: null,
    hasAttachedCondition: false,
    hasIndexCondition: false,
    readCost: null,
    evalCost: null,
    prefixCost: null,
  };

  if (tableNode && typeof tableNode === `object`) {
    if (tableNode.table_name) {
      metric.tableName = String(tableNode.table_name);
    }

    if (tableNode.access_type) {
      metric.accessType = String(tableNode.access_type);
    }

    if (tableNode.key) {
      metric.key = String(tableNode.key);
    }

    metric.possibleKeys = normalizeStringArray(tableNode.possible_keys);
    metric.usedKeyParts = normalizeStringArray(tableNode.used_key_parts);
    metric.rowsExaminedPerScan = toFiniteNumber(tableNode.rows_examined_per_scan);
    metric.rowsProducedPerJoin = toFiniteNumber(tableNode.rows_produced_per_join);
    metric.filtered = toFiniteNumber(tableNode.filtered);
    metric.hasAttachedCondition = Boolean(tableNode.attached_condition);
    metric.hasIndexCondition = Boolean(tableNode.index_condition);

    if (tableNode.cost_info && typeof tableNode.cost_info === `object`) {
      metric.readCost = toFiniteNumber(tableNode.cost_info.read_cost);
      metric.evalCost = toFiniteNumber(tableNode.cost_info.eval_cost);
      metric.prefixCost = toFiniteNumber(tableNode.cost_info.prefix_cost);
    }
  }

  return metric;
};

const addUniqueTableMetric = (metrics, tableMetric) => {
  const signatureParts = [
    tableMetric.tableName,
    tableMetric.accessType,
    tableMetric.key || `NULL`,
    tableMetric.rowsExaminedPerScan ?? `NULL`,
    tableMetric.rowsProducedPerJoin ?? `NULL`,
    tableMetric.filtered ?? `NULL`,
  ];
  const signature = signatureParts.join(`|`);

  if (!metrics.tableSignatureSet.has(signature)) {
    metrics.tableSignatureSet.add(signature);
    metrics.tables.push(tableMetric);
  }
};

const updateMetricCosts = (metrics, costInfo) => {
  if (costInfo && typeof costInfo === `object`) {
    const queryCost = toFiniteNumber(costInfo.query_cost);
    const readCost = toFiniteNumber(costInfo.read_cost);
    const evalCost = toFiniteNumber(costInfo.eval_cost);
    const prefixCost = toFiniteNumber(costInfo.prefix_cost);

    if (queryCost !== null && metrics.costs.queryCost === null) {
      metrics.costs.queryCost = queryCost;
    }

    if (readCost !== null && (metrics.costs.maxReadCost === null || readCost > metrics.costs.maxReadCost)) {
      metrics.costs.maxReadCost = readCost;
    }

    if (evalCost !== null && (metrics.costs.maxEvalCost === null || evalCost > metrics.costs.maxEvalCost)) {
      metrics.costs.maxEvalCost = evalCost;
    }

    if (prefixCost !== null && (metrics.costs.maxPrefixCost === null || prefixCost > metrics.costs.maxPrefixCost)) {
      metrics.costs.maxPrefixCost = prefixCost;
    }
  }
};

const collectPlanMetrics = (node, metrics) => {
  if (Array.isArray(node)) {
    for (const element of node) {
      collectPlanMetrics(element, metrics);
    }
  }
  else if (node && typeof node === `object`) {
    if (node.table && typeof node.table === `object`) {
      const tableMetric = extractTableMetric(node.table);
      addUniqueTableMetric(metrics, tableMetric);
    }

    if (node.using_filesort) {
      metrics.flags.filesort = true;
    }

    if (node.using_temporary_table) {
      metrics.flags.temporary = true;
    }

    if (Object.hasOwn(node, `ordering_operation`)) {
      metrics.flags.hasOrderingOperation = true;
      metrics.counts.orderingOperation += 1;
    }

    if (Object.hasOwn(node, `grouping_operation`)) {
      metrics.flags.hasGroupingOperation = true;
      metrics.counts.groupingOperation += 1;
    }

    if (Object.hasOwn(node, `duplicates_removal`)) {
      metrics.flags.hasDuplicatesRemoval = true;
      metrics.counts.duplicatesRemoval += 1;
    }

    if (Object.hasOwn(node, `materialized_from_subquery`)) {
      metrics.flags.hasMaterializedSubquery = true;
      metrics.counts.materializedSubquery += 1;
    }

    if (Object.hasOwn(node, `nested_loop`)) {
      metrics.flags.hasNestedLoop = true;
      metrics.counts.nestedLoop += 1;
    }

    if (Object.hasOwn(node, `attached_condition`) && node.attached_condition) {
      metrics.counts.attachedCondition += 1;
    }

    if (Object.hasOwn(node, `index_condition`) && node.index_condition) {
      metrics.counts.indexCondition += 1;
    }

    if (node.cost_info && typeof node.cost_info === `object`) {
      updateMetricCosts(metrics, node.cost_info);
    }

    for (const [ key, value ] of Object.entries(node)) {
      if (key !== `table`) {
        collectPlanMetrics(value, metrics);
      }
    }
  }
};

const summarizeMetrics = (metrics) => {
  const summary = {
    tableCount: metrics.tables.length,
    filesort: metrics.flags.filesort,
    temporary: metrics.flags.temporary,
    hasOrderingOperation: metrics.flags.hasOrderingOperation,
    hasGroupingOperation: metrics.flags.hasGroupingOperation,
    hasDuplicatesRemoval: metrics.flags.hasDuplicatesRemoval,
    hasMaterializedSubquery: metrics.flags.hasMaterializedSubquery,
    hasNestedLoop: metrics.flags.hasNestedLoop,
    queryCost: metrics.costs.queryCost,
    maxPrefixCost: metrics.costs.maxPrefixCost,
    maxReadCost: metrics.costs.maxReadCost,
    maxEvalCost: metrics.costs.maxEvalCost,
    maxRowsExamined: null,
    maxRowsProduced: null,
    tableAccess: [],
    conditionCounts: {
      attached: metrics.counts.attachedCondition,
      index: metrics.counts.indexCondition,
    },
    operationCounts: {
      ordering: metrics.counts.orderingOperation,
      grouping: metrics.counts.groupingOperation,
      duplicatesRemoval: metrics.counts.duplicatesRemoval,
      materializedSubquery: metrics.counts.materializedSubquery,
      nestedLoop: metrics.counts.nestedLoop,
    },
  };

  for (const table of metrics.tables) {
    if (table.rowsExaminedPerScan !== null && (summary.maxRowsExamined === null || table.rowsExaminedPerScan > summary.maxRowsExamined)) {
      summary.maxRowsExamined = table.rowsExaminedPerScan;
    }

    if (table.rowsProducedPerJoin !== null && (summary.maxRowsProduced === null || table.rowsProducedPerJoin > summary.maxRowsProduced)) {
      summary.maxRowsProduced = table.rowsProducedPerJoin;
    }

    summary.tableAccess.push({
      tableName: table.tableName,
      accessType: table.accessType,
      key: table.key,
      rowsExaminedPerScan: table.rowsExaminedPerScan,
    });
  }

  return summary;
};

const resolveGrade = (score) => {
  let grade = `최상 (Very Good)`;

  if (score < 90) {
    grade = `양호 (Good)`;
  }

  if (score < 70) {
    grade = `주의 (Needs Tuning)`;
  }

  if (score < 50) {
    grade = `위험 (Critical)`;
  }

  return grade;
};

const evaluatePerformance = (parsedPlan, analyzeResult) => {
  const metrics = createMetricsAccumulator();
  const issues = [];
  const goodPoints = [];
  let score = 100;

  collectPlanMetrics(parsedPlan, metrics);

  const addIssue = (severity, penalty, message) => {
    issues.push({
      severity: severity,
      penalty: penalty,
      message: message,
    });
    score -= penalty;
  };

  let hasGoodAccess = false;
  let hasFullScan = false;

  for (const table of metrics.tables) {
    const tableName = table.tableName;
    const accessType = table.accessType;
    const examined = table.rowsExaminedPerScan;
    const produced = table.rowsProducedPerJoin;
    const filtered = table.filtered;
    const possibleKeys = table.possibleKeys;
    const key = table.key;

    if (accessType === `ALL`) {
      hasFullScan = true;
      addIssue(`critical`, 25, `[${tableName}] Full Table Scan 발생 (access_type = ALL)`);
    }
    else if (accessType === `index`) {
      addIssue(`warn`, 12, `[${tableName}] Full Index Scan 발생 (access_type = index)`);
    }
    else if ([ `eq_ref`, `ref`, `system`, `const`, `range` ].includes(accessType)) {
      hasGoodAccess = true;
    }

    if (possibleKeys.length > 0 && !key) {
      addIssue(`warn`, 10, `[${tableName}] 인덱스 후보(possible_keys)는 있으나 실제 선택된 key가 없습니다.`);
    }

    if (typeof examined === `number`) {
      if (examined > 100_000) {
        addIssue(`critical`, 20, `[${tableName}] 스캔량 과다 (rows_examined_per_scan = ${formatNumber(examined)})`);
      }
      else if (examined > 10_000) {
        addIssue(`warn`, 10, `[${tableName}] 스캔량이 큽니다 (rows_examined_per_scan = ${formatNumber(examined)})`);
      }
    }

    if (typeof filtered === `number` && typeof examined === `number` && examined > 1000) {
      if (filtered < 10) {
        addIssue(`warn`, 8, `[${tableName}] 필터링 효율 매우 낮음 (filtered = ${filtered}%)`);
      }
      else if (filtered < 30) {
        addIssue(`warn`, 4, `[${tableName}] 필터링 효율 낮음 (filtered = ${filtered}%)`);
      }
    }

    if (typeof produced === `number` && produced > 100_000) {
      addIssue(`warn`, 8, `[${tableName}] 조인 결과 생성량이 큽니다 (rows_produced_per_join = ${formatNumber(produced)})`);
    }

    if (table.hasIndexCondition && key) {
      goodPoints.push(`[${tableName}] index_condition 사용으로 인덱스 조건 적용이 확인됩니다.`);
    }

    if (table.hasAttachedCondition && typeof filtered === `number` && filtered >= 50) {
      goodPoints.push(`[${tableName}] 조건절 필터링 효율이 양호한 편입니다 (filtered = ${filtered}%).`);
    }
  }

  if (metrics.flags.filesort) {
    addIssue(`warn`, 10, `Using filesort 발생 (ORDER BY/GROUP BY 정렬 비용 증가)`);
  }

  if (metrics.flags.temporary) {
    addIssue(`critical`, 15, `Using temporary 발생 (임시 테이블 생성)`);
  }

  if (metrics.flags.hasDuplicatesRemoval) {
    addIssue(`warn`, 6, `duplicates_removal 연산 감지 (중복 제거 비용 가능성)`);
  }

  if (metrics.flags.hasMaterializedSubquery) {
    addIssue(`warn`, 7, `materialized_from_subquery 감지 (서브쿼리 물질화 비용 가능성)`);
  }

  if (metrics.flags.hasOrderingOperation && !metrics.flags.filesort) {
    goodPoints.push(`정렬 연산은 존재하지만 EXPLAIN 상 filesort 표시는 감지되지 않았습니다.`);
  }

  if (metrics.flags.hasGroupingOperation && !metrics.flags.temporary) {
    goodPoints.push(`그룹 연산이 존재하나 EXPLAIN 상 temporary table 표시는 감지되지 않았습니다.`);
  }

  if (hasGoodAccess && !hasFullScan) {
    goodPoints.push(`인덱스 기반 접근(eq_ref/ref/range 등)을 활용하고 있으며 Full Table Scan은 감지되지 않았습니다.`);
  }

  if (issues.length === 0) {
    goodPoints.push(`주요 위험 신호(풀스캔/filesort/temporary)가 감지되지 않았습니다.`);
  }

  if (analyzeResult?.ok && analyzeResult.summary?.available) {
    const timeMs = analyzeResult.summary.maxActualTimeEndMs;

    if (typeof timeMs === `number`) {
      goodPoints.push(`EXPLAIN ANALYZE 기준 관측된 최대 actual time(end) = ${formatNumber(timeMs)} ms`);
    }
  }

  score = clampNumber(score, 0, 100);

  const evaluation = {
    score: score,
    grade: resolveGrade(score),
    cost: metrics.costs.queryCost,
    issues: issues,
    goodPoints: goodPoints,
    metricsSummary: summarizeMetrics(metrics),
    analysisMode: `JSON`,
    analyzeSummary: analyzeResult?.summary ?? null,
  };

  if (analyzeResult?.ok) {
    evaluation.analysisMode = `JSON+ANALYZE`;
  }
  else if (analyzeResult?.attempted) {
    evaluation.analysisMode = `JSON(Fallback)`;
  }

  return evaluation;
};

const assembleAnalysis = (jsonResult, analyzeResult) => {
  const assembled = {
    status: `error`,
    message: `분석 결과를 조립하지 못했습니다.`,
    json: jsonResult,
    analyze: analyzeResult,
    report: null,
  };

  if (jsonResult.ok && jsonResult.parsedPlan) {
    assembled.status = `ok`;
    assembled.message = `쿼리 분석이 완료되었습니다.`;
    assembled.report = evaluatePerformance(jsonResult.parsedPlan, analyzeResult);
  }
  else {
    assembled.status = `error`;
    assembled.message = jsonResult.message;
  }

  return assembled;
};

const analyzeQuery = async (conn, sql, statementProfile, analyzeCapability) => {
  const analysisResult = {
    status: `skipped`,
    message: `분석 스킵`,
    json: null,
    analyze: {
      attempted: false,
      ok: false,
      status: `skipped`,
      message: `EXPLAIN ANALYZE 미시도`,
      text: ``,
      summary: null,
    },
    report: null,
  };

  if (statementProfile.isExplainable) {
    const explainQueries = buildExplainQueries(sql, statementProfile, analyzeCapability);
    const jsonResult = await runExplainJson(conn, explainQueries.json);
    const shouldAttemptAnalyze = Boolean(explainQueries.analyze);
    const analyzeResult = await runExplainAnalyze(conn, explainQueries.analyze, shouldAttemptAnalyze);
    const assembled = assembleAnalysis(jsonResult, analyzeResult);

    analysisResult.status = assembled.status;
    analysisResult.message = assembled.message;
    analysisResult.json = jsonResult;
    analysisResult.analyze = analyzeResult;
    analysisResult.report = assembled.report;
  }
  else {
    analysisResult.status = `skipped`;
    analysisResult.message = `문장 유형(${statementProfile.statementType})은 EXPLAIN 분석 대상이 아닙니다.`;
  }

  return analysisResult;
};

// 5. 쿼리 실행 엔진 ----------------------------------------------------------------------------------------
const executeQueryByPolicy = async (conn, sql, statementProfile, executionPolicy) => {
  const executionResult = {
    attempted: false,
    executed: false,
    status: `skipped`,
    message: executionPolicy.reason,
    rows: [],
    rowCount: 0,
    rawRows: null,
  };

  if (executionPolicy.shouldExecute) {
    executionResult.attempted = true;

    try {
      const [rows] = await conn.query(sql);
      executionResult.rawRows = rows;

      if (Array.isArray(rows)) {
        executionResult.rows = rows;
        executionResult.rowCount = rows.length;
        executionResult.executed = true;
        executionResult.status = `ok`;
        executionResult.message = `읽기 전용 쿼리 실행 완료`;
      }
      else {
        executionResult.rows = [];
        executionResult.rowCount = 0;
        executionResult.executed = true;
        executionResult.status = `ok`;
        executionResult.message = `쿼리 실행은 완료되었으나 배열 결과가 아닙니다.`;
      }
    }
    catch (error) {
      executionResult.executed = false;
      executionResult.status = `error`;
      executionResult.message = `쿼리 실행 실패: ${toErrorMessage(error)}`;
    }
  }
  else {
    executionResult.status = `skipped`;
    executionResult.message = `실행 스킵: ${statementProfile.reason}`;
  }

  return executionResult;
};

// 6. 출력 함수 -------------------------------------------------------------------------------------------
const getDisplayWidth = (str) => {
  const s = String(str ?? ``);
  let width = 0;

  for (const ch of s) {
    const codePoint = ch.codePointAt(0) || 0;

    width += codePoint > 127 ? 2 : 1;
  }

  return width;
};

const padEndText = (str, len) => {
  const s = String(str ?? ``);
  const diff = len - getDisplayWidth(s);
  let result = s;

  if (diff > 0) {
    result = s + ` `.repeat(diff);
  }

  return result;
};

const formatValueForDisplay = (key, val) => {
  let result = `${C.gray}(NULL)${C.reset}`;
  const stringValue = stringifyValue(val);
  const isNullLike = val === null || val === undefined || stringValue === ``;
  const isEnc = key.includes(`_ENC`) && stringValue.length > 30;
  const isLong = stringValue.length > MAX_LONG_VALUE_PREVIEW;

  if (isNullLike) {
    result = `${C.gray}(NULL)${C.reset}`;
  }
  else if (isEnc) {
    result = `${C.dim}${stringValue.slice(0, 20)}...${C.gray}[ENC]${C.reset}`;
  }
  else if (isLong) {
    result = `${C.white}${stringValue.slice(0, MAX_LONG_VALUE_PREVIEW - 3)}...${C.reset}`;
  }
  else {
    result = `${C.white}${stringValue}${C.reset}`;
  }

  return result;
};

const printVertical = (rows, keys) => {
  let maxKeyLen = 0;

  for (const key of keys) {
    const width = getDisplayWidth(key);

    if (width > maxKeyLen) {
      maxKeyLen = width;
    }
  }

  const line = `${C.gray}${`─`.repeat(maxKeyLen + 40)}${C.reset}`;

  rows.forEach((row) => {
    const lines = [];
    lines.push(``);
    lines.push(line);

    keys.forEach((key, index) => {
      const num = `${C.dim}${String(index + 1).padStart(3)}.${C.reset}`;
      const keyStr = `${C.cyan}${padEndText(key, maxKeyLen)}${C.reset}`;
      const valStr = formatValueForDisplay(key, row[key]);
      lines.push(`${num} ${keyStr} │ ${valStr}`);
    });

    lines.push(line);
    console.log(lines.join(`\n`));
  });
};

const printCompact = (rows, keys) => {
  const colWidths = keys.map((key) => {
    const values = rows.map((row) => {
      const value = row[key] ?? `NULL`;
      return getDisplayWidth(String(value).slice(0, MAX_COMPACT_PREVIEW));
    });

    let width = getDisplayWidth(key);

    for (const valueWidth of values) {
      if (valueWidth > width) {
        width = valueWidth;
      }
    }

    if (width < 4) {
      width = 4;
    }

    return width;
  });

  const totalWidth = colWidths.reduce((acc, value) => acc + value, 0) + keys.length * 3;
  const termWidth = process.stdout.columns || DEFAULT_TERM_WIDTH;

  if (totalWidth > termWidth) {
    printVertical(rows, keys);
  }
  else {
    const header = keys.map((key, index) => {
      return `${C.cyan}${padEndText(key, colWidths[index])}${C.reset}`;
    }).join(` │ `);
    const sep = colWidths.map((width) => `─`.repeat(width)).join(`─┼─`);
    const lines = [];

    lines.push(`${C.gray}┌─${sep.replaceAll(`┼`, `┬`)}─┐${C.reset}`);
    lines.push(`│ ${header} │`);
    lines.push(`${C.gray}├─${sep}─┤${C.reset}`);

    rows.forEach((row) => {
      const line = keys.map((key, index) => {
        const value = row[key] ?? `NULL`;
        const display = String(value).slice(0, colWidths[index]);
        return padEndText(display, colWidths[index]);
      }).join(` │ `);

      lines.push(`│ ${line} │`);
    });

    lines.push(`${C.gray}└─${sep.replaceAll(`┼`, `┴`)}─┘${C.reset}`);
    console.log(lines.join(`\n`));
  }
};

const getSeverityText = (severity) => {
  let label = `${C.yellow}[주의]${C.reset}`;

  if (severity === `critical`) {
    label = `${C.red}[경고]${C.reset}`;
  }
  else if (severity === `info`) {
    label = `${C.cyan}[정보]${C.reset}`;
  }

  return label;
};

const getAnalysisGradeColor = (score) => {
  let color = C.green;

  if (score < 90) {
    color = C.cyan;
  }

  if (score < 70) {
    color = C.yellow;
  }

  if (score < 50) {
    color = C.red;
  }

  return color;
};

const printAnalysisReport = (analysisResult, statementProfile, executionPolicy, analyzeCapability) => {
  const executionModeText = executionPolicy.shouldExecute ? `${C.green}자동실행${C.reset}` : `${C.yellow}실행스킵${C.reset}`;
  const analyzeSupportText = analyzeCapability.supported ? `${C.green}지원${C.reset}` : `${C.yellow}미지원/제한${C.reset}`;

  console.log(`\n${C.gray}-----------------------------------------${C.reset}`);
  console.log(`${C.bold}쿼리 성능 종합 분석 리포트${C.reset}`);
  console.log(`${C.gray}-----------------------------------------${C.reset}`);
  console.log(`▶ 문장 유형     : ${C.white}${statementProfile.statementType}${C.reset} (leading=${statementProfile.leadingKeyword}, main=${statementProfile.mainKeyword})`);
  console.log(`▶ 실행 정책     : ${executionModeText}`);
  console.log(`▶ 실행 사유     : ${C.white}${executionPolicy.reason}${C.reset}`);
  console.log(`▶ ANALYZE 지원   : ${analyzeSupportText}`);

  if (analysisResult.status === `ok` && analysisResult.report) {
    const report = analysisResult.report;
    const scoreColor = getAnalysisGradeColor(report.score);
    const summary = report.metricsSummary;

    console.log(`▶ 분석 모드     : ${C.white}${report.analysisMode}${C.reset}`);
    console.log(`▶ 벤치마킹 점수 : ${scoreColor}${C.bold}${report.score} / 100${C.reset} (${report.grade})`);
    console.log(`▶ 예상 코스트   : ${C.white}${formatNumber(report.cost)}${C.reset}`);
    console.log(`▶ 메트릭 요약   : tables=${summary.tableCount}, filesort=${summary.filesort}, temporary=${summary.temporary}, maxRowsExamined=${formatNumber(summary.maxRowsExamined)}`);

    if (report.analyzeSummary?.available) {
      console.log(`▶ ANALYZE 요약   : nodes=${report.analyzeSummary.nodeCount}, maxActualEndMs=${formatNumber(report.analyzeSummary.maxActualTimeEndMs)}, maxRows=${formatNumber(report.analyzeSummary.maxRows)}`);
    }
    else if (analysisResult.analyze.attempted && !analysisResult.analyze.ok) {
      console.log(`▶ ANALYZE 요약   : ${C.yellow}${analysisResult.analyze.message}${C.reset}`);
    }

    console.log(`▶ 테이블 접근    :`);

    if (summary.tableAccess.length > 0) {
      for (const access of summary.tableAccess) {
        const keyText = access.key ? access.key : `NULL`;
        console.log(`  - ${access.tableName}: access=${access.accessType}, key=${keyText}, rowsExamined=${formatNumber(access.rowsExaminedPerScan)}`);
      }
    }
    else {
      console.log(`  - ${C.gray}테이블 메트릭을 추출하지 못했습니다.${C.reset}`);
    }

    console.log(`▶ 진단 결과     :`);

    if (report.goodPoints.length > 0) {
      for (const goodPoint of report.goodPoints) {
        console.log(`  - ${C.green}[우수]${C.reset} ${goodPoint}`);
      }
    }

    if (report.issues.length > 0) {
      for (const issue of report.issues) {
        const badge = getSeverityText(issue.severity);
        console.log(`  - ${badge} ${issue.message} ${C.gray}(-${issue.penalty})${C.reset}`);
      }
    }
    else if (report.goodPoints.length === 0) {
      console.log(`  - ${C.gray}특이사항 없음${C.reset}`);
    }
  }
  else if (analysisResult.status === `error`) {
    console.log(`▶ 분석 상태     : ${C.red}실패${C.reset}`);
    console.log(`▶ 실패 사유     : ${C.white}${analysisResult.message}${C.reset}`);

    if (analysisResult.json?.message) {
      console.log(`▶ JSON 분석      : ${C.white}${analysisResult.json.message}${C.reset}`);
    }

    if (analysisResult.analyze?.attempted) {
      console.log(`▶ ANALYZE 결과   : ${C.white}${analysisResult.analyze.message}${C.reset}`);
    }
  }
  else {
    console.log(`▶ 분석 상태     : ${C.yellow}스킵${C.reset}`);
    console.log(`▶ 스킵 사유     : ${C.white}${analysisResult.message}${C.reset}`);
  }

  console.log(`${C.gray}-----------------------------------------${C.reset}\n`);
};

const printResult = (rows) => {
  const rowCount = rows.length;
  const keys = Object.keys(rows[0] || {});
  const colCount = keys.length;
  const displayRows = rows.slice(0, DISPLAY_LIMIT);
  const hiddenCount = rowCount - displayRows.length;

  logger(`info`, `조회 결과: ${rowCount}건 | 컬럼: ${colCount}개`);

  if (colCount > 10 || rowCount <= DISPLAY_LIMIT) {
    printVertical(displayRows, keys);
  }
  else {
    printCompact(displayRows, keys);
  }

  if (hiddenCount > 0) {
    console.log(`\n${C.gray}  ... 이하 ${hiddenCount}건 생략${C.reset}`);
  }
};

// 7. 메인 로직 -------------------------------------------------------------------------------------------
const main = async () => {
  let exitCode = EXIT_CODE_ERROR;
  let conn = null;

  try {
    const argv = process.argv.slice(2);
    const sqlFilePath = argv[0] || ``;
    const rawSql = getSqlFromFile(sqlFilePath);
    const normalizedSqlInfo = normalizeSqlInput(rawSql);

    if (!normalizedSqlInfo.ok) {
      throw new Error(normalizedSqlInfo.message);
    }

    const tokens = tokenizeSql(normalizedSqlInfo.sql);
    const validation = validateSingleStatement(normalizedSqlInfo.sql, tokens);

    if (!validation.ok) {
      throw new Error(validation.message);
    }

    const statementProfile = classifyStatement(normalizedSqlInfo.sql, tokens);
    const executionPolicy = getExecutionPolicy(statementProfile);

    conn = await createConnection(CONNECTION_URI);

    const analyzeCapability = await detectAnalyzeCapability(conn);
    const analysisResult = await analyzeQuery(conn, normalizedSqlInfo.sql, statementProfile, analyzeCapability);

    printAnalysisReport(analysisResult, statementProfile, executionPolicy, analyzeCapability);

    if (analysisResult.status === `error`) {
      logger(`warn`, `분석 실패가 발생했지만 읽기 전용 쿼리인 경우 실행 정책에 따라 계속 진행합니다.`);
    }

    if (!executionPolicy.shouldExecute) {
      logger(`warn`, `실제 쿼리 실행 스킵: ${executionPolicy.reason}`);
    }

    const executionResult = await executeQueryByPolicy(conn, normalizedSqlInfo.sql, statementProfile, executionPolicy);

    if (executionResult.status === `error`) {
      throw new Error(executionResult.message);
    }

    if (executionResult.executed) {
      if (executionResult.rowCount > 0) {
        printResult(executionResult.rows);
      }
      else {
        logger(`warn`, `조회된 데이터가 없습니다.`);
      }
    }

    exitCode = EXIT_CODE_SUCCESS;
  }
  catch (error) {
    logger(`error`, `쿼리 실행 중 오류가 발생했습니다: ${toErrorMessage(error)}`);
    exitCode = EXIT_CODE_ERROR;
  }
  finally {
    if (conn) {
      try {
        await conn.end();
      }
      catch (error) {
        logger(`warn`, `DB 연결 종료 중 경고: ${toErrorMessage(error)}`);
      }
    }
  }

  return exitCode;
};

main()
.then((exitCode) => {
  process.exit(exitCode);
})
.catch((error) => {
  logger(`error`, `치명적 오류: ${toErrorMessage(error)}`);
  process.exit(EXIT_CODE_ERROR);
});

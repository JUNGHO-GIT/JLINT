/**
 * @file shared.mjs
 * @description JNODE 공통 섹션 라우터 (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { runPrompt } from "../lib/utils.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT_CANDIDATES = [
  process.cwd(),
  path.resolve(__dirname, `..`, `..`, `..`),
  path.resolve(__dirname, `..`, `..`, `..`, `..`, `..`),
];
const PACKAGE_JSON_FALLBACK = {
  "name": `jnode`,
  "version": `0.0.0`,
};
const PM_FLAG = `--bun`;
const PS_SCRIPT_DIRECTORY = `ps`;
const PS_SCRIPT_PREFIX = `run-`;
const PS_SCRIPT_SUFFIX = `.mjs`;
const FS_TARGET_SCRIPT_MAP = {
  "ai": `fs/ai-config.mjs`,
  "vscode": `fs/vscode-config.mjs`,
};
const FS_MODE_SET = new Set([
  `to-local`,
  `to-jnode`,
]);
const SWC_ACTION_FLAG_MAP = {
  "build": `--build`,
  "compile": `--compile`,
  "start": `--start`,
  "watch": `--watch`,
};
const UTILS_ACTION_CONFIG_MAP = {
  "fix": {
    "scriptFileName": `utils/fix.mjs`,
    "scriptArgs": [
      PM_FLAG,
      `--fix`,
    ],
  },
  "remove": {
    "scriptFileName": `utils/remove.mjs`,
    "scriptArgs": [
      PM_FLAG,
      `--remove`,
    ],
  },
  "reset": {
    "scriptFileName": `utils/reset.mjs`,
    "scriptArgs": [
      PM_FLAG,
      `--reset`,
    ],
  },
  "sort": {
    "scriptFileName": `utils/sort.mjs`,
    "scriptArgs": [
      PM_FLAG,
      `--sort`,
    ],
  },
};
const CATEGORY_FLAG_NAME_MAP = {
  "--release": `release`,
  "--app": `app`,
  "--config": `config`,
  "--repo": `repo`,
  "--ops": `ops`,
  "--tools": `tools`,
  "--etc": `release`,
  "--project": `app`,
  "--fs": `config`,
  "--git": `repo`,
  "--ps": `ops`,
  "--utils": `tools`,
};
const CATEGORY_NAME_ALIAS_MAP = {
  "etc": `release`,
  "project": `app`,
  "fs": `config`,
  "git": `repo`,
  "ps": `ops`,
  "utils": `tools`,
};

const resolveProjectRoot = () => {
  const resolvedProjectRoot = PROJECT_ROOT_CANDIDATES.find((candidatePath) => {
    const packageJsonPath = path.join(candidatePath, `package.json`);
    const existsPackageJson = fs.existsSync(packageJsonPath);
    const result = existsPackageJson;

    return result;
  }) || process.cwd();
  const result = resolvedProjectRoot;

  return result;
};

const PROJECT_ROOT = resolveProjectRoot();
const PACKAGE_JSON_PATH = path.join(PROJECT_ROOT, `package.json`);

const readPackageJson = () => {
  let packageJson = PACKAGE_JSON_FALLBACK;

  if (fs.existsSync(PACKAGE_JSON_PATH)) {
    try {
      const packageJsonContent = fs.readFileSync(PACKAGE_JSON_PATH, `utf8`);
      packageJson = JSON.parse(packageJsonContent);
    }
    catch {
      packageJson = PACKAGE_JSON_FALLBACK;
    }
  }

  const result = packageJson;

  return result;
};

const PACKAGE_JSON = readPackageJson();

const resolveScriptPath = (scriptFileName = ``) => {
  const candidateScriptPaths = [
    path.join(PROJECT_ROOT, `.node`, `mjs`, scriptFileName),
    path.join(PROJECT_ROOT, `src`, `public`, `node`, `mjs`, scriptFileName),
  ];
  const resolvedScriptPath = candidateScriptPaths.find((candidatePath) => {
    const existsCandidatePath = fs.existsSync(candidatePath);
    const result = existsCandidatePath;

    return result;
  }) || ``;
  const result = resolvedScriptPath;

  return result;
};

const resolveScriptDirectoryPath = (directoryName = ``) => {
  const candidateDirectoryPaths = [
    path.join(PROJECT_ROOT, `.node`, `mjs`, directoryName),
    path.join(PROJECT_ROOT, `src`, `public`, `node`, `mjs`, directoryName),
  ];
  const resolvedDirectoryPath = candidateDirectoryPaths.find((candidatePath) => {
    const existsCandidatePath = fs.existsSync(candidatePath);
    const isDirectory = existsCandidatePath && fs.statSync(candidatePath).isDirectory();
    const result = isDirectory;

    return result;
  }) || ``;
  const result = resolvedDirectoryPath;

  return result;
};

const isDirectRun = (importMetaUrl = ``) => {
  const hasArgvPath = typeof process.argv[1] === `string` && process.argv[1].trim() !== ``;
  const currentModulePath = fileURLToPath(importMetaUrl);
  const executedModulePath = hasArgvPath ? path.resolve(process.argv[1]) : ``;
  const isSamePath = hasArgvPath && path.resolve(currentModulePath) === executedModulePath;
  const result = isSamePath;

  return result;
};

const exitWithCliError = (message = ``) => {
  const errorMessage = String(message || ``).trim() || `알 수 없는 CLI 오류가 발생했습니다.`;

  console.error(`[jnode-cli] ${errorMessage}`);
  process.exit(1);
};

const parseOptionFlags = (argv = []) => {
  const parsedOptions = {
    "client": argv.includes(`--client`),
    "server": argv.includes(`--server`),
    "n": argv.includes(`--n`),
    "y": argv.includes(`--y`),
  };
  const result = parsedOptions;

  return result;
};

const parsePositionalArgs = (argv = []) => {
  const positionalArgs = argv.filter((arg) => {
    const normalizedArg = String(arg || ``).trim();
    const isOptionFlag = normalizedArg.startsWith(`--`);
    const result = !isOptionFlag;

    return result;
  });
  const result = positionalArgs;

  return result;
};

const normalizeCategoryName = (categoryName = ``) => {
  const normalizedCategoryName = String(categoryName || ``).trim();
  const resolvedCategoryName = Object.hasOwn(CATEGORY_NAME_ALIAS_MAP, normalizedCategoryName)
    ? CATEGORY_NAME_ALIAS_MAP[normalizedCategoryName]
    : normalizedCategoryName;
  const result = resolvedCategoryName;

  return result;
};

const resolveCategorySelectionFromFlags = (argv = []) => {
  const normalizedArgList = new Set(argv.map((arg) => String(arg || ``).trim()));
  const matchedFlag = Object.keys(CATEGORY_FLAG_NAME_MAP).find((flag) => normalizedArgList.has(flag)) || ``;
  const resolvedCategoryName = matchedFlag !== ``
    ? CATEGORY_FLAG_NAME_MAP[matchedFlag]
    : ``;
  const result = {
    "matchedFlag": matchedFlag,
    "categoryName": resolvedCategoryName,
  };

  return result;
};

const removeFirstPositionalArg = (argv = []) => {
  let isRemoved = false;
  const remainingArgs = argv.filter((arg) => {
    const normalizedArg = String(arg || ``).trim();
    const isOptionFlag = normalizedArg.startsWith(`--`);
    let shouldKeep = true;

    if (!isOptionFlag && !isRemoved) {
      isRemoved = true;
      shouldKeep = false;
    }

    return shouldKeep;
  });
  const result = remainingArgs;

  return result;
};

const removeCategoryFlag = (argv = [], categoryFlag = ``) => {
  const normalizedCategoryFlag = String(categoryFlag || ``).trim();
  let isRemoved = false;
  const remainingArgs = argv.filter((arg) => {
    const normalizedArg = String(arg || ``).trim();
    const shouldRemove = !isRemoved && normalizedCategoryFlag !== `` && normalizedArg === normalizedCategoryFlag;
    const shouldKeep = !shouldRemove;

    if (shouldRemove) {
      isRemoved = true;
    }

    return shouldKeep;
  });
  const result = remainingArgs;

  return result;
};

const resolveModeFlag = (options = {}, defaultMode = `server`) => {
  const resolvedMode = options.client
    ? `client`
    : options.server
      ? `server`
      : defaultMode;
  const result = `--${resolvedMode}`;

  return result;
};

const resolveCommitMessageFlag = (options = {}) => {
  const resolvedFlag = options.n
    ? `--n`
    : options.y
      ? `--y`
      : ``;
  const result = resolvedFlag;

  return result;
};

const runToolScript = async (scriptFileName = ``, args = []) => {
  const scriptPath = resolveScriptPath(scriptFileName);
  const filteredArgs = args.filter((arg) => String(arg || ``).trim() !== ``);

  if (scriptPath === ``) {
    throw new Error(`스크립트를 찾을 수 없습니다: ${scriptFileName}`);
  }

  const result = await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [
      scriptPath,
      ...filteredArgs,
    ], {
      "cwd": PROJECT_ROOT,
      "env": process.env,
      "stdio": `inherit`,
    });

    child.once(`error`, (error) => {
      const wrappedError = new Error(`하위 스크립트 실행 실패 (${scriptFileName}): ${error.message}`);
      reject(wrappedError);
    });

    child.once(`close`, (code) => {
      const exitCode = typeof code === `number` ? code : 1;

      if (exitCode === 0) {
        resolve();
      }
      else {
        const wrappedError = new Error(`하위 스크립트가 비정상 종료되었습니다 (${scriptFileName}, exit code: ${exitCode})`);
        reject(wrappedError);
      }
    });
  });

  return result;
};

const executeCommand = async (scriptFileName = ``, args = []) => {
  try {
    await runToolScript(scriptFileName, args);
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    exitWithCliError(errorMessage);
  }
};

const buildMenuLines = (title = ``, optionList = []) => {
  const normalizedTitle = String(title || ``).trim();
  const lines = [];

  normalizedTitle !== `` && lines.push(normalizedTitle);
  optionList.forEach((option, index) => {
    const label = String(option?.label || ``).trim();

    lines.push(`${index + 1}. ${label}`);
  });
  const result = lines;

  return result;
};

// Changed
const parseMenuSelectionNumbers = (answer = ``, optionList = []) => {
  const normalizedAnswer = String(answer || ``).trim();
  const rawTokenList = normalizedAnswer
  .split(/[\s,]+/u)
  .map((token) => token.trim())
  .filter((token) => token !== ``);
  const selectedIndexList = [];
  let hasInvalidToken = rawTokenList.length === 0;

  for (const token of rawTokenList) {
    const selectedNumber = Number(token);
    const isValidNumber = Number.isInteger(selectedNumber);
    const isValidRange = selectedNumber >= 1 && selectedNumber <= optionList.length;

    if (!isValidNumber || !isValidRange) {
      hasInvalidToken = true;
      break;
    }

    const selectedIndex = selectedNumber - 1;
    const isDuplicate = selectedIndexList.includes(selectedIndex);

    if (!isDuplicate) {
      selectedIndexList.push(selectedIndex);
    }
  }

  const selectedOptionList = hasInvalidToken
    ? []
    : selectedIndexList.map((selectedIndex) => optionList[selectedIndex]);
  const result = {
    "isValid": !hasInvalidToken,
    "selectedOptionList": selectedOptionList,
  };

  return result;
};

const promptMenuSelection = async (title = ``, optionList = []) => {
  const hasOptions = Array.isArray(optionList) && optionList.length > 0;

  if (!hasOptions) {
    throw new Error(`선택 가능한 메뉴가 없습니다.`);
  }

  const menuLines = buildMenuLines(title, optionList);
  let selectedOption = null;
  let shouldPrintMenu = true;

  while (!selectedOption) {
    shouldPrintMenu && console.log(menuLines.join(`\n`));

    const answer = await runPrompt(`번호를 입력하세요: `);
    const selectedNumber = Number(answer);
    const isValidNumber = Number.isInteger(selectedNumber);
    const isValidRange = selectedNumber >= 1 && selectedNumber <= optionList.length;

    selectedOption = isValidNumber && isValidRange
      ? optionList[selectedNumber - 1]
      : null;
    !selectedOption && console.log(`[jnode-cli] 유효한 번호를 입력하세요.`);
    shouldPrintMenu = false;
  }

  const result = selectedOption;

  return result;
};

// Changed
const promptMenuSelections = async (title = ``, optionList = []) => {
  const hasOptions = Array.isArray(optionList) && optionList.length > 0;

  if (!hasOptions) {
    throw new Error(`선택 가능한 메뉴가 없습니다.`);
  }

  const menuLines = buildMenuLines(title, optionList);
  let selectedOptionList = [];
  let shouldPrintMenu = true;

  while (selectedOptionList.length === 0) {
    shouldPrintMenu && console.log(menuLines.join(`\n`));

    const answer = await runPrompt(`번호를 입력하세요 (예: 1,2,3): `);
    const selection = parseMenuSelectionNumbers(answer, optionList);

    selectedOptionList = selection.isValid
      ? selection.selectedOptionList
      : [];
    selectedOptionList.length === 0 && console.log(`[jnode-cli] 유효한 번호를 입력하세요. 예: 1,2,3`);
    shouldPrintMenu = false;
  }

  const result = selectedOptionList;

  return result;
};

// Changed
const runInteractiveOptionList = async (selectedOptionList = []) => {
  for (const selectedOption of selectedOptionList) {
    await selectedOption.run();
  }
};

const promptEtcAction = async () => {
  const interactiveOptions = [
    {
      "label": `vsce`,
      "run": () => executeCommand(`etc/vsce.mjs`, [
        PM_FLAG,
        `--package`,
      ]),
    },
    {
      "label": `gcloud server`,
      "run": () => executeCommand(`etc/gcloud.mjs`, [
        PM_FLAG,
        `--server`,
      ]),
    },
    {
      "label": `gcloud client`,
      "run": () => executeCommand(`etc/gcloud.mjs`, [
        PM_FLAG,
        `--client`,
      ]),
    },
  ];
  const selectedOption = await promptMenuSelection(`[release] 실행할 작업을 선택하세요.`, interactiveOptions);
  const result = await selectedOption.run();

  return result;
};

const handleEtcCategory = async (argv = [], options = {}) => {
  const positionalArgs = parsePositionalArgs(argv);
  const action = String(positionalArgs[0] || ``).trim();

  if (action === ``) {
    await promptEtcAction();
    return;
  }

  if (action === `vsce`) {
    await executeCommand(`etc/vsce.mjs`, [
      PM_FLAG,
      `--package`,
    ]);
    return;
  }

  if (action === `gcloud`) {
    const modeFlag = resolveModeFlag(options, `server`);

    await executeCommand(`etc/gcloud.mjs`, [
      PM_FLAG,
      modeFlag,
    ]);
    return;
  }

  exitWithCliError(`지원하지 않는 release action 입니다: ${action}`);
};

const runSwcAction = async (action = ``, options = {}) => {
  const normalizedAction = String(action || ``).trim();
  const actionFlag = Object.hasOwn(SWC_ACTION_FLAG_MAP, normalizedAction)
    ? SWC_ACTION_FLAG_MAP[normalizedAction]
    : ``;

  if (actionFlag === ``) {
    exitWithCliError(`지원하지 않는 app action 입니다: swc ${normalizedAction}`);
    return;
  }

  const modeFlag = resolveModeFlag(options, `server`);

  await executeCommand(`project/swc.mjs`, [
    PM_FLAG,
    actionFlag,
    modeFlag,
  ]);
};

const promptProjectAction = async (options = {}) => {
  const interactiveOptions = [
    {
      "label": `sync server`,
      "run": () => executeCommand(`project/sync.mjs`, [
        PM_FLAG,
        `--sync`,
        `--server`,
      ]),
    },
    {
      "label": `sync client`,
      "run": () => executeCommand(`project/sync.mjs`, [
        PM_FLAG,
        `--sync`,
        `--client`,
      ]),
    },
    {
      "label": `start server`,
      "run": () => executeCommand(`project/swc.mjs`, [
        PM_FLAG,
        `--start`,
        `--server`,
      ]),
    },
    {
      "label": `start client`,
      "run": () => executeCommand(`project/swc.mjs`, [
        PM_FLAG,
        `--start`,
        `--client`,
      ]),
    },
    {
      "label": `build server`,
      "run": () => executeCommand(`project/swc.mjs`, [
        PM_FLAG,
        `--build`,
        `--server`,
      ]),
    },
    {
      "label": `build client`,
      "run": () => executeCommand(`project/swc.mjs`, [
        PM_FLAG,
        `--build`,
        `--client`,
      ]),
    },
    {
      "label": `swc compile server`,
      "run": () => runSwcAction(`compile`, {
        ...options,
        "client": false,
        "server": true,
      }),
    },
    {
      "label": `swc watch server`,
      "run": () => runSwcAction(`watch`, {
        ...options,
        "client": false,
        "server": true,
      }),
    },
  ];
  const selectedOption = await promptMenuSelection(`[app] 실행할 작업을 선택하세요.`, interactiveOptions);
  const result = await selectedOption.run();

  return result;
};

const promptSwcAction = async (options = {}) => {
  const interactiveOptions = [
    {
      "label": `compile server`,
      "run": () => runSwcAction(`compile`, {
        ...options,
        "client": false,
        "server": true,
      }),
    },
    {
      "label": `watch server`,
      "run": () => runSwcAction(`watch`, {
        ...options,
        "client": false,
        "server": true,
      }),
    },
    {
      "label": `start server`,
      "run": () => runSwcAction(`start`, {
        ...options,
        "client": false,
        "server": true,
      }),
    },
    {
      "label": `start client`,
      "run": () => runSwcAction(`start`, {
        ...options,
        "client": true,
        "server": false,
      }),
    },
    {
      "label": `build server`,
      "run": () => runSwcAction(`build`, {
        ...options,
        "client": false,
        "server": true,
      }),
    },
    {
      "label": `build client`,
      "run": () => runSwcAction(`build`, {
        ...options,
        "client": true,
        "server": false,
      }),
    },
  ];
  const selectedOption = await promptMenuSelection(`[app:swc] 실행할 작업을 선택하세요.`, interactiveOptions);
  const result = await selectedOption.run();

  return result;
};

const handleProjectCategory = async (argv = [], options = {}) => {
  const positionalArgs = parsePositionalArgs(argv);
  const action = String(positionalArgs[0] || ``).trim();
  const subAction = String(positionalArgs[1] || ``).trim();

  if (action === ``) {
    await promptProjectAction(options);
    return;
  }

  if (action === `sync`) {
    const modeFlag = resolveModeFlag(options, `server`);

    await executeCommand(`project/sync.mjs`, [
      PM_FLAG,
      `--sync`,
      modeFlag,
    ]);
    return;
  }

  if ([ `start`, `build` ].includes(action)) {
    await runSwcAction(action, options);
    return;
  }

  if (action === `swc`) {
    if (subAction === ``) {
      await promptSwcAction(options);
      return;
    }

    await runSwcAction(subAction, options);
    return;
  }

  exitWithCliError(`지원하지 않는 app action 입니다: ${action}`);
};

const promptFsAction = async () => {
  const interactiveOptions = [
    {
      "label": `ai to-local`,
      "run": () => executeCommand(`fs/ai-config.mjs`, [`to-local`]),
    },
    {
      "label": `ai to-jnode`,
      "run": () => executeCommand(`fs/ai-config.mjs`, [`to-jnode`]),
    },
    {
      "label": `vscode to-local`,
      "run": () => executeCommand(`fs/vscode-config.mjs`, [`to-local`]),
    },
    {
      "label": `vscode to-jnode`,
      "run": () => executeCommand(`fs/vscode-config.mjs`, [`to-jnode`]),
    },
  ];
  const selectedOptionList = await promptMenuSelections(`[config] 실행할 작업을 선택하세요.`, interactiveOptions);
  const result = await runInteractiveOptionList(selectedOptionList);

  return result;
};

const promptFsMode = async (target = ``) => {
  const normalizedTarget = String(target || ``).trim();
  const scriptFileName = Object.hasOwn(FS_TARGET_SCRIPT_MAP, normalizedTarget)
    ? FS_TARGET_SCRIPT_MAP[normalizedTarget]
    : ``;

  if (scriptFileName === ``) {
    exitWithCliError(`지원하지 않는 config target 입니다: ${normalizedTarget}`);
    return;
  }

  const interactiveOptions = [
    {
      "label": `${normalizedTarget} to-local`,
      "run": () => executeCommand(scriptFileName, [`to-local`]),
    },
    {
      "label": `${normalizedTarget} to-jnode`,
      "run": () => executeCommand(scriptFileName, [`to-jnode`]),
    },
  ];
  const selectedOptionList = await promptMenuSelections(`[config:${normalizedTarget}] 실행할 작업을 선택하세요.`, interactiveOptions);
  const result = await runInteractiveOptionList(selectedOptionList);

  return result;
};

const handleFsCategory = async (argv = []) => {
  const positionalArgs = parsePositionalArgs(argv);
  const target = String(positionalArgs[0] || ``).trim();
  const mode = String(positionalArgs[1] || ``).trim();
  const scriptFileName = Object.hasOwn(FS_TARGET_SCRIPT_MAP, target)
    ? FS_TARGET_SCRIPT_MAP[target]
    : ``;
  const hasSupportedMode = FS_MODE_SET.has(mode);

  if (target === ``) {
    await promptFsAction();
    return;
  }

  if (scriptFileName === ``) {
    exitWithCliError(`지원하지 않는 config target 입니다: ${target}`);
    return;
  }

  if (!hasSupportedMode) {
    await promptFsMode(target);
    return;
  }

  await executeCommand(scriptFileName, [mode]);
};

const promptGitAction = async () => {
  const interactiveOptions = [
    {
      "label": `fetch`,
      "run": () => executeCommand(`git/action.mjs`, [
        PM_FLAG,
        `--fetch`,
      ]),
    },
    {
      "label": `push -y -msg`,
      "run": () => executeCommand(`git/action.mjs`, [
        PM_FLAG,
        `--push`,
        `--y`,
      ]),
    },
    {
      "label": `push -n -msg`,
      "run": () => executeCommand(`git/action.mjs`, [
        PM_FLAG,
        `--push`,
        `--n`,
      ]),
    },
  ];
  const selectedOptionList = await promptMenuSelections(`[repo] 실행할 작업을 선택하세요.`, interactiveOptions);
  const result = await runInteractiveOptionList(selectedOptionList);

  return result;
};

const handleGitCategory = async (argv = [], options = {}) => {
  const positionalArgs = parsePositionalArgs(argv);
  const action = String(positionalArgs[0] || ``).trim();
  const commitMessageFlag = resolveCommitMessageFlag(options);

  if (action === ``) {
    await promptGitAction();
    return;
  }

  if (action === `fetch`) {
    await executeCommand(`git/action.mjs`, [
      PM_FLAG,
      `--fetch`,
    ]);
    return;
  }

  if (action === `push`) {
    await executeCommand(`git/action.mjs`, [
      PM_FLAG,
      `--push`,
      commitMessageFlag,
    ]);
    return;
  }

  exitWithCliError(`지원하지 않는 repo action 입니다: ${action}`);
};

const toPsActionName = (fileName = ``) => {
  const normalizedFileName = String(fileName || ``).trim();
  const actionName = normalizedFileName
  .replace(new RegExp(`^${PS_SCRIPT_PREFIX}`), ``)
  .replace(new RegExp(`${PS_SCRIPT_SUFFIX}$`), ``);
  const result = actionName;

  return result;
};

const getPsActionConfigList = () => {
  const scriptDirectoryPath = resolveScriptDirectoryPath(PS_SCRIPT_DIRECTORY);
  const directoryEntries = scriptDirectoryPath === ``
    ? []
    : fs.readdirSync(scriptDirectoryPath, { "withFileTypes": true });
  const actionConfigList = directoryEntries
  .filter((entry) => entry.isFile() && entry.name.startsWith(PS_SCRIPT_PREFIX) && entry.name.endsWith(PS_SCRIPT_SUFFIX))
  .filter((entry) => entry.name !== `${PS_SCRIPT_PREFIX}selected${PS_SCRIPT_SUFFIX}`)
  .map((entry) => {
    const actionName = toPsActionName(entry.name);
    const actionConfig = {
      "label": actionName,
      "scriptFileName": `${PS_SCRIPT_DIRECTORY}/${entry.name}`,
    };
    const result = actionConfig;

    return result;
  })
  .sort((leftAction, rightAction) => leftAction.label.localeCompare(rightAction.label));
  const result = actionConfigList;

  return result;
};

const resolvePsScriptFileName = (action = ``) => {
  const normalizedAction = String(action || ``).trim();
  const fileName = normalizedAction === ``
    ? ``
    : `${PS_SCRIPT_DIRECTORY}/${PS_SCRIPT_PREFIX}${normalizedAction}${PS_SCRIPT_SUFFIX}`;
  const resolvedPath = fileName === ``
    ? ``
    : resolveScriptPath(fileName);
  const result = resolvedPath === ``
    ? ``
    : fileName;

  return result;
};

const promptPsAction = async () => {
  const actionConfigList = getPsActionConfigList();
  const hasActions = actionConfigList.length > 0;

  if (!hasActions) {
    exitWithCliError(`실행 가능한 ops action 이 없습니다.`);
    return;
  }

  const interactiveOptions = actionConfigList.map((actionConfig) => {
    const interactiveOption = {
      "label": actionConfig.label,
      "run": () => executeCommand(actionConfig.scriptFileName, []),
    };
    const result = interactiveOption;

    return result;
  });
  const selectedOptionList = await promptMenuSelections(`[ops] 실행할 작업을 선택하세요.`, interactiveOptions);
  const result = await runInteractiveOptionList(selectedOptionList);

  return result;
};

const handlePsCategory = async (argv = []) => {
  const positionalArgs = parsePositionalArgs(argv);
  const action = String(positionalArgs[0] || ``).trim();

  if (action === ``) {
    await promptPsAction();
    return;
  }

  const scriptFileName = resolvePsScriptFileName(action);

  if (scriptFileName === ``) {
    exitWithCliError(`지원하지 않는 ops action 입니다: ${action}`);
    return;
  }

  await executeCommand(scriptFileName, []);
};

const promptUtilsAction = async () => {
  const interactiveOptions = [
    {
      "label": `fix`,
      "run": () => executeCommand(`utils/fix.mjs`, [
        PM_FLAG,
        `--fix`,
      ]),
    },
    {
      "label": `sort`,
      "run": () => executeCommand(`utils/sort.mjs`, [
        PM_FLAG,
        `--sort`,
      ]),
    },
    {
      "label": `reset`,
      "run": () => executeCommand(`utils/reset.mjs`, [
        PM_FLAG,
        `--reset`,
      ]),
    },
    {
      "label": `remove`,
      "run": () => executeCommand(`utils/remove.mjs`, [
        PM_FLAG,
        `--remove`,
      ]),
    },
  ];
  const selectedOption = await promptMenuSelection(`[tools] 실행할 작업을 선택하세요.`, interactiveOptions);
  const result = await selectedOption.run();

  return result;
};

const handleUtilsCategory = async (argv = []) => {
  const positionalArgs = parsePositionalArgs(argv);
  const action = String(positionalArgs[0] || ``).trim();
  const actionConfig = Object.hasOwn(UTILS_ACTION_CONFIG_MAP, action)
    ? UTILS_ACTION_CONFIG_MAP[action]
    : null;

  if (action === ``) {
    await promptUtilsAction();
    return;
  }

  if (!actionConfig) {
    exitWithCliError(`지원하지 않는 tools action 입니다: ${action}`);
    return;
  }

  await executeCommand(actionConfig.scriptFileName, actionConfig.scriptArgs);
};

const CATEGORY_CONFIG_LIST = [
  {
    "name": `release`,
    "order": 0,
    "usage": `Usage: bun run release <action> [options]`,
    "helpLines": [
      `0. release`,
      `   - release vsce`,
      `   - release gcloud --server|--client`,
      `   - alias: etc`,
    ],
    "handle": handleEtcCategory,
  },
  {
    "name": `app`,
    "order": 1,
    "usage": `Usage: bun run app <action> [subAction] [options]`,
    "helpLines": [
      `1. app`,
      `   - app sync --server|--client`,
      `   - app start --server|--client`,
      `   - app build --server|--client`,
      `   - app swc <compile|watch|start|build> --server|--client`,
      `   - alias: project`,
    ],
    "handle": handleProjectCategory,
  },
  {
    "name": `config`,
    "order": 2,
    "usage": `Usage: bun run config <target> <mode>`,
    "helpLines": [
      `2. config`,
      `   - config ai <to-local|to-jnode>`,
      `   - config vscode <to-local|to-jnode>`,
      `   - alias: fs`,
    ],
    "handle": handleFsCategory,
  },
  {
    "name": `repo`,
    "order": 3,
    "usage": `Usage: bun run repo <action> [options]`,
    "helpLines": [
      `3. repo`,
      `   - repo fetch`,
      `   - repo push --y|--n`,
      `   - alias: git`,
    ],
    "handle": handleGitCategory,
  },
  {
    "name": `ops`,
    "order": 4,
    "usage": `Usage: bun run ops <action>`,
    "helpLines": [
      `4. ops`,
      `   - ops kill-node`,
      `   - ops sql-result`,
      `   - ops selected`,
      `   - alias: ps`,
    ],
    "handle": handlePsCategory,
  },
  {
    "name": `tools`,
    "order": 5,
    "usage": `Usage: bun run tools <action>`,
    "helpLines": [
      `5. tools`,
      `   - tools fix`,
      `   - tools sort`,
      `   - tools reset`,
      `   - tools remove`,
      `   - alias: utils`,
    ],
    "handle": handleUtilsCategory,
  },
];
const CATEGORY_CONFIG_MAP = Object.fromEntries(CATEGORY_CONFIG_LIST.map((categoryConfig) => {
  const categoryEntry = [
    categoryConfig.name,
    categoryConfig,
  ];
  const result = categoryEntry;

  return result;
}));

const printGlobalHelp = () => {
  const orderedCategoryList = [...CATEGORY_CONFIG_LIST].sort((leftCategory, rightCategory) => {
    const result = leftCategory.order - rightCategory.order;

    return result;
  });
  const helpLines = [
    `${PACKAGE_JSON.name || `jnode`} v${PACKAGE_JSON.version || `0.0.0`}`,
    ``,
    `Usage: bun .node/mjs/shared.mjs --release|--app|--config|--repo|--ops|--tools [args]`,
    `Legacy aliases: --etc|--project|--fs|--git|--ps|--utils`,
    ``,
    ...orderedCategoryList.flatMap((categoryConfig) => categoryConfig.helpLines),
  ];

  console.log(helpLines.join(`\n`));
};

const printCategoryHelp = (categoryConfig = null) => {
  if (!categoryConfig) {
    printGlobalHelp();
    return;
  }

  const helpLines = [
    `${PACKAGE_JSON.name || `jnode`} v${PACKAGE_JSON.version || `0.0.0`}`,
    ``,
    categoryConfig.usage,
    ``,
    ...categoryConfig.helpLines,
  ];

  console.log(helpLines.join(`\n`));
};

const promptCategorySelection = async () => {
  const orderedCategoryList = [...CATEGORY_CONFIG_LIST].sort((leftCategory, rightCategory) => {
    const result = leftCategory.order - rightCategory.order;

    return result;
  });
  const interactiveOptions = orderedCategoryList.map((categoryConfig) => {
    const interactiveOption = {
      "label": categoryConfig.name,
      "run": () => categoryConfig,
    };
    const result = interactiveOption;

    return result;
  });
  const selectedOption = await promptMenuSelection(`[shared] 실행할 분류를 선택하세요.`, interactiveOptions);
  const result = selectedOption.run();

  return result;
};

const runCategory = async (categoryName = ``, argv = [], categoryContext = {}) => {
  const normalizedCategoryName = normalizeCategoryName(categoryName);
  const categoryConfig = Object.hasOwn(CATEGORY_CONFIG_MAP, normalizedCategoryName)
    ? CATEGORY_CONFIG_MAP[normalizedCategoryName]
    : null;

  if (!categoryConfig) {
    exitWithCliError(`지원하지 않는 분류입니다: ${normalizedCategoryName}`);
    return;
  }

  const mode = categoryContext.mode || `positional`;
  const matchedFlag = categoryContext.matchedFlag || ``;
  const categoryArgv = mode === `flag`
    ? removeCategoryFlag(argv, matchedFlag)
    : removeFirstPositionalArg(argv);
  const options = parseOptionFlags(categoryArgv);

  await categoryConfig.handle(categoryArgv, options);
};

const main = async () => {
  const argv = process.argv.slice(2);
  const positionalArgs = parsePositionalArgs(argv);
  const categorySelectionFromFlag = resolveCategorySelectionFromFlags(argv);
  const categoryNameFromFlag = categorySelectionFromFlag.categoryName;
  const categoryNameFromPositional = normalizeCategoryName(String(positionalArgs[0] || ``).trim());
  const categoryName = categoryNameFromFlag || categoryNameFromPositional;
  const categoryResolveMode = categoryNameFromFlag !== ``
    ? `flag`
    : `positional`;
  const categoryConfig = Object.hasOwn(CATEGORY_CONFIG_MAP, categoryName)
    ? CATEGORY_CONFIG_MAP[categoryName]
    : null;
  const shouldPrintHelp = argv.includes(`--help`) || argv.includes(`-h`);

  if (shouldPrintHelp) {
    printCategoryHelp(categoryConfig);
    return;
  }

  if (categoryName === ``) {
    const selectedCategory = await promptCategorySelection();

    await selectedCategory.handle([], {});
    return;
  }

  await runCategory(categoryName, argv, {
    "mode": categoryResolveMode,
    "matchedFlag": categorySelectionFromFlag.matchedFlag,
  });
};

if (isDirectRun(import.meta.url)) {
  await main();
}

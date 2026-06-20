/**
 * @file notify.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import { vscode } from "@exportLibs";

const MAIN = `Jlint`;
const AUTO_CLOSE_MS = 1000;
const LOG_CONFIG = {
  "debug": {
    "str": `[D]`,
  },
  "info": {
    "str": `[I]`,
  },
  "hint": {
    "str": `[H]`,
  },
  "warn": {
    "str": `[W]`,
  },
  "error": {
    "str": `[E]`,
  },
} as const;

type NotifyType = keyof typeof LOG_CONFIG;

// 1. Show progress ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
const showProgress = async (text: string): Promise<void> => {
  await vscode.window.withProgress(
    {
      "location": vscode.ProgressLocation.Notification,
      "title": text,
      "cancellable": false,
    },
    async () => {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, AUTO_CLOSE_MS);
      });
    },
  );
};

// 2. Format notify ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
const formatNotify = (type: NotifyType, value: string): string => `[${MAIN}] ${LOG_CONFIG[type].str} ${value}`;

// 3. Notify ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const notify = async (type: NotifyType, value: string): Promise<void> => {
  await showProgress(formatNotify(type, value));
};

// 4. Modal ―――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――
export const modal = (type: `info` | `warn` | `error`, value: string): Thenable<string | undefined> => {
  const text = `[${MAIN}] ${value}`;
  const options = {
    "modal": true,
  };

  if (type === `info`) {
    return vscode.window.showInformationMessage(text, options);
  }
  if (type === `warn`) {
    return vscode.window.showWarningMessage(text, options);
  }
  return vscode.window.showErrorMessage(text, options);
};

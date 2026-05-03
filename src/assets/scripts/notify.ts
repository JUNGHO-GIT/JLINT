/**
 * @file notify.ts
 * @description foo
 * @author Jungho
 * @since 2026-1-4
 */

import { vscode } from "@exportLibs";

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
const MAIN = `Jlint`;
const AUTO_CLOSE_MS = 1000;

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
const showProgress = async (text: string): Promise<void> => {
  await vscode.window.withProgress({
    cancellable: false,
    location: vscode.ProgressLocation.Notification,
    title: text,
  },
  async (_) => {
    await new Promise((res) => {
      setTimeout(res, AUTO_CLOSE_MS);
    });
  });
};

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const notify = async (
  type: `debug` | `info` | `hint` | `warn` | `error`,
  value: string,
): Promise<void> => {
  const config = {
    debug: {
      str: `[DEBUG]`,
    },
    error: {
      str: `[ERROR]`,
    },
    hint: {
      str: `[HINT]`,
    },
    info: {
      str: `[INFO]`,
    },
    title: {
      str: `[${MAIN}]`,
    },
    warn: {
      str: `[WARN]`,
    },
  };
  const text = `${config.title.str} ${config[type].str} ${value}`;

  type === `debug` && await showProgress(text);
  type === `info` && await showProgress(text);
  type === `hint` && await showProgress(text);
  type === `warn` && await showProgress(text);
  type === `error` && await showProgress(text);
};

// ――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――――-
export const modal = (
  type: `info` | `warn` | `error`,
  value: string,
): Thenable<string | undefined> => {
  const text = `[${MAIN}] ${value}`;
  const options = {
    modal: true,
  };

  const result = (
		type === `info` ? (
			vscode.window.showInformationMessage(text, options)
		) : type === `warn` ? (
			vscode.window.showWarningMessage(text, options)
		) : (
			vscode.window.showErrorMessage(text, options)
		)
  );

  return result;
};

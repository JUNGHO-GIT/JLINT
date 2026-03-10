/**
 * @file env.mjs
 * @description PowerShell env.psm1 path constants (ESM)
 * @author Jungho
 * @since 2026-03-06
 */

// 1. 경로 환경 상수 --------------------------------------------------------------------------
export const envPaths = {
  "gitRoot": `C:\\git`,
  "outputDir": `C:\\Users\\jungh\\Downloads`,
  "workspaceRoot": `C:\\JUNGHO\\5.Ide\\0.Vscode\\Workspace\\2.Project`,
  "workspaceNode": `C:\\JUNGHO\\5.Ide\\0.Vscode\\Workspace\\2.Project\\2.Node`,
  "workspaceNodeJnode": `C:\\JUNGHO\\5.Ide\\0.Vscode\\Workspace\\2.Project\\2.Node\\JNODE`,
  "vsixDstPath": `C:\\JUNGHO\\5.Ide\\0.Vscode\\Workspace\\2.Project\\2.Node\\JNODE\\src\\public\\vscode\\vsix`,
  "bunPath": `C:\\Users\\jungh\\.bun\\bin\\bun.exe`,
};

// 하위 호환성을 위한 별칭 --------------------------------------------------------------------
export const ENV = {
  "ENV_GIT_ROOT": envPaths.gitRoot,
  "ENV_OUTPUT_DIR": envPaths.outputDir,
  "ENV_WORKSPACE_ROOT": envPaths.workspaceRoot,
  "ENV_WORKSPACE_NODE": envPaths.workspaceNode,
  "ENV_WORKSPACE_NODE_JNODE": envPaths.workspaceNodeJnode,
  "ENV_VSIX_DST_PATH": envPaths.vsixDstPath,
  "ENV_BUN_PATH": envPaths.bunPath,
};

/**
 * @file settings.mjs
 * @description 프로젝트 공통 설정 (ESM)
 * @author Jungho
 * @since 2025-12-02
 */

// 1. 프로젝트 설정 --------------------------------------------------------------------------
export const settings = {
	"git": {
		"remotes": {
			"public": {"name": `public`, "branch": `public/main`},
			"private": {"name": `private`, "branch": `private/main`},
		},
		"deploy": {"resetBranch": `private/private/main`},
	},
	"cdn": {
		"owner": `JUNGHO-GIT`,
		"repo": `JNODE`,
		"repoPrivate": `JNODE_PRIVATE`,
		"defaultRemote": `private`,
		"defaultCdn": `rawGithub`,
		"folders": [
			// 1. node -------------------------------------------------------------------------------
			{
				"sourcePath": `src/public/node/lib`,
				"targetPath": `.node/lib`,
				"files": [
					`settings.mjs`,
					`utils.mjs`,
				],
			},
			{
				"sourcePath": `src/public/node/mjs`,
				"targetPath": `.node/mjs`,
				"files": [
					`sync.mjs`,
					`swc.mjs`,
					`git.mjs`,
					`fix.mjs`,
					`reset.mjs`,
					`gcloud.mjs`,
					`vsce.mjs`,
				],
			},

			// 2. github --------------------------------------------------------------------------------
			{
				"sourcePath": `src/public/github`,
				"targetPath": `.github`,
				"files": [
					`copilot-instructions.md`,
				],
			},
			{
				"sourcePath": `src/public/github`,
				"targetPath": ``,
				"files": [
					`.gitattributes`,
					`.gitignore.public`,
					`.gitignore.private`,
				],
			},

			// 3. config --------------------------------------------------------------------------------
			{
				"sourcePath": `src/public/config`,
				"targetPath": ``,
				"files": [
					`.server.swcrc`,
					`eslint.config.mjs`,
				],
			},
			{
				"sourcePath": `src/public/config`,
				"targetPath": `client`,
				"files": [
					`.client.swcrc`,
					`eslint.config.mjs`,
				],
			},
		],
	},
};

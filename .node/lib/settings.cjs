/**
 * @file settings.cjs
 * @description 
 * @author Jungho
 * @since 2025-12-2
 */

// 프로젝트 설정 -------------------------------------------------------------------------------
const settings = {
	git: {
		remotes: {
			public: {
				name: `public`,
				branch: `public/main`
			},
			private: {
				name: `private`,
				branch: `private/main`
			}
		},
		deploy: {
			resetBranch: `private/private/main`
		}
	},
	cdn: {
		owner: `JUNGHO-GIT`,
		repo: `JNODE`,
		repoPrivate: `JNODE_PRIVATE`,
		defaultRemote: `private`,
		defaultCdn: `rawGithub`,
		folders: [
			{
				sourcePath: `src/public/node/cjs`,
				targetPath: `.node/cjs`,
				files: [`swc.cjs`, `git.cjs`, `fix.cjs`, `reset.cjs`, `gcloud.cjs`, `vsce.cjs`, `sync.cjs`],
			},
			{
				sourcePath: `src/public/node/lib`,
				targetPath: `.node/lib`,
				files: [`utils.cjs`, `settings.cjs`],
			},
			{
				sourcePath: `src/public/github`,
				targetPath: `.github`,
				files: [`copilot-instructions.md`],
			},
			{
				sourcePath: `src/public/github`,
				targetPath: ``,
				files: [`.gitattributes`, `.gitignore.public`, `.gitignore.private`],
			},
		],
	},
};

// 모듈 내보내기 -------------------------------------------------------------------------------
module.exports = {
	settings
};
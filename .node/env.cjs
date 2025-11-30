/**
 * @file env.cjs
 * @since 2025-11-30
 */

// 프로젝트 설정 -------------------------------------------------------------------------------
const CONFIG = {
	domain: `junghomun.com`,
	projectName: `LIFECHANGE`,
	serverIp: `104.196.212.101`,
	localPort: {
		client: 3000,
		server: 4001
	},
	gcp: {
		bucket: `jungho-bucket`,
		path: `LIFECHANGE/SERVER/build.tar.gz`,
		callback: `api/auth/google/callback`,
	},
	ssh: {
		win: {
			keyPath: `C:\\Users\\jungh\\.ssh\\JKEY`,
			serviceId: `junghomun00`
		},
		linux: {
			keyPath: `~/ssh/JKEY`,
			serviceId: `junghomun1234`
		}
	},
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
};

// 모듈 내보내기 -------------------------------------------------------------------------------
module.exports = {
	CONFIG
};
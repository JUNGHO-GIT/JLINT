/**
 * @file env.cjs
 * @description 
 * @author Jungho
 * @since 2025-12-2
 */

// 프로젝트 설정 -------------------------------------------------------------------------------
const env = {
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
};

// 모듈 내보내기 -------------------------------------------------------------------------------
module.exports = {
	env
};
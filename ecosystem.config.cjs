/**
 * @file ecosystem.config.cjs
 * @description PM2 설정 파일 (멀티 프로젝트 통합)
 */

// 1. 공통 앱 생성기 --------------------------------------------------------------------------------
const createApp = ({ name, cwd }) => ({
  name: name,
  cwd: cwd,
  script: `node_modules/tsx/dist/cli.cjs`,
  args: [ `--tsconfig`, `tsconfig.json`, `index.ts` ],
  interpreter: `node`,
  watch: false,
  log_date_format: `YYYY-MM-DD HH:mm Z`,
  env_production: {
    NODE_ENV: `production`,
    ENV_MODE: `PRODUCTION`,
  },
  env_development: {
    NODE_ENV: `development`,
    ENV_MODE: `DEVELOPMENT`,
  },
});

// 2. 앱 목록 ----------------------------------------------------------------------------------------
module.exports = {
  apps: [
    // 2-1. JPORTFOLIO
    createApp({
      name: `JPORTFOLIO`,
      cwd: `/var/www/junghomun.com/JPORTFOLIO/server`,
    }),

    // 2-2. LIFECHANGE
    createApp({
      name: `LIFECHANGE`,
      cwd: `/var/www/junghomun.com/LIFECHANGE/server`,
    }),

    // 2-3. PAJUKAESONG
    createApp({
      name: `PAJUKAESONG`,
      cwd: `/var/www/pajukaesong.com/PAJUKAESONG/server`,
    }),
  ],
};

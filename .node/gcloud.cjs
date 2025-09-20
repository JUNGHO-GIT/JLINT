// gcloud.cjs

const os = require('os');
const fs = require('fs');
const { execSync } = require('child_process');

const winOrLinux = os.platform() === 'win32' ? "win" : "linux";
console.log(`Activated OS is : ${winOrLinux}`);

// changelog 수정 ----------------------------------------------------------------------------------
const modifyChangelog = () => {
  try {

    // ex. 2024-11-03 (16:23:24)
    const currentDate = new Date().toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });

    const currentTime = new Date().toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const changelog = fs.readFileSync('changelog.md', 'utf8');
    const versionPattern = /(\s*)(\d+[.]\d+[.]\d+)(\s*)/g;
    const matches = [...changelog.matchAll(versionPattern)];
    const lastMatch = matches[matches.length - 1];
    const lastVersion = lastMatch[2];
    const versionArray = lastVersion.split('.');
    versionArray[2] = (parseInt(versionArray[2]) + 1).toString();

    let newVersion = `\\[ ${versionArray.join('.')} \\]`;
    let newDateTime = `- ${currentDate} (${currentTime})`;
    newDateTime = newDateTime.replace(/([.]\s*[(])/g, ' (');
    newDateTime = newDateTime.replace(/([.]\s*)/g, '-');
    newDateTime = newDateTime.replace(/[(](\W*)(\s*)/g, '(');

    let newEntry = `\n## ${newVersion}\n\n${newDateTime}\n`;

    const updatedChangelog = changelog + newEntry;

    fs.writeFileSync('changelog.md', updatedChangelog, 'utf8');
  }
  catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// git push (public) -------------------------------------------------------------------------------
const gitPushPublic = () => {
  try {
    const ignoreFile = ".gitignore";
    const ignorePublicFile = fs.readFileSync(".gitignore.public", "utf8");
    fs.writeFileSync(ignoreFile, ignorePublicFile, "utf8");

    const gitRmCached = (
      'git rm -r --cached .'
    );
    const gitAdd = (
      'git add .'
    );
    const gitCommit = (
      winOrLinux === "win"
      ? 'git commit -m \"%date% %time:~0,8%\"'
      : 'git commit -m \"$(date +%Y-%m-%d) $(date +%H:%M:%S)\"'
    );
    const gitPushPublic = (
      'git push origin master'
    );

    execSync(gitRmCached, { stdio: 'inherit' });
    execSync(gitAdd, { stdio: 'inherit' });
    execSync(gitCommit, { stdio: 'inherit' });
    execSync(gitPushPublic, { stdio: 'inherit' });

    fs.writeFileSync(ignoreFile, ignorePublicFile, "utf8");
  }
  catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// git push (private) ------------------------------------------------------------------------------
const gitPushPrivate = () => {
  try {
    const ignoreFile = ".gitignore";
    const ignorePublicFile = fs.readFileSync(".gitignore.public", "utf8");
    const ignorePrivateFile = fs.readFileSync(".gitignore.private", "utf8");
    fs.writeFileSync(ignoreFile, ignorePrivateFile, "utf8");

    const gitRmCached = (
      'git rm -r --cached .'
    );
    const gitAdd = (
      'git add .'
    );
    const gitCommit = (
      winOrLinux === "win"
      ? 'git commit -m \"%date% %time:~0,8%\"'
      : 'git commit -m \"$(date +%Y-%m-%d) $(date +%H:%M:%S)\"'
    );
    const gitPushPrivate = (
      'git push private master'
    );

    execSync(gitRmCached, { stdio: 'inherit' });
    execSync(gitAdd, { stdio: 'inherit' });
    execSync(gitCommit, { stdio: 'inherit' });
    execSync(gitPushPrivate, { stdio: 'inherit' });

    fs.writeFileSync(ignoreFile, ignorePublicFile, "utf8");
  }
  catch (error) {
    console.error(error);
    process.exit(1);
  }
};

// -------------------------------------------------------------------------------------------------
modifyChangelog();
gitPushPublic();
gitPushPrivate();
process.exit(0);
const child_process = require('child_process');
const fs = require('fs-extra');

const commit = child_process
  .execSync('git show -s --format=%H')
  .toString()
  .trim();

const version = child_process
  .execSync('git describe --abbrev=0 --tags')
  .toString()
  .trim();

const info = { commit, version };
const path = './_version.json';

fs.ensureFileSync(path);
fs.writeJsonSync(path, info);

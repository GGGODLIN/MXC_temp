const colors = require('../src/layouts/theme.js');
const fs = require('fs-extra');

const { lightVariables, darkVariables } = colors;
const ligthStr = Object.entries(lightVariables)
  .map(([key, value]) => `${key}: ${value};`)
  .join('\n');
const darkStr = Object.entries(darkVariables)
  .map(([key, value]) => `${key}: ${value};`)
  .join('\n');

const less = `
  .light-vars() {
    ${ligthStr}
  }
  .dark-vars() {
    ${darkStr}
  }
`;

fs.writeFileSync('./src/_colors.less', less, 'utf8');

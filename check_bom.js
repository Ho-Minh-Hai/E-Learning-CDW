const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'fe', 'src', 'components', 'AssignmentDetail.css');
const buffer = fs.readFileSync(cssPath);

console.log('Hex bytes:', buffer.slice(0, 20).toString('hex'));
console.log('Text representation:', buffer.slice(0, 20).toString('utf8'));

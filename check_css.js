const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'fe', 'src', 'App.css');
const content = fs.readFileSync(cssPath, 'utf8');

let braceCount = 0;
let lineNum = 1;
let charNum = 1;

for (let i = 0; i < content.length; i++) {
    const char = content[i];
    if (char === '\n') {
        lineNum++;
        charNum = 1;
    } else {
        charNum++;
    }

    if (char === '{') {
        braceCount++;
    } else if (char === '}') {
        braceCount--;
        if (braceCount < 0) {
            console.log(`Extra closing brace found at line ${lineNum}, char ${charNum}`);
        }
    }
}

console.log(`Final brace count: ${braceCount}`);

const fs = require('fs');
const content = fs.readFileSync('frontend/assets/js/app.js', 'utf8');

let braces = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  for (let char of line) {
    if (char === '{') braces++;
    if (char === '}') braces--;
  }
  if (braces === 0 && i > 10 && i < lines.length - 10) {
    console.log(`Potential class closure at line ${i + 1}: ${line.trim()}`);
  }
}

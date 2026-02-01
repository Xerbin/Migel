const fs = require('fs');
const path = require('path');
const { tokenize } = require('./lexer');
const { createParser } = require('./parser');

function transpile(sourceCode, inputFile) {
  const tokens = tokenize(sourceCode);
  const parser = createParser(tokens);
  const jsCode = parser.parse();
  
  return `// Auto-generated from ${inputFile}\nrequire('./migel-builtins.js');${jsCode}`;
}

function writeOutput(jsCode, inputFile) {
  const outputFile = path.basename(inputFile, '.migel') + '.js';
  fs.writeFileSync(outputFile, jsCode);
  console.log(`✨ Transpiled ${inputFile} → ${outputFile}`);
  console.log(`🚀 Run it with: node ${outputFile}`);
}

module.exports = { transpile, writeOutput };
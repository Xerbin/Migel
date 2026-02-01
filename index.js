#!/usr/bin/env node
const fs = require('fs');
const { transpile, writeOutput } = require('./transpiler');

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: node index.js <input.migel>');
  process.exit(1);
}

const code = fs.readFileSync(inputFile, 'utf8');
const jsCode = transpile(code, inputFile);
writeOutput(jsCode, inputFile);
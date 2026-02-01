// migel-builtins.js
const read = require('readline-sync');

module.exports = {
  exception: (msg) => { throw new Error(String(msg)); },
  sleep: (ms) => new Promise(r => setTimeout(r, Number(ms))),
  write: (...str) => {
    for (const m of str) {
      process._rawDebug(String(m));
    }
  },
  read: (prompt) => {
    if (prompt) {
      return read.question(String(prompt));
    } else {
      return read.question();
    }
  },
};

Object.assign(globalThis, module.exports);
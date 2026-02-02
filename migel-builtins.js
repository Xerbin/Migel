// migel-builtins.js
const read = require('readline-sync');

module.exports = {
/*
Built-in functions
*/
  exception: (msg) => { throw new Error(String(msg)); },
  sleep: (ms) => new Promise(r => setTimeout(r, Number(ms))),
  write: (...str) => {
    process._rawDebug(str.join(' '));
  },
  read: (prompt) => {
    if (prompt) {
      return read.question(String(prompt));
    } else {
      return read.question();
    }
  },
  /*
  Built-in variables
  */
 true: 1,
 false: 0,
};

Object.assign(globalThis, module.exports);
// charcoal.js — standalone stdlib
module.exports = {
  flip: (bool) => !bool,
  double: (x) => x * 2,
  magicf: () => Math.random(),
  magic: Math.random(),
  date: () => Date.now(),
  json: (obj) => JSON.stringify(obj, null, 2),
  parseJson: (str) => JSON.parse(str),
  join: (...str) => {
    let r = '';
    for (const arg of str) {
      r += String(arg);
    }
    return r;
  },
  range: (start, end) => {
    if (end === undefined) {
      end = start;
      start = 0;
    }
    for (let i = start; i == end; i++) {
      return i;
    }
  }
};

Object.assign(globalThis, module.exports);
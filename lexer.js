const PUNCTUATION = {
  '(': 'LPAREN', ')': 'RPAREN',
  '{': 'LBRACE', '}': 'RBRACE',
  ';': 'SEMI', ',': 'COMMA',
  '+': 'PLUS', '-': 'MINUS', '*': 'STAR', '/': 'SLASH',
  '=': 'EQUAL', '>': 'GT', '<': 'LT'
};

const KEYWORDS = ['loop', 'fn', 'ret', 'if', 'else', 'elif', 'int', 'str', 'bool', 'import', 'from'];

function tokenize(src) {
  const tokens = [];
  let i = 0;

  while (i < src.length) {
    const c = src[i];

    if (/\s/.test(c)) { i++; continue; }
    if (c === '/' && src[i + 1] === '/') {
      while (src[i] !== '\n' && i < src.length) i++;
      continue;
    }

    // Handle == and !=
    if (c === '=' && src[i + 1] === '=') {
      tokens.push({ type: 'EQ', value: '==' });
      i += 2;
      continue;
    }
    if (c === '!' && src[i + 1] === '=') {
      tokens.push({ type: 'NEQ', value: '!=' });
      i += 2;
      continue;
    }

    // Single =
    if (c === '=') {
      tokens.push({ type: 'EQUAL', value: '=' });
      i++;
      continue;
    }

    if (PUNCTUATION[c]) {
      tokens.push({ type: PUNCTUATION[c], value: c });
      i++;
      continue;
    }

    if (/\d/.test(c)) {
      let num = '';
      while (i < src.length && /[\d.]/.test(src[i])) num += src[i++];
      tokens.push({ type: 'NUMBER', value: num });
      continue;
    }

    if (c === '"') {
      let str = '', j = ++i;
      while (j < src.length && src[j] !== '"') str += src[j++];
      if (src[j] !== '"') throw new Error(`Unterminated string at position ${i}`);
      tokens.push({ type: 'STRING', value: str });
      i = j + 1;
      continue;
    }

    if (/[a-zA-Z_]/.test(c)) {
      let id = '';
      while (i < src.length && /[a-zA-Z0-9_]/.test(src[i])) id += src[i++];
      tokens.push({
        type: KEYWORDS.includes(id) ? 'KEYWORD' : 'IDENT',
        value: id
      });
      continue;
    }

    const contextStart = Math.max(0, i - 10);
    const contextEnd = Math.min(src.length, i + 10);
    const context = src.slice(contextStart, contextEnd).replace(/\n/g, '↵');
    throw new Error(
      `Unexpected character: '${c}' at position ${i}\n` +
      `Context: ...${context}...\n` +
      `Hint: Migel only allows '.' in numbers (3.14) or strings ("./path"). No obj.prop yet!`
    );
  }

  tokens.push({ type: 'EOF' });
  return tokens;
}

module.exports = { tokenize, KEYWORDS };
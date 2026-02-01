function createParser(tokens) {
  let pos = 0;

  const peek = (n = 0) => tokens[pos + n] || { type: 'EOF' };
  const consume = (type) => {
    if (peek().type !== type)
      throw new Error(`Expected ${type}, got ${peek().type} (${peek().value}) at position ${pos}`);
    return tokens[pos++].value;
  };

  const optionalSemi = () => {
    if (peek().type === 'SEMI') pos++;
  };

  function statement() {
    // Skip type annotations
    if (peek().type === 'KEYWORD' && ['int', 'str', 'bool'].includes(peek().value)) {
      pos++;
    }

    // IMPORT statements
    if (peek().value === 'import') {
      pos++;
      if (peek().type === 'LBRACE') {
        consume('LBRACE');
        const names = [];
        names.push(consume('IDENT'));
        while (peek().type === 'COMMA') {
          pos++;
          names.push(consume('IDENT'));
        }
        consume('RBRACE');
        if (peek().value !== 'from')
          throw new Error(`Expected "from", got ${peek().value}`);
        pos++;
        const pkg = consume('STRING');
        optionalSemi();
        return `const {${names.join(',')}} = require("${pkg}");`;
      } else if (peek().type === 'STRING') {
        const pkg = consume('STRING');
        optionalSemi();
        return `require("${pkg}");`;
      } else if (peek().type === 'IDENT') {
        const pkg = consume('IDENT');
        if (peek().value === 'as') {
          pos++;
          const alias = consume('IDENT');
          optionalSemi();
          return `const ${alias} = require("${pkg}");`;
        } else {
          optionalSemi();
          return `const ${pkg} = require("${pkg}");`;
        }
      } else {
        throw new Error(`Unexpected import syntax at position ${pos}`);
      }
    }

    // GIMME
    if (peek().value === 'gimme') {
      pos++; consume('LPAREN');
      const expr = expression();
      consume('RPAREN');
      optionalSemi();
      return `console.log(${expr});`;
    }

    // ✨ IF STATEMENTS (with full else-if support) ✨
    // ✨ IF STATEMENTS with ELIF support ✨
    if (peek().value === 'if') {
      pos++; consume('LPAREN');
      const condition = expression();
      consume('RPAREN'); consume('LBRACE');
      const thenBody = block();
      consume('RBRACE');

      let elseClause = '';

      // Handle multiple elif clauses
      while (peek().value === 'elif') {
        pos++; // skip 'elif'
        consume('LPAREN');
        const elifCondition = expression();
        consume('RPAREN'); consume('LBRACE');
        const elifBody = block();
        consume('RBRACE');
        elseClause += `else if(${elifCondition}){${elifBody}}`;
      }

      // Handle final else
      if (peek().value === 'else') {
        pos++; // skip 'else'
        consume('LBRACE');
        const elseBody = block();
        consume('RBRACE');
        elseClause += `else{${elseBody}}`;
      }

      optionalSemi();
      return `if(${condition}){${thenBody}}${elseClause}`;
    }
    // ASSIGNMENT
    if (peek().type === 'IDENT' && peek(1).type === 'EQUAL') {
      const id = consume('IDENT');
      consume('EQUAL');
      const expr = expression();
      optionalSemi();
      return `${id}=${expr};`;
    }

    // OTHER KEYWORDS
    if (peek().type === 'KEYWORD') {
      const kw = peek().value;
      if (kw === 'loop') {
        pos++; consume('LPAREN');
        const count = expression();
        consume('RPAREN'); consume('LBRACE');
        const body = block();
        consume('RBRACE');
        optionalSemi();
        return `for(let index=0;index<${count};index++){${body}}`;
      }
      if (kw === 'fn') {
        pos++; const name = consume('IDENT'); consume('LPAREN');
        let params = [];
        if (peek().type !== 'RPAREN') {
          params.push(consume('IDENT'));
          while (peek().type === 'COMMA') {
            pos++;
            params.push(consume('IDENT'));
          }
        }
        consume('RPAREN'); consume('LBRACE');
        const body = block();
        consume('RBRACE');
        optionalSemi();
        return `function ${name}(${params.join(',')}){${body}}`;
      }
      if (kw === 'ret') {
        pos++; const expr = expression();
        optionalSemi();
        return `return ${expr};`;
      }
    }

    // BARE EXPRESSIONS
    const expr = expression();
    optionalSemi();
    return `${expr};`;
  }

  function expression() {
    let expr = term();
    while (['GT', 'LT', 'EQ', 'NEQ'].includes(peek().type)) {
      if (peek().type === 'GT') {
        pos++; expr += '>' + primary();
      } else if (peek().type === 'LT') {
        pos++; expr += '<' + primary();
      } else if (peek().type === 'EQ') {
        pos++; expr += '==' + primary();
      } else if (peek().type === 'NEQ') {
        pos++; expr += '!=' + primary();
      }
    }
    return expr;
  }

  function term() {
    let expr = factor();
    while (['PLUS', 'MINUS'].includes(peek().type)) {
      const op = consume(peek().type);
      expr += op + factor();
    }
    return expr;
  }

  function factor() {
    let expr = primary();
    while (['STAR', 'SLASH'].includes(peek().type)) {
      const op = consume(peek().type);
      expr += op + primary();
    }
    return expr;
  }

  function primary() {
    const tok = peek();
    if (tok.type === 'NUMBER') return consume('NUMBER');
    if (tok.type === 'STRING') return `"${consume('STRING')}"`;
    if (tok.type === 'IDENT') {
      const id = consume('IDENT');
      if (peek().type === 'LPAREN') {
        consume('LPAREN');
        const args = [];
        if (peek().type !== 'RPAREN') {
          args.push(expression());
          while (peek().type === 'COMMA') {
            pos++;
            args.push(expression());
          }
        }
        consume('RPAREN');
        return `${id}(${args.join(',')})`;
      }
      return id;
    }
    if (tok.type === 'LPAREN') {
      consume('LPAREN');
      const expr = expression();
      consume('RPAREN');
      return `(${expr})`;
    }
    throw new Error(`Unexpected primary: ${JSON.stringify(tok)} at position ${pos}`);
  }

  function block() {
    let body = '';
    while (peek().type !== 'RBRACE' && peek().type !== 'EOF') {
      body += statement();
    }
    return body;
  }

  return { parse: () => block() };
}

module.exports = { createParser };
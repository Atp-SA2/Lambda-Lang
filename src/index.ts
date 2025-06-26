import { readFileSync } from 'fs';
import { lexer } from './lexer';
import { parser } from './parser';
import { interpret } from './interpreter';

function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Uso: node dist/index.js <arquivo.llang>');
    process.exit(1);
  }
  const code = readFileSync(file, 'utf-8');
  const tokens = lexer(code);
  const ast = parser(tokens);
  interpret(ast);
}

main();

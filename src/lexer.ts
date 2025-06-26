// Lexer aprimorado para LambdaLang
export type TokenType = 'IDENT' | 'KEYWORD' | 'NUMBER' | 'SYMBOL' | 'STRING';
export interface Token {
  type: TokenType;
  value: string;
  line: number;
  col: number;
}

const keywords = [
  'class', 'interface', 'public', 'private', 'protected', 'internal', 'abstract', 'static', 'override', 'final',
  'void', 'Int', 'Float', 'Bool', 'Char', 'String', 'new', 'super', 'if', 'else', 'for', 'while', 'do', 'break', 'continue', 'return', 'try', 'catch', 'finally', 'throw'
];

export function lexer(input: string): Token[] {
  // Remove comentários de linha antes de tokenizar
  input = input.replace(/^\s*\/\/.*$/gm, '');
  const regex = /([a-zA-Z_][a-zA-Z0-9_\.]*)|([0-9]+(?:\.[0-9]+)?)|([{}();=:+\-*\/,&<>!\[\]]|\.|\,)|("[^"]*")|(\s+)|(\/\/.*)/g;
  const tokens: Token[] = [];
  let match;
  let line = 1, col = 1;
  while ((match = regex.exec(input)) !== null) {
    if (match[5]) { // espaço
      line += (match[5].match(/\n/g) || []).length;
      col = 1;
      continue;
    }
    if (match[6]) continue; // comentário: ignora completamente
    let value = match[1] || match[2] || match[3] || match[4];
    let type: TokenType = 'IDENT';
    if (keywords.includes(value)) type = 'KEYWORD';
    else if (match[2]) type = 'NUMBER';
    else if (match[3]) type = 'SYMBOL';
    else if (match[4]) type = 'STRING';
    tokens.push({ type, value, line, col });
    col += value.length;
  }
  return tokens;
}

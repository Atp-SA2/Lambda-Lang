// Parser real para classes, atributos e métodos (versão simplificada)
import { Token, TokenType } from './lexer';
import { ProgramNode, ASTNode, ClassDeclNode, FieldDeclNode, MethodDeclNode, Modifier, ParamNode } from './ast';

function expect(tokens: Token[], type: string, value?: string) {
  const token = tokens.shift();
  if (!token || token.type !== type || (value && token.value !== value)) {
    throw new Error(`Esperado ${type} ${value || ''}, mas encontrou ${token ? token.value : 'EOF'}`);
  }
  return token;
}

function parseModifiers(tokens: Token[]): Modifier[] {
  const modifiers: Modifier[] = [];
  while (tokens[0] && tokens[0].type === 'KEYWORD' && ['public','private','protected','internal','abstract','static','override','final'].includes(tokens[0].value)) {
    modifiers.push(tokens.shift()!.value as Modifier);
  }
  return modifiers;
}

function parseType(tokens: Token[]): string {
  if (tokens[0] && (tokens[0].type === 'KEYWORD' || tokens[0].type === 'IDENT')) {
    return tokens.shift()!.value;
  }
  throw new Error('Tipo esperado');
}

function parseParams(tokens: Token[]): ParamNode[] {
  const params: ParamNode[] = [];
  if (tokens[0] && tokens[0].value === ')') return params;
  while (true) {
    const varType = parseType(tokens);
    const name = expect(tokens, 'IDENT').value;
    params.push({ varType, name });
    if (tokens[0] && tokens[0].value === ',') {
      tokens.shift();
      continue;
    }
    break;
  }
  return params;
}

function parseBlock(tokens: Token[]): string[] {
  // Coleta o bloco de código como strings (simples, para transpilar depois)
  let depth = 1;
  let body: string[] = [];
  let code = '';
  while (tokens.length && depth > 0) {
    const t = tokens.shift()!;
    if (t.value === '{') depth++;
    if (t.value === '}') depth--;
    if (depth > 0) code += t.value + ' ';
  }
  body.push(code.trim());
  return body;
}

function parseClass(tokens: Token[]): ClassDeclNode {
  const modifiers = parseModifiers(tokens);
  expect(tokens, 'KEYWORD', 'class');
  const name = expect(tokens, 'IDENT').value;
  let superClass: string | undefined;
  if (tokens[0] && tokens[0].value === ':') {
    tokens.shift();
    superClass = expect(tokens, 'IDENT').value;
  }
  expect(tokens, 'SYMBOL', '{');
  const body: ASTNode[] = [];
  while (tokens[0] && tokens[0].value !== '}') {
    if (tokens[0].type === 'KEYWORD' && ['public','private','protected','internal','abstract','static','override','final'].includes(tokens[0].value)) {
      // Field ou method
      const memberModifiers = parseModifiers(tokens);
      const typeOrVoid = parseType(tokens);
      if (tokens[0] && (tokens[0].type as string) === 'IDENT') {
        const memberName = tokens.shift()!.value;
        if (tokens[0] && tokens[0].value === '(') {
          // Método ou construtor
          tokens.shift();
          const params = parseParams(tokens);
          expect(tokens, 'SYMBOL', ')');
          expect(tokens, 'SYMBOL', '{');
          const bodyBlock = parseBlock(tokens);
          body.push({
            type: memberName === name ? 'ConstructorDecl' : 'MethodDecl',
            name: memberName,
            returnType: typeOrVoid,
            modifiers: memberModifiers,
            params,
            body: bodyBlock
          } as any);
        } else {
          // Campo
          expect(tokens, 'SYMBOL', ';');
          body.push({
            type: 'FieldDecl',
            name: memberName,
            varType: typeOrVoid,
            modifiers: memberModifiers
          } as FieldDeclNode);
        }
      }
    } else {
      tokens.shift(); // ignora tokens desconhecidos
    }
  }
  expect(tokens, 'SYMBOL', '}');
  return {
    type: 'ClassDecl',
    name,
    modifiers,
    superClass,
    body
  };
}

function parseFunctionBlock(tokens: Token[]): string[] {
  // Coleta o bloco de código da função
  let depth = 1;
  let body: string[] = [];
  let code = '';
  while (tokens.length && depth > 0) {
    const t = tokens.shift()!;
    if (t.value === '{') depth++;
    if (t.value === '}') depth--;
    if (depth > 0) code += t.value + ' ';
  }
  body.push(code.trim());
  return body;
}

function parseFunction(tokens: Token[]): any {
  // Suporta funções globais do tipo: system.lang.LLang.function Void nome() { ... }
  while (tokens.length && tokens[0].value !== 'function') tokens.shift();
  tokens.shift(); // function
  const returnType = tokens.shift(); // tipo de retorno
  const name = tokens.shift(); // nome da função
  tokens.shift(); // (
  // ignora params por simplicidade
  while (tokens.length && tokens[0].value !== ')') tokens.shift();
  tokens.shift(); // )
  tokens.shift(); // {
  const bodyBlock = parseFunctionBlock(tokens);
  return {
    type: 'MethodDecl',
    name: name ? name.value : 'unknown',
    returnType: returnType ? returnType.value : 'Void',
    modifiers: [],
    params: [],
    body: bodyBlock
  };
}

export function parser(tokens: Token[]): ProgramNode {
  const body: ASTNode[] = [];
  while (tokens.length) {
    // Ignora comentários de linha (tokens que começam com '//')
    if (tokens[0].type === 'IDENT' && tokens[0].value.startsWith('//')) {
      tokens.shift();
      continue;
    }
    if (tokens[0].type === 'KEYWORD' && tokens[0].value === 'class') {
      body.push(parseClass(tokens));
    } else if (tokens[0].type === 'KEYWORD' && tokens[0].value === 'function') {
      body.push(parseFunction(tokens));
    } else if ((tokens[0].type === 'IDENT' || tokens[0].type === 'KEYWORD') && tokens[0].value.trim() !== '') {
      // Captura instruções globais (variáveis, ponteiros, invokes, etc.)
      let line = '';
      let endsWithSemicolon = false;
      while (tokens.length && tokens[0].value !== ';') {
        line += tokens.shift()!.value + ' ';
      }
      if (tokens.length && tokens[0].value === ';') {
        line += tokens.shift()!.value;
        endsWithSemicolon = true;
      }
      // Só adiciona se terminar com ; (instrução válida)
      if (endsWithSemicolon && line.trim().length > 0 && !line.trim().startsWith('//')) {
        body.push({ type: 'GlobalStatement', code: line.trim() });
      }
    } else {
      tokens.shift();
    }
  }
  return { type: 'Program', body };
}

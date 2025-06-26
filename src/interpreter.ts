import { ProgramNode, ClassDeclNode, FieldDeclNode, MethodDeclNode, ConstructorDeclNode } from './ast';
import { writeFileSync } from 'fs';

function transpileGlobalVar(line: string): string {
  let m = line.match(/var\s+([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*);/);
  if (m) {
    return `let ${m[2]} = ${m[3].replace(/;$/, '')};`;
  }

  m = line.match(/PointerLL\s+var\s+([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*&([A-Za-z_][A-Za-z0-9_]*);/);
  if (m) {
    return `let ${m[2]} = ${m[3]}; // ponteiro simulado`;
  }

  return '';
}

function transpileInvoke(line: string): string {
  const m = line.match(/invoke\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*\)\s*;/);
  if (m) {
    return `${m[1]}();`;
  }
  return '';
}

function transpileBlock(block: string[]): string {
  if (!block || block.length === 0) return '';
  
  let code = block.join('\n');

  // Remover comentários
  code = code.replace(/^\s*\/\/.*$/gm, '');

  // Transpilar comandos específicos
  code = code
    .replace(/system\.lang\.LLang\.var\s+([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*);/g, 'let $2 = $3;')
    .replace(/system\.lang\.LLang\.invoke\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(\s*\)\s*;/g, '$1();')
    .replace(/system\.lang\.LLang\.console\.printLn/g, 'console.log')
    .replace(/\(\*([A-Za-z_][A-Za-z0-9_]*)\)\.([A-Za-z_][A-Za-z0-9_]*)/g, '$1.$2') // ponteiros
    .replace(/([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z_][A-Za-z0-9_]*)\s*\(([^)]*)\)\s*;/g, '$1.$2($3);'); // chamada de método

  // Remover linhas vazias e espaços em branco extras
  return code
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .join('\n');
}

function transpileClass(cls: ClassDeclNode): string {
  let out = `class ${cls.name}`;
  if (cls.superClass) out += ` extends ${cls.superClass}`;
  out += ' {\n';

  for (const member of cls.body) {
    if (member.type === 'FieldDecl') {
      out += `  ${member.name};\n`;
    }
  }

  for (const member of cls.body) {
    if (member.type === 'ConstructorDecl') {
      const params = member.params.map((p: any) => p.name).join(', ');
      const body = transpileBlock(member.body);
      out += `  constructor(${params}) {\n    ${body}\n  }\n`;
    }
  }

  for (const member of cls.body) {
    if (member.type === 'MethodDecl') {
      const params = member.params.map((p: any) => p.name).join(', ');
      const body = transpileBlock(member.body);
      out += `  ${member.name}(${params}) {\n    ${body}\n  }\n`;
    }
  }

  out += '}\n';
  return out;
}

function transpileFunction(fn: any): string {
  const params = fn.params.map((p: any) => p.name).join(', ');
  const body = transpileBlock(fn.body);
  return `function ${fn.name}(${params}) {\n  ${body}\n}\n`;
}

function transpileMainCall(ast: ProgramNode): string {
  const mainClass = ast.body.find(n => n.type === 'ClassDecl' && n.name === 'Main') as ClassDeclNode;
  if (!mainClass) return '';
  const hasStaticMain = mainClass.body.some(m => m.type === 'MethodDecl' && m.name === 'main');
  return hasStaticMain ? 'new Main().main();\n' : '';
}

export function interpret(ast: ProgramNode): void {
  let js = '';

  for (const node of ast.body) {
    if (node.type === 'GlobalStatement') {
      js += transpileBlock([node.code]) + '\n';
    } else if (node.type === 'MethodDecl') {
      js += transpileFunction(node) + '\n';
    } else if (node.type === 'ClassDecl') {
      js += transpileClass(node) + '\n';
    }
  }

  if (js.includes('function entryPoint')) {
    js += '\nentryPoint();\n';
  }

  writeFileSync('LambdaLang/dist/lambdalang.out.js', js);
  console.log('--- Código JavaScript gerado ---\n' + js);
}

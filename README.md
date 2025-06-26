![Logo do LambdaLang](https://cdn.discordapp.com/attachments/1344836248208146435/1387555789492846682/icon.png?ex=685e6e47&is=685d1cc7&hm=86f5207817e066af8701aea38e158138becd2e86244983fa900aeb3c7f7eacf8)

# LambdaLang

Uma linguagem de programação inspirada em Java e C#, criada em TypeScript.

## Estrutura do Projeto
- `src/lexer.ts`: Analisador léxico
- `src/parser.ts`: Analisador sintático
- `src/interpreter.ts`: Interpretador
- `src/index.ts`: Ponto de entrada
- `examples/hello.llang`: Exemplo de código LambdaLang

## Como rodar
1. Instale as dependências:
   ```bash
   npm install
   ```
2. Compile o projeto:
   ```bash
   npx tsc
   ```
3. Execute um exemplo:
   ```bash
   node dist/index.js examples/hello.llang
   ```

## Exemplo de código LambdaLang
Veja o arquivo `examples/hello.llang` para um exemplo de sintaxe.

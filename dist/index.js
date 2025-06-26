"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const lexer_1 = require("./lexer");
const parser_1 = require("./parser");
const interpreter_1 = require("./interpreter");
function main() {
    const file = process.argv[2];
    if (!file) {
        console.error('Uso: node dist/index.js <arquivo.llang>');
        process.exit(1);
    }
    const code = (0, fs_1.readFileSync)(file, 'utf-8');
    const tokens = (0, lexer_1.lexer)(code);
    const ast = (0, parser_1.parser)(tokens);
    (0, interpreter_1.interpret)(ast);
}
main();

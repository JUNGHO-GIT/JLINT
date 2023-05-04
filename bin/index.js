"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const acorn_1 = __importDefault(require("acorn"));
const commander_1 = require("commander");
function lint(ast) {
    const problems = [];
    function walk(node) {
        if (node.type === 'CallExpression' && node.callee.type === 'MemberExpression') {
            const { object, property } = node.callee;
            if (object.type === 'Identifier' && object.name === 'console' && property.type === 'Identifier' && property.name === 'log') {
                problems.push({
                    message: 'console.log 사용 금지',
                    line: node.loc.start.line,
                    column: node.loc.start.column
                });
            }
        }
        for (const key in node) {
            const child = node[key];
            if (typeof child === 'object' && child !== null && 'type' in child) {
                walk(child);
            }
        }
    }
    walk(ast);
    return problems;
}
commander_1.program
    .argument('<file>', '파일 경로')
    .action((file) => {
    const filePath = path_1.default.resolve(process.cwd(), file);
    const code = fs_1.default.readFileSync(filePath, 'utf-8');
    const ast = acorn_1.default.parse(code, { ecmaVersion: 'latest', locations: true });
    const problems = lint(ast);
    if (problems.length === 0) {
        console.log('린팅 완료: 문제 없음');
    }
    else {
        console.log(`린팅 완료: ${problems.length}개의 문제 발견`);
        for (const problem of problems) {
            console.log(`  ${problem.line}:${problem.column} - ${problem.message}`);
        }
    }
});
commander_1.program.parse(process.argv);

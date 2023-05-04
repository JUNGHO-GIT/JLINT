"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const acorn_1 = __importDefault(require("acorn"));
function lint(ast) {
    const problems = [];
    function walk(node) {
        if (node.type === 'AssignmentExpression') {
            const assignmentNode = node;
            const { left, right, operator } = assignmentNode;
            if (operator === '=') {
                const leftRange = left.range;
                const rightRange = right.range;
                if (leftRange[1] + 1 !== rightRange[0]) {
                    problems.push({
                        message: '빈 공간이 없음: = 앞뒤로 빈 공간을 추가하세요.',
                        line: node.loc.start.line,
                        column: node.loc.start.column
                    });
                }
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
// main 함수 추가
async function main(file) {
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
}
// 실행하기 위해 main 함수 호출
main(process.argv[2]);

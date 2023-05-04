import fs from 'fs';
import path from 'path';
import acorn from 'acorn';
import {BaseNode,AssignmentExpression} from 'estree';

interface Problem {
  message: string;
  line: number;
  column: number;
}

function lint(ast: BaseNode): Problem[] {
  const problems: Problem[] = [];

  function walk(node: BaseNode) {
    if(node.type === 'AssignmentExpression') {
      const assignmentNode = node as AssignmentExpression;
      const {left,right,operator} = assignmentNode;

      if(operator === '=') {
        const leftRange = left.range as [number,number];
        const rightRange = right.range as [number,number];

        if(leftRange[1] + 1 !== rightRange[0]) {
          problems.push({
            message: '빈 공간이 없음: = 앞뒤로 빈 공간을 추가하세요.',
            line: node.loc!.start.line,
            column: node.loc!.start.column
          });
        }
      }
    }

    for(const key in node) {
      const child = node[key as keyof BaseNode];
      if(typeof child === 'object' && child !== null && 'type' in child) {
        walk(child as BaseNode);
      }
    }
  }

  walk(ast);

  return problems;
}

// main 함수 추가
async function main(file: string) {
  const filePath = path.resolve(process.cwd(),file);
  const code = fs.readFileSync(filePath,'utf-8');
  const ast = acorn.parse(code,{ecmaVersion: 'latest',locations: true}) as BaseNode;
  const problems = lint(ast);

  if(problems.length === 0) {
    console.log('린팅 완료: 문제 없음');
  } else {
    console.log(`린팅 완료: ${problems.length}개의 문제 발견`);
    for(const problem of problems) {
      console.log(`  ${problem.line}:${problem.column} - ${problem.message}`);
    }
  }
}

// 실행하기 위해 main 함수 호출
main(process.argv[2]);

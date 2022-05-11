#!/bin/node

import ts from 'typescript';
const { ScriptTarget, transpileModule } = ts;

function compileTypescript(tsSource: string) {
  const jsSource = transpileModule(tsSource, {
    compilerOptions: {
      target: ScriptTarget.ES5,
    },
  }).outputText;

  return jsSource;
}

let contents = '';

process.stdin.setEncoding('utf8');
process.stdin.on('data', function (data) {
  contents += data;
});
process.stdin.on('end', function () {
  const ts = compileTypescript(contents);
  console.log(ts);
});
process.stdin.resume();

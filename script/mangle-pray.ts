#!/usr/bin/env node

// this script uses the uglifyjs parser to remove the function `pray()`
// and all calls to it.  It is run as part of the minification process.

import { readFileSync } from 'fs';
import { parse } from 'uglify-js';

function shouldRemove(el) {
  if (!Array.isArray(el)) return false;

  // function pray() { ... }
  if (el[0] === 'defun' && el[1].indexOf('pray') === 0) return true;

  // pray(...)
  if (el[0] === 'call' && el[1][0] === 'name' && el[1][1].indexOf('pray') === 0)
    return true;

  // remove the entire statement containing pray();
  if (el[0] === 'stat' && shouldRemove(el[1])) return true;

  return false;
}

export function manglePray(ast) {
  if (!Array.isArray(ast)) return ast;

  var out = [];

  ast.forEach(function (el) {
    if (shouldRemove(el)) return;

    out.push(manglePray(el));
  });

  return out;
}

export function getAst(fname: string) {
  var code = readFileSync(fname, 'utf-8');
  return uglify.parse(code);
}

function main() {
  const fname = process.argv[2];

  const ast = manglePray(getAst(fname));
  process.stdout.write(uglify.gen_code(ast));
}

main();

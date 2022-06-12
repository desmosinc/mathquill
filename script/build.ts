import { rm, mkdir, readdir, copyFile, readFile, writeFile } from 'fs/promises';
import less from 'less';
import path from 'path';
import { minify } from 'terser';
import ts from 'typescript';

async function copyDir(src: string, dest: string) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    entry.isDirectory()
      ? await copyDir(srcPath, destPath)
      : await copyFile(srcPath, destPath);
  }
}

async function buildCSS() {
  writeFile(
    'build/mathquill.css',
    (
      await less.render(await readFile('src/css/main.less', 'utf-8'), {
        paths: ['src/css'],
      })
    ).css,
    'utf-8'
  );
}

const baseSources = [
  'src/utils.ts',
  'src/dom.ts',
  'src/unicode.ts',
  'src/browser.ts',
  'src/animate.ts',
  'src/services/aria.ts',
  'src/domFragment.ts',
  'src/tree.ts',
  'src/cursor.ts',
  'src/controller.ts',
  'src/publicapi.ts',
  'src/services/parser.util.ts',
  'src/services/saneKeyboardEvents.util.ts',
  'src/services/exportText.ts',
  'src/services/focusBlur.ts',
  'src/services/keystroke.ts',
  'src/services/latex.ts',
  'src/services/mouse.ts',
  'src/services/scrollHoriz.ts',
  'src/services/textarea.ts',
];

const fullSources = [
  ...baseSources,
  'src/commands/math.ts',
  'src/commands/text.ts',
  'src/commands/math/advancedSymbols.ts',
  'src/commands/math/basicSymbols.ts',
  'src/commands/math/commands.ts',
  'src/commands/math/LatexCommandInput.ts',
];

const basicSources = [
  ...baseSources,
  'src/commands/math.ts',
  'src/commands/math/basicSymbols.ts',
  'src/commands/math/commands.ts',
];

async function buildJS(
  origin: string[],
  out: string,
  shouldMinify: boolean
) {
  const sources: string[] = (
    await Promise.all([
      await readFile('src/intro.js', 'utf8'),
      ...origin.map(async (it) => {
        if (it.endsWith('.ts')) {
          return ts.transpileModule(await readFile(it, 'utf-8'), {
            compilerOptions: {
              module: 0,
            },
          }).outputText;
        } else {
          return await readFile(it, 'utf-8');
        }
      }),
      await readFile('src/outro.js', 'utf8'),
    ])
  ).filter(Boolean);

  if (shouldMinify) {
    await writeFile(
      `build/${out}.js`,
      (await minify(sources.join('\n'))).code,
      'utf-8'
    );
  } else {
    await writeFile(`build/${out}.js`, sources.join('\n'), 'utf-8');
  }
}

await rm('build', { recursive: true, force: true });
await mkdir('build');
await copyDir('src/fonts', 'build/fonts');
await buildCSS();
await buildJS(fullSources, 'mathquill', false);
await buildJS(fullSources, 'mathquill.min', true);
await buildJS(basicSources, 'mathquill-basic', false);
await buildJS(basicSources, 'mathquill-basic.min', true);
await buildJS(
  [
    ...fullSources,
    'test/support/assert.ts',
    'test/support/trigger-event.ts',
    'test/support/jquery-stub.ts',
    ...[...(await readdir('test/unit'))].map((it) => 'test/unit/' + it),
  ],
  'mathquill.test',
  false
);
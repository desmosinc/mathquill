import { rm, mkdir, readdir, copyFile, readFile, writeFile } from 'fs/promises';
import less from 'less';
import path from 'path';
import { minify } from 'terser';
import ts from 'typescript';
import postcss from 'postcss';
import nano from 'cssnano';

const postCSS = postcss([nano({ preset: 'default' })]);

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

async function buildCSS(basic = true) {
  const content = (
    await less.render(await readFile('src/css/main.less', 'utf-8'), {
      paths: ['src/css'],
      globalVars: {
        basic: basic.toString(),
      },
    })
  ).css;

  writeFile(`build/mathquill${basic ? '-basic' : ''}.css`, content, 'utf-8');

  writeFile(
    `build/mathquill${basic ? '-basic' : ''}.min.css`,
    (await postCSS.process(content, { from: undefined })).css,
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
  andMinify: boolean,
  useIntroOutro = true
) {
  const sources: string[] = (
    await Promise.all([
      useIntroOutro ? await readFile('src/intro.js', 'utf8') : '',
      ...origin.map(async (it) => {
        if (it.endsWith('.ts')) {
          // Transpile typescript files
          return ts.transpileModule(await readFile(it, 'utf-8'), {}).outputText;
        } else {
          return await readFile(it, 'utf-8');
        }
      }),
      useIntroOutro ? await readFile('src/outro.js', 'utf8') : '',
    ])
  ).filter(Boolean);

  await writeFile(`build/${out}.js`, sources.join('\n'), 'utf-8');

  if (andMinify) {
    await writeFile(
      `build/${out}.min.js`,
      (
        await minify(sources.join('\n'))
      ).code,
      'utf-8'
    );
  }
}

async function main() {
  console.log('Cleaning directories...');

  await rm('build', { recursive: true, force: true });
  await mkdir('build');

  console.log('Copying fonts...');

  await copyDir('src/fonts', 'build/fonts');

  console.log('Bulding CSS...');
  await buildCSS(true); // Basic CSS
  await buildCSS(false); // NON-Basic CSS

  console.log('Building JS files...');

  await buildJS(fullSources, 'mathquill', true);
  await buildJS(basicSources, 'mathquill-basic', true);

  console.log('Building tests...');

  await buildJS(
    [
      'test/support/assert.ts',
      'test/support/trigger-event.ts',
      'test/support/jquery-stub.ts',
      ...[...(await readdir('test/unit'))].map((it) => 'test/unit/' + it),
    ],
    'mathquill.test',
    false
  );

  console.log('Finished!');
}

await main();

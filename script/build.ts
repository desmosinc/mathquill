import { readdir, cp, readFile, writeFile } from 'fs/promises';
import less from 'less';
import { minify } from 'terser';
import ts from 'typescript';
import postcss from 'postcss';
import nano from 'cssnano';
import http from 'http';
import serve from 'serve-handler';

const useServer = process.argv.indexOf('--server') !== -1;

const postCSS = postcss([nano({ preset: 'default' })]);

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

const licenseNotification = `/**
* MathQuill {${
  JSON.parse(await readFile('package.json', 'utf-8')).version
}}, by Han, Jeanine, and Mary
* http://mathquill.com | maintainers@mathquill.com
*
* This Source Code Form is subject to the terms of the
* Mozilla Public License, v. 2.0. If a copy of the MPL
* was not distributed with this file, You can obtain
* one at http://mozilla.org/MPL/2.0/.
*/

`;

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

  await writeFile(
    `build/${out}.js`,
    licenseNotification + sources.join('\n'),
    'utf-8'
  );

  if (andMinify) {
    await writeFile(
      `build/${out}.min.js`,
      licenseNotification + (await minify(sources.join('\n'))).code,
      'utf-8'
    );
  }
}

async function main() {
  console.log('Copying fonts...');

  await cp('src/fonts', 'build/fonts', { recursive: true, force: true });

  console.log('Bulding CSS...');
  await buildCSS(true); // Basic CSS
  await buildCSS(false); // NON-Basic CSS

  console.log('Building JS files...');

  await buildJS(fullSources, 'mathquill', true);
  await buildJS(basicSources, 'mathquill-basic', true);

  console.log('Building tests...');

  await buildJS(
    [
      ...fullSources,
      'test/support/assert.ts',
      'test/support/trigger-event.ts',
      ...[...(await readdir('test/unit'))].map((it) => 'test/unit/' + it),
    ],
    'mathquill.test',
    false
  );

  if (useServer) {
    const server = http.createServer((request, response) =>
      serve(request, response, {
        public: './',
        cleanUrls: true,
      })
    );

    server.listen(3000, () => {
      console.log('Running at http://localhost:3000');
    });

    process.once('SIGUSR2', () => {
      server.close(() => process.kill(process.pid, 'SIGUSR2'));
    });
  } else {
    console.log('Finished!');
  }
}

await main();

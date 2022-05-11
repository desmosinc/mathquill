import { createServer, type ServerResponse, type IncomingMessage } from 'http';
import { normalize, join } from 'path';
import { readFile, readdir, watch } from 'fs';
import { exec } from 'child_process';
import chalk from 'chalk';

// constants
const PORT = +(process.env.PORT || 9292);
const HOST = process.env.HOST || '0.0.0.0';
const serverAddress =
  HOST === '0.0.0.0' ? 'localhost:' + PORT : HOST + ':' + PORT;

let q: undefined | (() => void)[] = undefined;

// functions
function serveRequest(req: IncomingMessage, res: ServerResponse) {
  const reqTime = new Date();
  enqueueOrDo(function () {
    if (!req.url) return;
    const filepath = normalize(
      new URL('http://' + serverAddress + req.url).pathname
    ).slice(1);
    readFile(filepath, function (err, data) {
      if (err) {
        if (err.code === 'ENOENT' || err.code === 'EISDIR') {
          res.statusCode = 404;
          res.end('404 Not Found: /' + filepath + '\n');
        } else {
          console.log(err);
          res.statusCode = 500;
          res.end('500 Internal Server Error: ' + err.code + '\n');
        }
      } else {
        const ext = filepath.match(/\.[^.]+$/);
        if (ext) res.setHeader('Content-Type', 'text/' + ext[0].slice(1));
        res.end(data);
      }

      console.log(
        '[%s] %s %s /%s - %s%sms',
        chalk.gray(reqTime.toISOString()),
        res.statusCode,
        chalk.green(req.method),
        chalk.blue(filepath),
        chalk.yellow(data ? (data.length >> 10) + 'kb, ' : ''),
        Date.now() - +reqTime
      );
    });
  });
}

function recursivelyWatch(watchee: string, cb: () => void) {
  readdir(watchee, function (err, files) {
    if (err) {
      // not a directory, just watch it
      watch(watchee, cb);
    } else {
      // a directory, recurse, also watch for files being added or deleted
      files.forEach(recurse);
      watch(watchee, function () {
        readdir(watchee, function (err, filesNew) {
          if (err) return; // watchee may have been deleted
          // filesNew - files = new files or dirs to watch
          filesNew
            .filter(function (file) {
              return files.indexOf(file) < 0;
            })
            .forEach(recurse);
          files = filesNew;
        });
        cb();
      });
    }
    function recurse(file: string) {
      recursivelyWatch(join(watchee, file), cb);
    }
  });
}

function enqueueOrDo(cb: () => void) {
  q ? q.push(cb) : cb();
}
function run_make_test() {
  if (q) return;
  q = [];
  console.log('[%s]\nmake test', new Date().toISOString());
  const make_test = exec('make test', { env: process.env });
  make_test.stdout?.pipe(process.stdout, { end: false });
  make_test.stderr?.pipe(process.stderr, { end: false });
  make_test.on('exit', (code) => {
    if (code) {
      console.error(chalk.red('Make failed | exit code: ' + code));
    } else {
      console.log(
        chalk.green('\nMathQuill is now running on ' + serverAddress)
      );
      console.log(
        chalk.green('Open http://' + serverAddress + '/test/demo.html\n')
      );
    }
    q?.forEach((it) => it());
    q = undefined;
  });
}

// main
createServer(serveRequest).listen(PORT, HOST);
console.log('listening on ' + HOST + ':' + PORT);
run_make_test();
['src', 'test', 'Makefile', 'package.json'].forEach((filename) => {
  recursivelyWatch(filename, run_make_test);
});

#!/bin/node

// escape all non-ASCII characters with JS unicode escapes \u####, for #284

process.stdin.setEncoding('utf8');

process.stdin.on('data', (data) => {
  process.stdout.write(
    data.toString().replace(/[^\x00-\x7F]/g, (c) => {
      return '\\u' + ('000' + c.charCodeAt(0).toString(16)).slice(-4);
    })
  );
});

process.stdin.resume();

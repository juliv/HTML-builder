const fs = require('fs');
const path = require('path');
const readline = require('readline');

const filename = path.join(__dirname, 'text.txt');
const writable = fs.createWriteStream(filename, { encoding: 'utf-8' });

const hasExit = (text) => {
  return text.trim().toLowerCase() === 'exit';
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Hi! Please type text:\n', function (text) {
  if (!hasExit(text)) {
    writable.write(text);
  } else {
    rl.close();
  }
});

rl.on('line', function (text) {
  if (!hasExit(text)) {
    writable.write('\n' + text);
  } else {
    rl.close();
  }
});

rl.on('SIGINT', () => {
  rl.close();
});

rl.on('close', function () {
  writable.end();
  writable.close();
  console.log('\nThanks! Bye');
  process.exit(0);
});

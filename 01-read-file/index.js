const fs = require('fs');
const path = require('path');

const readFile = (filename) => {
  const readable = new fs.ReadStream(filename, { encoding: 'utf-8' });
  readable.on('readable', () => {
    let chunk;
    while (null !== (chunk = readable.read())) {
      console.log(chunk);
    }
  });
};

const filename = path.join(__dirname, 'text.txt');
readFile(filename);

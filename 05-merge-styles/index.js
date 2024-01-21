const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

const getFiles = async (src, ext = '') => {
  let out = [];
  try {
    const files = await fsPromises.readdir(srcDir, { withFileTypes: true });
    for (const file of files) {
      const fileExt = path.extname(file.name);
      if (file.isFile() && fileExt === ext) {
        out.push(path.join(srcDir, file.name));
      }
    }
  } catch (err) {
    console.error(err);
  }
  return out;
};

const createBundle = async (files, destFile) => {
  const writable = fs.createWriteStream(destFile, { encoding: 'utf-8' });
  for (const file of files) {
    const readable = fs.createReadStream(file, { encoding: 'utf-8' });
    readable.pipe(writable);
  }
};

const srcDir = path.join(__dirname, 'styles');
const destFile = path.join(__dirname, 'project-dist', 'bundle.css');

getFiles(srcDir, '.css').then((files) => {
  createBundle(files, destFile);
});

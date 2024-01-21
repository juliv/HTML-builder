const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'secret-folder');

const listFiles = async (dir) => {
  try {
    const files = await fs.promises.readdir(dir, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile()) {
        fs.stat(path.join(dir, file.name), (err, stats) => {
          const { name: filename, ext } = path.parse(file.name);
          const { size: filesize } = stats;
          console.log(`${filename} - ${ext.substring(1)} - ${filesize}`);
        });
      }
    }
  } catch (err) {
    console.error(err);
  }
};

listFiles(dir);

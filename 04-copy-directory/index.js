const fsPromises = require('fs/promises');
const path = require('path');

const prepareDirDest = async (dir) => {
  await fsPromises.rm(dir, { recursive: true, force: true });
  await fsPromises.mkdir(dir, { recursive: true });
};

const copyFiles = async (dirSrc, dirDest) => {
  try {
    const files = await fsPromises.readdir(dirSrc, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        await fsPromises
          .mkdir(path.join(dirDest, file.name), { recursive: true })
          .then(() => {
            copyFiles(
              path.join(dirSrc, file.name),
              path.join(dirDest, file.name),
            );
          });
      } else {
        await fsPromises.copyFile(
          path.join(dirSrc, file.name),
          path.join(dirDest, file.name),
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
};

const dirSrc = path.join(__dirname, 'files');
const dirDest = path.join(__dirname, 'files-copy');

prepareDirDest(dirDest).then(() => {
  copyFiles(dirSrc, dirDest);
});

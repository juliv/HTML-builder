const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');

/**
 * Подготовка папки для сгенерированных файлов
 * @param {string} dir
 * @return {Promise<void>}
 */
const prepareDirDist = async (dir) => {
  await fsPromises.rm(dir, { recursive: true, force: true });
  await fsPromises.mkdir(dir, { recursive: true });
};

/**
 * Копирование файлов из одной папки в другую (включая подпапки)
 * @param {string} src
 * @param {string} dest
 * @return {Promise<void>}
 */
const copyFiles = async (src, dest) => {
  try {
    const files = await fsPromises.readdir(src, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) {
        await fsPromises
          .mkdir(path.join(dest, file.name), { recursive: true })
          .then(() => {
            copyFiles(path.join(src, file.name), path.join(dest, file.name));
          });
      } else {
        await fsPromises.copyFile(
          path.join(src, file.name),
          path.join(dest, file.name),
        );
      }
    }
  } catch (err) {
    console.error(err);
  }
};

/**
 * Копирование содержимого файлов .css из папки (src) в один конечный файл (destFile)
 * @param {string} src
 * @param {string} destFile
 * @return {Promise<void>}
 */
const createStylesBundle = async (src, destFile) => {
  try {
    const files = await fsPromises.readdir(src, { withFileTypes: true });
    const writable = fs.createWriteStream(destFile, { encoding: 'utf-8' });
    for (const file of files) {
      const ext = path.extname(file.name);
      if (file.isFile() && ext === '.css') {
        const filepath = path.join(src, file.name);
        const readable = fs.createReadStream(filepath, { encoding: 'utf-8' });
        readable.pipe(writable);
      }
    }
  } catch (err) {
    console.error(err);
  }
};

/**
 * Чтение исходного шаблона template.html
 * @param {string} path
 * @param {function} callback
 * @return {Promise<void>}
 */
const readTemplate = async (path, callback) => {
  let text = '';
  try {
    const readable = fs.createReadStream(path, { encoding: 'utf-8' });
    readable.on('readable', () => {
      let chunk;
      while (null !== (chunk = readable.read())) {
        text += chunk;
      }
    });
    readable.on('end', () => {
      if (typeof callback === 'function') {
        callback.call(this, text);
      }
    });
  } catch (err) {
    console.error(err);
  }
};

/**
 * Поиск элементов {{name}} для замены
 * @param {string} text
 */
const replaceTemplate = (text) => {
  const re = /{{(\w+)}}/g;
  const m = [...text.matchAll(re)];
  const replaces = m.map((val) => val[1]);
  updateTemplate(text, replaces);
};

/**
 * Обновление текста шаблона (замена {{name}} на текст из файла 'components/{name}.html')
 * @param {string} text
 * @param {Array<string>} replaces
 */
const updateTemplate = (text, replaces) => {
  if (!replaces.length) {
    createTemplateBundle(text);
    return;
  }
  const replacer = replaces.pop();
  const filepath = path.join(__dirname, 'components', `${replacer}.html`);
  fs.readFile(filepath, { encoding: 'utf-8' }, (err, data = '') => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Не нашли файл, заменяем на пустую строку.
        console.error(
          `Not found '${filepath}'. Replaced by empty string.`,
          data,
        );
      } else {
        throw err;
      }
    }
    text = text.replace(`{{${replacer}}}`, data);
    updateTemplate(text, replaces);
  });
};

/**
 * Сохранение скомпилированного файла html
 * @param {string} text
 */
const createTemplateBundle = (text) => {
  const filename = path.join(__dirname, 'project-dist', 'index.html');
  const writable = fs.createWriteStream(filename, { encoding: 'utf-8' });
  writable.write(text);
  writable.end();
  writable.close();
};

/**/

const distDir = path.join(__dirname, 'project-dist');

const srcDir = path.join(__dirname, 'styles');
const destFile = path.join(distDir, 'style.css');

const assetsSrc = path.join(__dirname, 'assets');
const assetsDest = path.join(distDir, 'assets');

prepareDirDist(distDir).then(() => {
  createStylesBundle(srcDir, destFile);
  copyFiles(assetsSrc, assetsDest);
  readTemplate(path.join(__dirname, 'template.html'), replaceTemplate);
});

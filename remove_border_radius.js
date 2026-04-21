const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.css')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync(path.join(__dirname, 'src'));

let changedFiles = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  // matches 'rounded', 'rounded-sm', 'rounded-md', 'rounded-lg', 'rounded-full', 'rounded-2xl', etc.
  // We use word boundaries \b to not match things accidentally, though tailwind classes are space-separated.
  const regex = /\brounded(?:-[a-z0-9]+)?\b/g;
  if (regex.test(content) || content.includes('border-radius:')) {
    const newContent = content.replace(regex, '').replace(/border-radius:[^;]+;/g, '').replace(/  +/g, ' ');
    fs.writeFileSync(file, newContent, 'utf8');
    changedFiles++;
    console.log(`Updated ${file}`);
  }
});

console.log(`Done. Changed ${changedFiles} files.`);

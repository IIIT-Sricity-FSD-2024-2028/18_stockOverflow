const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.html')) {
      callback(path.join(dir, f));
    }
  });
}

const targetDir = '/Users/yogeswar/Documents/ffsd_project/front-end/';
walkDir(targetDir, function(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace the exact logout pattern across files
  let modified = content;
  
  // Pattern to find `setSbActive(this);return false` for Logout specifically
  const regex = /onclick="setSbActive\(this\);return false"([^>]*>\s*<span class="sb-icon">[\s\S]*?<\/span>\s*<span class="sb-item-label">Logout<\/span>)/g;
  
  const replacement = `onclick="if(window.DB){DB.logout();}window.location.href='../index.html';"$1`;
  
  modified = modified.replace(regex, replacement);

  // Fallback for cases where it might use standard href="#" onclick="..."
  const regex2 = /href="#" onclick="[\s\S]*?"([^>]*>\s*<span class="sb-icon">[\s\S]*?<\/span>\s*<span class="sb-item-label">Logout<\/span>)/g;
  modified = modified.replace(regex2, `href="#" onclick="if(window.DB){DB.logout();}window.location.href='../index.html';return false;"$1`);

  if (content !== modified) {
    fs.writeFileSync(filePath, modified, 'utf8');
    console.log('Patched: ' + filePath);
  }
});

import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const publicDir = path.resolve(rootDir, "public");
const clonedDir = path.resolve(rootDir, "cloned-pages");

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. Copy homepage.html to public/index.html
const homepagePath = path.resolve(rootDir, "homepage.html");
if (fs.existsSync(homepagePath)) {
  fs.copyFileSync(homepagePath, path.resolve(publicDir, "index.html"));
  console.log("Copied homepage.html -> public/index.html");
}

// 2. Copy all cloned pages to public/
if (fs.existsSync(clonedDir)) {
  const files = fs.readdirSync(clonedDir);
  let count = 0;
  for (const file of files) {
    if (file.endsWith(".html")) {
      fs.copyFileSync(path.resolve(clonedDir, file), path.resolve(publicDir, file));
      count++;
    }
  }
  console.log(`Copied ${count} pages from cloned-pages/ to public/`);
}

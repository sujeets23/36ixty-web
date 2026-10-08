import fs from "node:fs";
import path from "node:path";

const files = [
  "homepage.html",
  "contact.html",
  ...fs.readdirSync("cloned-pages").map((f) => path.join("cloned-pages", f)),
];

const allUrls = new Set();
for (const file of files) {
  if (!fs.existsSync(file) || !file.endsWith(".html")) continue;
  const content = fs.readFileSync(file, "utf8");
  const matches = content.match(/https:\/\/(?:framerusercontent\.com|fonts\.gstatic\.com)[^"'\s\)\>]+/g) || [];
  for (let u of matches) {
    // Strip trailing html entities or syntax if any
    u = u.replace(/[&"'].*$/, "");
    allUrls.add(u);
  }
}

console.log("Total unique external asset URLs across all pages:", allUrls.size);
const byType = {
  images: 0,
  fonts: 0,
  scripts: 0,
  other: 0,
};

for (const u of allUrls) {
  if (u.includes("/images/")) byType.images++;
  else if (u.includes(".woff") || u.includes("/fonts") || u.includes(".ttf")) byType.fonts++;
  else if (u.endsWith(".mjs") || u.endsWith(".js")) byType.scripts++;
  else byType.other++;
}

console.log("Breakdown:", byType);
console.log("\nSample URLs:");
Array.from(allUrls).slice(0, 20).forEach((u) => console.log(u));

import fs from "node:fs";
import path from "node:path";

const publicAssetsDir = path.resolve(process.cwd(), "public", "assets");
fs.mkdirSync(path.join(publicAssetsDir, "images"), { recursive: true });
fs.mkdirSync(path.join(publicAssetsDir, "fonts"), { recursive: true });
fs.mkdirSync(path.join(publicAssetsDir, "sites", "7opyh7AXPF10ombF6nlNYH"), { recursive: true });
fs.mkdirSync(path.join(publicAssetsDir, "sites", "icons"), { recursive: true });
fs.mkdirSync(path.join(publicAssetsDir, "other"), { recursive: true });

const htmlFiles = [
  "homepage.html",
  "contact.html",
  ...fs.readdirSync("cloned-pages").map((f) => path.join("cloned-pages", f)),
];

// Step 1: Collect all external URLs
const urlToLocalMap = new Map();

function getLocalPathInfo(rawUrl) {
  const urlObj = new URL(rawUrl);
  const pathname = urlObj.pathname;

  if (pathname.includes("/images/")) {
    const filename = path.basename(pathname);
    return {
      localFile: path.join(publicAssetsDir, "images", filename),
      localUrl: `/assets/images/${filename}`,
    };
  }

  if (pathname.includes("/sites/7opyh7AXPF10ombF6nlNYH/")) {
    const filename = path.basename(pathname);
    return {
      localFile: path.join(publicAssetsDir, "sites", "7opyh7AXPF10ombF6nlNYH", filename),
      localUrl: `/assets/sites/7opyh7AXPF10ombF6nlNYH/${filename}`,
    };
  }

  if (pathname.includes("/sites/icons/")) {
    const filename = path.basename(pathname);
    return {
      localFile: path.join(publicAssetsDir, "sites", "icons", filename),
      localUrl: `/assets/sites/icons/${filename}`,
    };
  }

  if (pathname.endsWith(".woff2") || pathname.endsWith(".woff") || pathname.endsWith(".ttf") || pathname.includes("/assets/")) {
    const filename = path.basename(pathname);
    return {
      localFile: path.join(publicAssetsDir, "fonts", filename),
      localUrl: `/assets/fonts/${filename}`,
    };
  }

  const filename = path.basename(pathname) || "asset";
  return {
    localFile: path.join(publicAssetsDir, "other", filename),
    localUrl: `/assets/other/${filename}`,
  };
}

// Scan all HTML files
for (const f of htmlFiles) {
  if (!fs.existsSync(f) || !f.endsWith(".html")) continue;
  const content = fs.readFileSync(f, "utf8");
  const matches = content.match(/https:\/\/(?:framerusercontent\.com|fonts\.gstatic\.com)[^"'\s\)\>]+/g) || [];
  for (const fullMatch of matches) {
    try {
      // Split off query string for base downloading
      const base = fullMatch.split("?")[0].replace(/[&"'].*$/, "");
      if (!urlToLocalMap.has(base)) {
        urlToLocalMap.set(base, getLocalPathInfo(base));
      }
    } catch {}
  }
}

console.log(`Found ${urlToLocalMap.size} base asset URLs across HTML files.`);

// Step 2: Concurrency downloader
async function downloadFile(url, destPath) {
  if (fs.existsSync(destPath) && fs.statSync(destPath).size > 0) {
    return true; // Already downloaded
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      console.warn(`[HTTP ${res.status}] ${url}`);
      return false;
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch (err) {
    console.error(`[Error] ${url}: ${err.message}`);
    return false;
  }
}

// Download with pool
async function downloadAll() {
  const entries = Array.from(urlToLocalMap.entries());
  const concurrency = 8;
  let index = 0;
  let successCount = 0;

  async function worker() {
    while (index < entries.length) {
      const current = entries[index++];
      const [url, info] = current;
      const ok = await downloadFile(url, info.localFile);
      if (ok) successCount++;
      if (index % 25 === 0 || index === entries.length) {
        console.log(`Progress: ${index}/${entries.length} (${successCount} succeeded)`);
      }
    }
  }

  console.log(`Starting download with ${concurrency} parallel streams...`);
  await Promise.all(Array.from({ length: concurrency }, worker));
  console.log(`Completed downloading initial assets: ${successCount} files saved.`);

  // Step 3: Check downloaded .mjs files for relative imports and download missing ones
  console.log("Checking script dependencies...");
  const siteScriptsDir = path.join(publicAssetsDir, "sites", "7opyh7AXPF10ombF6nlNYH");
  const scriptFiles = fs.readdirSync(siteScriptsDir);
  const additionalMjs = new Set();

  for (const sf of scriptFiles) {
    if (!sf.endsWith(".mjs") && !sf.endsWith(".js")) continue;
    try {
      const code = fs.readFileSync(path.join(siteScriptsDir, sf), "utf8");
      const importMatches = code.match(/from\s*["']\.\/([^"']+)["']/g) || [];
      for (const m of importMatches) {
        const depName = m.replace(/^from\s*["']\.\//, "").replace(/["']$/, "");
        if (!fs.existsSync(path.join(siteScriptsDir, depName))) {
          additionalMjs.add(depName);
        }
      }
    } catch {}
  }

  if (additionalMjs.size > 0) {
    console.log(`Found ${additionalMjs.size} additional script dependencies to download...`);
    for (const dep of additionalMjs) {
      const depUrl = `https://framerusercontent.com/sites/7opyh7AXPF10ombF6nlNYH/${dep}`;
      const dest = path.join(siteScriptsDir, dep);
      await downloadFile(depUrl, dest);
    }
  }

  // Step 4: Rewrite HTML files to point to local assets
  console.log("Rewriting all HTML files to point to local /assets/...");
  for (const f of htmlFiles) {
    if (!fs.existsSync(f) || !f.endsWith(".html")) continue;
    let html = fs.readFileSync(f, "utf8");

    // Replace base URLs
    html = html.replaceAll("https://framerusercontent.com/images/", "/assets/images/");
    html = html.replaceAll("https://framerusercontent.com/sites/7opyh7AXPF10ombF6nlNYH/", "/assets/sites/7opyh7AXPF10ombF6nlNYH/");
    html = html.replaceAll("https://framerusercontent.com/sites/icons/", "/assets/sites/icons/");
    html = html.replaceAll("https://framerusercontent.com/assets/", "/assets/fonts/");

    // Replace Google fonts (fonts.gstatic.com)
    html = html.replace(/https:\/\/fonts\.gstatic\.com\/[^\)"']+/g, (match) => {
      const fname = path.basename(match.split("?")[0]);
      return `/assets/fonts/${fname}`;
    });

    fs.writeFileSync(f, html, "utf8");
    console.log(`Updated: ${f}`);
  }

  console.log("ALL ASSETS FULLY LOCALIZED AND HTML UPDATED!");
}

downloadAll();

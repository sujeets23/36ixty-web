import fs from "node:fs";
import path from "node:path";

const files = [
  "homepage.html",
  "contact.html",
  ...fs.readdirSync("cloned-pages").map((f) => path.join("cloned-pages", f)),
];

for (const f of files) {
  if (!fs.existsSync(f) || !f.endsWith(".html")) continue;
  let html = fs.readFileSync(f, "utf8");

  // 1. Remove Made in Framer and Published comments
  html = html.replace(/<!--\s*Made in Framer[\s\S]*?-->/gi, "");
  html = html.replace(/<!--\s*Published[\s\S]*?-->/gi, "");

  // 2. Remove meta generator Framer
  html = html.replace(/<meta\s+name=["']generator["']\s+content=["']Framer[^"']*["']\s*\/?>/gi, '<meta name="generator" content="36ixty Booths">');

  // 3. Remove framer search index meta tags
  html = html.replace(/<meta\s+name=["']framer-search-index[^"']*["'][\s\S]*?\/?>/gi, "");

  // 4. Remove editor bar script
  html = html.replace(/<script>\s*try\s*\{\s*if\s*\(localStorage\.getItem\("__framer_force_showing_editorbar_since"\)\)[\s\S]*?<\/script>/gi, "");

  // 5. Remove events.framer.com tracking script
  html = html.replace(/<script[^>]*src=["']https:\/\/events\.framer\.com\/script[^"']*["'][^>]*><\/script>/gi, "");

  // 6. Replace favicon links with 36ixty brand logo favicon
  html = html.replace(/<link[^>]*rel=["']icon["'][^>]*>/gi, "");
  html = html.replace(/<link[^>]*rel=["']apple-touch-icon["'][^>]*>/gi, "");

  // Inject proper 36ixty brand logo favicons right after <head> or viewport
  const faviconTags = `
  <link rel="icon" type="image/png" href="/assets/brand-logo.png">
  <link rel="apple-touch-icon" href="/assets/brand-logo.png">`;

  if (html.includes('<meta name="viewport"')) {
    html = html.replace(/(<meta name="viewport"[^>]*>)/i, `$1${faviconTags}`);
  } else {
    html = html.replace(/<head>/i, `<head>${faviconTags}`);
  }

  // Clean up any double blank lines at top
  html = html.replace(/<!doctype html>(\s*\n)+/i, "<!doctype html>\n");

  fs.writeFileSync(f, html, "utf8");
  console.log(`Cleaned Framer marks and updated favicon in: ${f}`);
}

console.log("ALL FILES SUCCESSFULLY CLEANED!");

import fs from "node:fs";
import path from "node:path";

const pagesDir = path.resolve(process.cwd(), "cloned-pages");
if (!fs.existsSync(pagesDir)) {
  fs.mkdirSync(pagesDir, { recursive: true });
}

// Copy existing homepage.html and contact.html
if (fs.existsSync("homepage.html")) {
  fs.copyFileSync("homepage.html", path.join(pagesDir, "index.html"));
}
if (fs.existsSync("contact.html")) {
  fs.copyFileSync("contact.html", path.join(pagesDir, "contact.html"));
}

const routes = [
  "about",
  "casestudy",
  "photo-booth-intallations-white",
  "photo-booth-installation",
  "corporateevents",
  "360-booth-hire",
  "360-booth",
  "trading-card-booth",
  "ai-sketch-bots-hire",
  "ai-booth",
  "enclosed-photo-booth",
  "spotlight-booth",
  "dak-mode-home",
  "dark-mode-about",
  "dark-mode-photo-booth-installation",
  "dark-mode-contact",
  "dark-mode-corporate-event",
  "westcoast",
  "dark-mode-360-booth",
  "sketchbot",
  "vintage-booth",
  "snyk",
  "savoys",
  "wifs25",
  "lgt-capital-finance",
  "parkplaza",
  "readingfc",
  "mayfair",
  "customtunnel",
  "404"
];

async function main() {
  for (const route of routes) {
    const filePath = path.join(pagesDir, `${route}.html`);
    if (fs.existsSync(filePath) && fs.statSync(filePath).size > 1000) {
      console.log(`[skip] ${route} exists`);
      continue;
    }

    try {
      console.log(`[fetch] ${route}...`);
      const res = await fetch(`https://36ixtybooths.com/${route}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        console.log(`[error] ${route} HTTP ${res.status}`);
        continue;
      }

      const html = await res.text();
      const cleanHtml = html.replace(
        /<\/head>/i,
        `<style>
#lovable-badge,#lovable-badge-container,[id*="lovable-badge"],[id^="lovable"],[class*="lovable-badge"],a[href*="lovable.dev"],a[href*="framer.com"][target="_blank"]{display:none !important;visibility:hidden !important;opacity:0 !important;pointer-events:none !important;}
</style></head>`
      );
      fs.writeFileSync(filePath, cleanHtml, "utf8");
      console.log(`[saved] ${route}.html (${cleanHtml.length} bytes)`);
    } catch (e) {
      console.log(`[fail] ${route}: ${e.message}`);
    }
  }
  console.log("ALL PAGES FETCHED SUCCESSFULLY!");
}

main();

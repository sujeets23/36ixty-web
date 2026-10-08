import fs from "node:fs";
import path from "node:path";
import type { Plugin } from "vite";

export function clonedPagesPlugin(): Plugin {
  return {
    name: "vite-plugin-cloned-pages",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          return next();
        }

        const rawUrl = req.url || "/";
        const url = new URL(rawUrl, "http://localhost");
        const pathname = url.pathname;

        // Skip internal Vite, node_modules, source files, and static assets
        if (
          pathname.startsWith("/@") ||
          pathname.startsWith("/src/") ||
          pathname.startsWith("/node_modules/") ||
          (pathname.includes(".") && !pathname.endsWith(".html"))
        ) {
          return next();
        }

        let slug = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
        if (!slug) slug = "index";
        if (slug.endsWith(".html")) slug = slug.slice(0, -5);

        let targetFile = "";
        if (slug === "index") {
          if (fs.existsSync(path.resolve(process.cwd(), "homepage.html"))) {
            targetFile = path.resolve(process.cwd(), "homepage.html");
          } else if (fs.existsSync(path.resolve(process.cwd(), "cloned-pages", "index.html"))) {
            targetFile = path.resolve(process.cwd(), "cloned-pages", "index.html");
          }
        } else if (slug === "contact" && fs.existsSync(path.resolve(process.cwd(), "contact.html"))) {
          targetFile = path.resolve(process.cwd(), "contact.html");
        } else {
          const candidate = path.resolve(process.cwd(), "cloned-pages", `${slug}.html`);
          if (fs.existsSync(candidate)) {
            targetFile = candidate;
          }
        }

        if (targetFile) {
          try {
            const content = fs.readFileSync(targetFile, "utf8");
            res.setHeader("Content-Type", "text/html; charset=utf-8");
            res.setHeader("Cache-Control", "no-cache");
            res.statusCode = 200;
            res.end(content);
            return;
          } catch (err) {
            console.error("Error reading cloned page:", err);
          }
        }

        next();
      });
    },
  };
}

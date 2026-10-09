import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import fs from "node:fs";
import path from "node:path";

// Pre-bundle all cloned pages at build time so SSR works in serverless environments (e.g. Vercel)
// where project source files are not available on the filesystem at runtime.
const rawPages = import.meta.glob<string>("../cloned-pages/*.html", {
  query: "?raw",
  import: "default",
  eager: true,
});

function getClonedPageHtml(slug: string): string | undefined {
  const normalized = slug.endsWith(".html") ? slug.slice(0, -5) : slug;
  const key = !normalized || normalized === "index" ? "index" : normalized;

  // 1. Try bundled raw pages
  const bundledKey = `../cloned-pages/${key}.html`;
  if (rawPages[bundledKey]) {
    return rawPages[bundledKey];
  }

  // 2. Try filesystem fallback (local development / Node runtime)
  try {
    if (key === "index") {
      if (fs.existsSync(path.resolve(process.cwd(), "homepage.html"))) {
        return fs.readFileSync(path.resolve(process.cwd(), "homepage.html"), "utf8");
      }
      if (fs.existsSync(path.resolve(process.cwd(), "cloned-pages", "index.html"))) {
        return fs.readFileSync(path.resolve(process.cwd(), "cloned-pages", "index.html"), "utf8");
      }
      if (fs.existsSync(path.resolve(process.cwd(), "public", "index.html"))) {
        return fs.readFileSync(path.resolve(process.cwd(), "public", "index.html"), "utf8");
      }
    } else if (key === "contact" && fs.existsSync(path.resolve(process.cwd(), "contact.html"))) {
      return fs.readFileSync(path.resolve(process.cwd(), "contact.html"), "utf8");
    } else {
      const candidateCloned = path.resolve(process.cwd(), "cloned-pages", `${key}.html`);
      if (fs.existsSync(candidateCloned)) {
        return fs.readFileSync(candidateCloned, "utf8");
      }
      const candidatePublic = path.resolve(process.cwd(), "public", `${key}.html`);
      if (fs.existsSync(candidatePublic)) {
        return fs.readFileSync(candidatePublic, "utf8");
      }
    }
  } catch {
    // Filesystem access failed or not available in environment
  }

  return undefined;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      let slug = url.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
      if (!slug) slug = "index";

      const htmlContent = getClonedPageHtml(slug);
      if (htmlContent) {
        return new Response(htmlContent, {
          status: 200,
          headers: {
            "content-type": "text/html; charset=utf-8",
            "cache-control": "public, max-age=0, must-revalidate",
          },
        });
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};


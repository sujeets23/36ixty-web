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

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      let slug = url.pathname.replace(/^\/+/, "").replace(/\/+$/, "");
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
        const content = fs.readFileSync(targetFile, "utf8");
        return new Response(content, {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
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


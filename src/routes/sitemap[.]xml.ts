import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";

const BASE_URL = "https://36ixtybooths.com";
const paths = ["/", "/about", "/casestudy", "/photo-booth-installation", "/corporateevents", "/contact", "/360-booth-hire", "/trading-card-booth", "/ai-sketch-bots-hire", "/ai-booth", "/enclosed-photo-booth", "/westcoast", "/snyk", "/savoys", "/wifs25", "/lgt-capital-finance", "/parkplaza", "/readingfc", "/mayfair"];

export const Route = createFileRoute("/sitemap.xml")({ server: { handlers: { GET: async () => new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path => `  <url><loc>${BASE_URL}${path}</loc></url>`).join("\n")}\n</urlset>`, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=3600" } }) } } });
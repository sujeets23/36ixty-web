import { createFileRoute } from "@tanstack/react-router";
import { AboutPage, CaseStudiesPage, ContactPage, CorporatePage, GenericPage, InstallationPage, ServicePage } from "../components/site";

const services = new Set(["ai-booth", "ai-sketch-bots-hire", "trading-card-booth", "enclosed-photo-booth", "360-booth-hire", "360-booth", "sketchbot", "vintage-booth", "customtunnel", "headshot-booth-discard", "scribble-booth-discard"]);
const cases = new Set(["westcoast", "snyk", "savoys", "wifs25", "lgt-capital-finance", "parkplaza", "readingfc", "mayfair", "spotlight-booth"]);

export const Route = createFileRoute("/$slug")({
  component: Page,
  head: ({ params }) => {
    const label = params.slug.replaceAll("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const title = `${label} | 36ixty Booths`;
    const description = `Explore ${label}, premium experiential event services by 36ixty Booths.`;
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }], links: [{ rel: "canonical", href: `/${params.slug}` }] };
  },
});

function Page() {
  const { slug: rawSlug } = Route.useParams();
  const slug = rawSlug.replace(/^dark-mode-/, "").replace(/^dark-/, "").replace("dak-mode-home", "home");
  if (slug === "home") return <AboutPage />;
  if (slug === "about") return <AboutPage />;
  if (slug === "contact") return <ContactPage />;
  if (slug === "corporateevents" || slug === "corporate-event") return <CorporatePage />;
  if (slug.includes("photo-booth-installation") || slug === "photo-booth-intallations-white") return <InstallationPage />;
  if (slug === "casestudy") return <CaseStudiesPage />;
  if (services.has(slug)) return <ServicePage slug={slug} />;
  if (cases.has(slug)) return <GenericPage slug={slug} />;
  return <GenericPage slug={slug} />;
}
import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "../components/site";

// No head() here: the home route inherits title/description/og/twitter from
// __root.tsx, and ships no og:image so serve-time hosting can inject the
// project's social preview (explicit og:image or latest screenshot).
export const Route = createFileRoute("/")({
  component: HomePage,
  head: () => ({
    meta: [
      { title: "36ixty Booths | Experiential Photo Booths" },
      { name: "description", content: "Premium photo booths, AI activations and interactive event experiences for brands, venues and corporate events." },
      { property: "og:title", content: "36ixty Booths | Experiential Photo Booths" },
      { property: "og:description", content: "Premium experiential photo booths and interactive event experiences." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

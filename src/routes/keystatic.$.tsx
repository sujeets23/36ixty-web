import { createFileRoute } from "@tanstack/react-router";
import { Keystatic } from "@keystatic/react/ui";
import config from "../../keystatic.config";

export const Route = createFileRoute("/keystatic/$")({
  component: KeystaticAdminPage,
});

function KeystaticAdminPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Keystatic config={config} />
    </div>
  );
}

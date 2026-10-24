import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";

const DowntownApp = lazy(() => import("../downtown/DowntownApp.jsx"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DOWNTOWN | Nepal Food Delivery" },
      { name: "description", content: "Discover DOWNTOWN pizza, burgers and cold drinks. Browse local favourites, manage your profile and order meals in Nepal." },
      { property: "og:title", content: "DOWNTOWN | Nepal Food Delivery" },
      { property: "og:description", content: "Your existing DOWNTOWN food ordering experience: local restaurants, favourite meals and your personal profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <ClientOnly fallback={<div className="app-loading" aria-label="Loading DOWNTOWN" />}>
      <Suspense fallback={<div className="app-loading" aria-label="Loading DOWNTOWN" />}>
        <DowntownApp />
      </Suspense>
    </ClientOnly>
  );
}

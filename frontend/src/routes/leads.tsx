import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title: "Leads — Kottravai CRM" },
      { name: "description", content: "Manage and track B2B leads across the sales pipeline." },
      { property: "og:title", content: "Leads — Kottravai CRM" },
      { property: "og:description", content: "Kottravai lead pipeline, filters and Kanban view." },
    ],
  }),
  component: () => <Outlet />,
});
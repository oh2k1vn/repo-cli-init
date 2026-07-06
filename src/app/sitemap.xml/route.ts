import { createSitemapRouteHandler } from "@/lib/sitemap-helper";

export const dynamic = "force-static";

export const GET = createSitemapRouteHandler("sitemap.xml");

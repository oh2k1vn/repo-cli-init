import { NextRequest } from "next/server";
import { createSitemapRouteHandler } from "@/lib/sitemap-helper";

export const dynamic = "force-static";

interface RouteParams {
  params: Promise<{ filename: string }>;
}

export async function generateStaticParams() {
  return [
    { filename: "page_sitemap.xml" },
    { filename: "bloggroup_sitemap.xml" },
    { filename: "blog_sitemap.xml" },
    { filename: "productgroup_sitemap.xml" },
    { filename: "product_sitemap.xml" },
  ];
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { filename } = await params;
  
  // Delegate to the sitemap route handler helper with the full sub-sitemap path
  const handler = createSitemapRouteHandler(`sitemap.xml/${filename}`);
  return handler(request);
}

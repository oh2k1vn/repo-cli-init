import { NextResponse } from "next/server";
import { getCachedGlobalConfig } from "@/lib/seo-service";

export const dynamic = "force-static";

export async function GET() {
  let content = "";

  try {
    const config = await getCachedGlobalConfig();
    if (config?.robotsTxtContent) {
      content = config.robotsTxtContent;
    } else {
      const domain = config?.domain || "ladosite.vn";
      const protocol = domain.includes("localhost") || domain.includes("127.0.0.1") ? "http" : "https";
      const baseUrl = `${protocol}://${domain}`;

      content = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/

Sitemap: ${baseUrl}/sitemap.xml
`;
    }
  } catch (error) {
    content = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
`;
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

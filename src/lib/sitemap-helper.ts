import { NextRequest, NextResponse } from "next/server";
import { grpcSeoClient } from "@/lib/grpc";
import { getCachedGlobalConfig } from "./seo-service";

export function createSitemapRouteHandler(sitemapPath: string) {
  return async function GET(request: NextRequest) {
    let baseUrl = "https://ladosite.vn";

    try {
      const config = await getCachedGlobalConfig();
      if (config?.domain) {
        const domain = config.domain;
        const protocol = domain.includes("localhost") || domain.includes("127.0.0.1") ? "http" : "https";
        baseUrl = `${protocol}://${domain}`;
      } else {
        const host = request?.headers?.get("host") || "ladosite.vn";
        const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
        const protocol = request?.headers?.get("x-forwarded-proto") || (isLocal ? "http" : "https");
        baseUrl = `${protocol}://${host}`;
      }
    } catch (error) {
      const host = request?.headers?.get("host") || "ladosite.vn";
      const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
      const protocol = request?.headers?.get("x-forwarded-proto") || (isLocal ? "http" : "https");
      baseUrl = `${protocol}://${host}`;
    }

    // The gRPC backend expects the full URL of the requested sitemap
    const requestUrl = `${baseUrl}/${sitemapPath}`;

    try {
      const response = await grpcSeoClient.getSitemapData({ url: requestUrl });
      
      if (response && response.success && response.xmlContent) {
        return new NextResponse(response.xmlContent, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
          },
        });
      }
    } catch (error) {
      // Fail silently or fallback
    }

    // Fallback if gRPC fails
    let xml = "";
    const currentDate = new Date().toISOString().split('T')[0];

    if (sitemapPath === "sitemap.xml") {
      const sitemaps = [
        "page_sitemap.xml",
        "bloggroup_sitemap.xml",
        "blog_sitemap.xml",
        "productgroup_sitemap.xml",
        "product_sitemap.xml",
      ];
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemaps.map(s => `
  <sitemap>
    <loc>${baseUrl}/${s}</loc>
    <lastmod>${currentDate}</lastmod>
  </sitemap>`).join('').trim()}
</sitemapindex>`;
    } else if (sitemapPath === "page_sitemap.xml") {
      const staticRoutes = [
        "",
        "/products",
        "/services",
        "/pricing",
        "/contact",
        "/case-studies",
        "/blog",
        "/about",
      ];
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes.map(route => `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>${route === "" ? "1.0" : "0.8"}</priority>
  </url>`).join('').trim()}
</urlset>`;
    } else {
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    }

    return new NextResponse(xml.trim(), {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
      },
    });
  };
}

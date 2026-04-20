import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: [
      "https://www.motorrad.news/sitemap.xml",
      "https://www.motorrad.news/sitemap_haendler.xml",
      "https://www.motorrad.news/sitemap-termine.xml",
    ],
  };
}

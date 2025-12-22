// app/robots.ts
import type { MetadataRoute } from "next";

const SITE_URL = "https://emotionalchords.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // If you have any private routes later, add disallow here.
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
// app/sitemap.ts
import type { MetadataRoute } from "next";
import { EMOTIONS } from "@/lib/emotions";

const SITE_URL = "https://emotionalchords.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/emotions`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/learn`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.85,
    },
        {
      url: `${SITE_URL}/playbooks`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    
    {
      url: `${SITE_URL}/learn/emotional-piano-chord-progressions`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/learn/paths-of-harmony`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];

  const emotionRoutes: MetadataRoute.Sitemap = EMOTIONS.map((e) => ({
    url: `${SITE_URL}/emotions/${e.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...emotionRoutes];
}
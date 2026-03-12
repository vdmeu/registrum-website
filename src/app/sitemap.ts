import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://registrum.co.uk", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://registrum.co.uk/quickstart", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://registrum.co.uk/financials-example", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://registrum.co.uk/directors-example", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://registrum.co.uk/vs-companies-house", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://registrum.co.uk/use-cases", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://registrum.co.uk/integrations", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://registrum.co.uk/caching", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://registrum.co.uk/companies-house-api-rate-limit", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://registrum.co.uk/companies-house-financial-data", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://registrum.co.uk/ixbrl-parser-api", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://registrum.co.uk/director-network-api", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://registrum.co.uk/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: "https://registrum.co.uk/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: "https://registrum.co.uk/dpa", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    // /status is served by Better Stack at status.registrum.co.uk — not in our sitemap
  ];
}

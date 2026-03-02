import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://registrum.co.uk", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://registrum.co.uk/quickstart", lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: "https://registrum.co.uk/financials-example", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://registrum.co.uk/vs-companies-house", lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: "https://registrum.co.uk/terms", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
    { url: "https://registrum.co.uk/privacy", lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];
}

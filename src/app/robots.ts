import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/checkout", "/profile"],
    },
    sitemap: "https://tncpharmacy.in/sitemap.xml",
  };
}

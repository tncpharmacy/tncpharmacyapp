export default async function sitemap() {
  const baseUrl = "https://tncpharmacy.com";

  let productUrls: { url: string; lastModified: Date }[] = [];

  try {
    const res = await fetch(
      "https://api.tncpharmacy.com/api/medicine/category/1/",
      { cache: "no-store" } // important for fresh data
    );
    if (!res.ok) {
      throw new Error(`API failed with status ${res.status}`);
    }
    // 👇 SAFE JSON PARSE
    const text = await res.text();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let data: any = [];
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Invalid JSON response:", text);
      data = [];
    }

    // 👇 handle array OR paginated response
    const products = Array.isArray(data) ? data : data.results || [];

    // 🔥 limit 500
    const limitedProducts = products.slice(0, 500);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    productUrls = limitedProducts.map((p: any) => ({
      url: `${baseUrl}/medicines-details/${btoa(p.id.toString())}?src=all`,
      lastModified: new Date(),
    }));
  } catch (err) {
    console.error("❌ Sitemap fetch error:", err);
    productUrls = []; // fallback so build doesn't break
  }
  return [
    {
      url: "https://tncpharmacy.com",
      lastModified: new Date(),
    },
    ...productUrls,
    {
      url: "https://tncpharmacy.com/all-medicine",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/about-us",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/contact-us",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/return-policy",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/refund-policy",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/privacy-policy",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/shipping-policy",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/terms-conditions",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/faqs",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/careers",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/news-and-media",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/licence",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/how-to-order",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/blog",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/partner",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/prescription-guide",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/offers",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/reviews",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/all-product/OQ",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/all-products/OQ/MTU2",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/all-group-care/NA",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/all-generic/OQ",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/all-manufacturer/Mzkz",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/medicines-details/MjE5MTA",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.com/product-details/MzY4MTMw",
      lastModified: new Date(),
    },
  ];
}

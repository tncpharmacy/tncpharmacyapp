export default async function sitemap() {
  const baseUrl = "https://tncpharmacy.in";

  let productUrls: { url: string; lastModified: Date }[] = [];

  try {
    const res = await fetch(
      "https://api.tncpharmacy.in/api/medicine/category/1/",
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
      url: "https://tncpharmacy.in",
      lastModified: new Date(),
    },
    ...productUrls,
    {
      url: "https://tncpharmacy.in/all-medicine",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/about-us",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/contact-us",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/return-policy",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/refund-policy",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/privacy-policy",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/shipping-policy",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/terms-conditions",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/faqs",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/careers",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/news-and-media",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/licence",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/how-to-order",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/blog",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/partner",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/prescription-guide",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/offers",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/reviews",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/all-product/OQ",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/all-products/OQ/MTU2",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/all-group-care/NA",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/all-generic/OQ",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/all-manufacturer/Mzkz",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/medicines-details/MjE5MTA",
      lastModified: new Date(),
    },
    {
      url: "https://tncpharmacy.in/product-details/MzY4MTMw",
      lastModified: new Date(),
    },
  ];
}

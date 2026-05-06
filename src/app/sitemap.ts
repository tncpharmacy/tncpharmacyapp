export default async function sitemap() {
  const res = await fetch(
    "https://api.tncpharmacy.in/api/medicine/category/1/"
  );

  const data = await res.json();

  // 🔥 limit 500
  const limitedProducts = data.slice(0, 500);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productUrls = limitedProducts.map((p: any) => ({
    url: `https://tncpharmacy.in/medicines-details/${btoa(p.id.toString())}`,
    lastModified: new Date(),
  }));
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

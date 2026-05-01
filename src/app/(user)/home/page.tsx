import { getHomeData } from "@/lib/server/home";
import HomeClient from "./homeClient";

// export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata = {
  title:
    "Online Pharmacy India | Buy Medicines Online up to 70% Off | TnC Pharmacy",

  description:
    "TnC Pharmacy – India's trusted online pharmacy. Buy genuine medicines, healthcare products & ayurvedic supplements at up to 70% off. Pharmacist verified. Free delivery. COD available.",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    title: "Online Pharmacy India | Buy Medicines Online | TnC Pharmacy",

    description:
      "Buy medicines online with up to 70% off. Genuine products, fast delivery, and pharmacist verified orders.",

    url: "https://tncpharmacy.in/",
    siteName: "TnC Pharmacy",
    type: "website",

    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Online Pharmacy India - TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Buy Medicines Online | TnC Pharmacy",

    description:
      "Order medicines online with fast delivery, genuine products, and best prices.",

    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default async function HomePage() {
  const { groupCare, category5, category7, category9, categories } =
    await getHomeData();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "TnC Pharmacy",
            url: "https://tncpharmacy.in",
            logo: "https://tncpharmacy.in/og-image.png",
            sameAs: ["https://www.facebook.com/", "https://www.instagram.com/"],
          }),
        }}
      />

      <HomeClient
        initialGroupCare={groupCare}
        initialCategory5={category5}
        initialCategory7={category7}
        initialCategory9={category9}
        initialCategories={categories}
      />
    </>
  );
}

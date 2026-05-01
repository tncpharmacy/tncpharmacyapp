import { getMenuData } from "@/lib/server/menu";
import SiteHeader from "@/app/(user)/components/header/header";
import "bootstrap/dist/css/bootstrap.min.css";

// export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata = {
  metadataBase: new URL("https://tncpharmacy.in"),

  title: {
    default: "Online Pharmacy | Medicine Delivery | TnC Pharmacy",
    template: "%s | TnC Pharmacy",
  },

  description:
    "Buy medicines online from TnC Pharmacy with fast delivery, genuine products, and best prices. Order healthcare, wellness, and pharmacy products across India.",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  openGraph: {
    title: "Online Pharmacy | Medicine Delivery | TnC Pharmacy",
    description:
      "Buy medicines online from TnC Pharmacy with fast delivery, genuine products, and best prices.",
    url: "https://tncpharmacy.in",
    siteName: "TnC Pharmacy",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Online Pharmacy | TnC Pharmacy",
    description: "Buy medicines online with fast delivery and best prices.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  alternates: {
    canonical: "https://tncpharmacy.in",
  },
};

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { categories, subcategories } = await getMenuData();

  return (
    <>
      <SiteHeader
        initialCategories={categories}
        initialSubcategories={subcategories}
      />
      {children}
    </>
  );
}

import HealthBagClient from "./HealthBagClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your Cart | Health Bag ",
  description:
    "Review items in your health bag, manage quantities, and proceed to checkout securely at TnC Pharmacy.",
  robots: {
    index: false,
    follow: true,
  },

  alternates: {
    canonical: "https://tncpharmacy.in/health-bag",
  },

  openGraph: {
    title: "Your Health Bag | TnC Pharmacy",
    description: "Review your selected medicines and proceed to checkout.",
    url: "https://tncpharmacy.in/health-bag",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "TnC Pharmacy Cart",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Your Cart | TnC Pharmacy",
    description: "Review your cart and proceed to checkout",
    images: ["https://tncpharmacy.in/og-image.png"],
  },
};

export default function Page() {
  return <HealthBagClient />;
}

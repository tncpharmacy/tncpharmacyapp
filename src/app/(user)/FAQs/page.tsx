import FAQsClient from "./FAQsClient";

export const metadata = {
  title: "FAQs | Help & Support",
  description:
    "Find answers to frequently asked questions about orders, delivery, payments, returns, and more at TnC Pharmacy.",

  alternates: {
    canonical: "https://tncpharmacy.in/FAQs",
  },

  openGraph: {
    title: "FAQs | TnC Pharmacy",
    description:
      "Get answers to common questions about TnC Pharmacy services, orders, and delivery.",
    url: "https://tncpharmacy.in/faqs",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "FAQs - TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "FAQs | TnC Pharmacy",
    description: "Find quick answers to your questions about TnC Pharmacy.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <FAQsClient />;
}

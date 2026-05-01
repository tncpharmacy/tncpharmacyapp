import FAQsClient from "./FAQsClient";

export const metadata = {
  title: "FAQs | TnC Pharmacy -- Ordering, Delivery, Payments & Returns",
  description:
    "Find answers to common questions about ordering medicines online, prescription upload, delivery timelines, payment methods, returns and refunds at TnC Pharmacy",

  alternates: {
    canonical: "/faqs",
  },

  openGraph: {
    title: "Frequently Asked Questions | TnC Pharmacy",
    description:
      "Find answers about orders, prescriptions, delivery, payments, returns, and refunds at TnC Pharmacy.",
    url: "https://tncpharmacy.in/faqs",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "TnC Pharmacy FAQs",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "TnC Pharmacy FAQs",
    description:
      "Answers to common questions about medicines, delivery, payments, and returns.",
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

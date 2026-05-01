import ContactUsClient from "./ContactUsClient";

export const metadata = {
  title: "Contact TnC Pharmacy | 24x7 Support | Noida, Uttar Pradesh",

  description:
    "Contact TnC Pharmacy at +91 8062521280 (24x7). Visit us at Sector 29, Noida. Email support@tncpharmacy.in. Fast response guaranteed.",

  alternates: {
    canonical: "/contact-us",
  },

  openGraph: {
    title: "Contact TnC Pharmacy | 24x7 Customer Support",

    description:
      "Get in touch with TnC Pharmacy via phone, email, or visit our Noida store. 24x7 support available.",

    url: "https://tncpharmacy.in/contact-us",
    siteName: "TnC Pharmacy",
    type: "website",

    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Contact TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Contact TnC Pharmacy Support",

    description:
      "Need help? Contact TnC Pharmacy via phone, email, or visit our Noida location.",

    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function Page() {
  return <ContactUsClient />;
}

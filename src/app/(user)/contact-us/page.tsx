import ContactUsClient from "./ContactUsClient";

export const metadata = {
  title: "Contact Us | Customer Support & Help",
  description:
    "Get in touch with TnC Pharmacy for support, queries, or feedback. Contact us via phone, email, or visit our store in Noida.",

  alternates: {
    canonical: "https://tncpharmacy.in/contact-us",
  },

  openGraph: {
    title: "Contact TnC Pharmacy",
    description:
      "Reach out to TnC Pharmacy for support, queries, and assistance.",
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
    title: "Contact TnC Pharmacy",
    description: "Need help? Contact our support team anytime.",
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

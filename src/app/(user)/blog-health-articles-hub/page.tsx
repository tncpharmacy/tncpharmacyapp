import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";

export const metadata = {
  title:
    "Health Blog | TnC Pharmacy – Medicine Tips, Wellness & Health Articles",
  description:
    "Read expert health articles, medicine guides, wellness tips, and healthcare advice on the TnC Pharmacy blog. Stay informed and manage your health better.",
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title:
      "Health Blog | TnC Pharmacy – Medicine Tips, Wellness & Health Articles",
    description:
      "Read expert health articles, medicine guides, wellness tips, and healthcare advice on the TnC Pharmacy blog.",
    url: "https://tncpharmacy.in/blog",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "TnC Pharmacy Health Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title:
      "Health Blog | TnC Pharmacy – Medicine Tips, Wellness & Health Articles",
    description:
      "Read expert health articles and wellness tips on TnC Pharmacy blog.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const articles = [
  "1. Top 10 Generic Medicines That Can Save You Up to 70% on Healthcare Costs",
  "2. How to Read a Medicine Prescription: A Simple Guide for Patients",
  "3. Diabetes Management: Essential Medicines and Monitoring Devices You Need at Home",
  "4. 5 Ayurvedic Supplements for Daily Immunity Boosting",
  "5. Understanding Expiry Dates on Medicines: When to Worry and When Not To",
  "6. Heart Health Essentials: Medicines and Devices Every Household Should Have",
  "7. Why You Should Buy from a Licensed Online Pharmacy (and How to Verify)",
  "8. Monsoon Health Kit: Must-Have Medicines for the Rainy Season in India",
  "9. Best Vitamins and Supplements for Women's Health After 30",
  "10. Blood Pressure at Home: How to Use a BP Monitor Correctly",
  "11. Baby Care Essentials: Safe OTC Products for Newborns and Infants",
  "12. Kidney Care: Diet Tips and Supplements for Better Renal Health",
];

export default function BlogHealthArticlesHub() {
  return (
    <>
      <div className="container my-5">
        <h1 className="fw-bold text-primary mb-4">
          BLog / Health Articles Hub
        </h1>

        <p>
          A blog section will significantly boost your SEO rankings and
          establish TnC Pharmacy as a trusted health information source. Here
          are starter article topics:
        </p>

        <ul className="mt-4">
          {articles.map((item, i) => (
            <li key={i} className="mb-2">
              {item}
            </li>
          ))}
        </ul>
      </div>

      <Footer />
    </>
  );
}

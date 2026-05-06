import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";
import Link from "next/link";

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
  "Top 10 Generic Medicines That Can Save You Up to 70% on Healthcare Costs",
  "How to Read a Medicine Prescription: A Simple Guide for Patients",
  "Diabetes Management: Essential Medicines and Monitoring Devices You Need at Home",
  "5 Ayurvedic Supplements for Daily Immunity Boosting",
  "Understanding Expiry Dates on Medicines: When to Worry and When Not To",
  "Heart Health Essentials: Medicines and Devices Every Household Should Have",
  "Why You Should Buy from a Licensed Online Pharmacy (and How to Verify)",
  "Monsoon Health Kit: Must-Have Medicines for the Rainy Season in India",
  "Best Vitamins and Supplements for Women's Health After 30",
  "Blood Pressure at Home: How to Use a BP Monitor Correctly",
  "Baby Care Essentials: Safe OTC Products for Newborns and Infants",
  "Kidney Care: Diet Tips and Supplements for Better Renal Health",
];

export default function BlogHealthArticlesHub() {
  return (
    <>
      <div className="container py-4">
        <nav aria-label="breadcrumb" style={{ fontSize: "13px" }}>
          <ol className="breadcrumb">
            <nav aria-label="breadcrumb" style={{ fontSize: "13px" }}>
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link href="/" style={{ textDecoration: "none" }}>
                    Home
                  </Link>
                </li>
                <li className="breadcrumb-item text-muted">
                  <span>Blog / Health</span>
                </li>
              </ol>
            </nav>
          </ol>
        </nav>
        <div className="col-lg-12 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
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
      </div>
      <Footer />
    </>
  );
}

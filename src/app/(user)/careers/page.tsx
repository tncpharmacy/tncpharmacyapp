import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import Footer from "@/app/(user)/components/footer/footer";
import Link from "next/link";

export const metadata = {
  title: "Careers at TnC Pharmacy | Join India's Growing Digital Pharmacy",
  description:
    "Join TnC Pharmacy's team. Explore exciting careers in pharmacy, logistics, marketing, and customer support. Apply now and make healthcare accessible.",

  alternates: {
    canonical: "/careers",
  },

  openGraph: {
    title: "Careers at TnC Pharmacy",
    description:
      "Join TnC Pharmacy and grow your career in healthcare, logistics, marketing, and support roles.",
    url: "https://tncpharmacy.in/careers",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Careers at TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Careers at TnC Pharmacy",
    description:
      "Apply for jobs at TnC Pharmacy and grow your career in healthcare.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function Careers() {
  return (
    <div className="bg-light">
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
                  <span>careers</span>
                </li>
              </ol>
            </nav>
          </ol>
        </nav>
        <div className="col-lg-12 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
          <h1 className="fw-bold text-primary mb-4">Careers at TnC Pharmacy</h1>

          <h5 className="fw-bold">Join Our Team</h5>
          <p>
            At TnC Pharmacy, we are building the future of digital healthcare in
            India. We are always looking for passionate, driven individuals who
            share our vision of making quality healthcare accessible to
            everyone. If you are excited about healthcare, technology, and
            making a real difference in {"people's"} lives, we would love to
            hear from you.
          </p>

          <h5 className="fw-bold mt-4">Why Work With Us?</h5>

          <p>
            <strong>Meaningful Impact –</strong> Your work directly helps
            thousands of people access affordable medicines and healthcare
            products.
          </p>

          <p>
            <strong>Growth-Oriented Culture –</strong> We are a fast-growing
            company that values initiative. Your career growth here is limited
            only by your ambition.
          </p>

          <p>
            <strong>Learning Environment –</strong> Work alongside experienced
            pharmacists, healthcare professionals, and technology experts.
          </p>

          <p>
            <strong>Inclusive Workplace –</strong> We value diversity and
            believe the best ideas come from teams with different perspectives
            and backgrounds.
          </p>

          <h5 className="fw-bold mt-4">Current Openings</h5>

          {/* TABLE */}
          <div className="table-responsive mt-3">
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Position</th>
                  <th>Department</th>
                  <th>Location</th>
                  <th>Type</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Pharmacist</td>
                  <td>Operations</td>
                  <td>Noida</td>
                  <td>Full-Time</td>
                </tr>
                <tr>
                  <td>Delivery Executive</td>
                  <td>Logistics</td>
                  <td>Noida / NCR</td>
                  <td>Full-Time</td>
                </tr>
                <tr>
                  <td>Digital Marketing Executive</td>
                  <td>Marketing</td>
                  <td>Noida / Remote</td>
                  <td>Full-Time</td>
                </tr>
                <tr>
                  <td>Customer Support Executive</td>
                  <td>Support</td>
                  <td>Noida</td>
                  <td>Full-Time</td>
                </tr>
                <tr>
                  <td>Content Writer (Health/Wellness)</td>
                  <td>Marketing</td>
                  <td>Remote</td>
                  <td>Part-Time / Freelance</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-3">
            <strong>How to Apply:</strong> Send your resume with the subject
            line {'"Application for [Position Name]"'} to
            careers@tncpharmacy.in. We typically respond within 5–7 business
            days.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
}

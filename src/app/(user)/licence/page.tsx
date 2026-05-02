import React from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "@/app/(user)/components/footer/footer";

export const metadata = {
  title:
    "Licence & Registration | TnC Pharmacy – Fully Licensed Online Pharmacy",
  description:
    "TnC Pharmacy is a fully licensed online pharmacy under the Drugs and Cosmetics Act. View our drug licence, pharmacist registration, GSTIN, and FSSAI details.",

  alternates: {
    canonical: "/licence",
  },

  openGraph: {
    title: "Licence & Registration | TnC Pharmacy",
    description:
      "View licence details including drug licence, GSTIN, and pharmacist registration.",
    url: "https://tncpharmacy.in/licence",
    siteName: "TnC Pharmacy",
    type: "website",
    images: [
      {
        url: "https://tncpharmacy.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "Licence TnC Pharmacy",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Licence & Registration | TnC Pharmacy",
    description: "Fully licensed and compliant online pharmacy.",
    images: ["https://tncpharmacy.in/og-image.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function Licence() {
  return (
    <div className="bg-light">
      <section className="container my-5">
        <div className="col-lg-10 mx-auto bg-white p-4 p-md-5 shadow-sm rounded-3">
          {/* H1 */}
          <h1 className="fw-bold text-primary mb-4">
            Our Licences & Registrations
          </h1>

          <p>
            TnC Pharmacy and Labs Pvt. Ltd. is a fully licensed and registered
            pharmacy operating in compliance with Indian pharmaceutical
            regulations. Below are our licence details:
          </p>

          {/* TABLE */}
          <div className="table-responsive mt-4">
            <table className="table table-bordered">
              <thead className="table-dark">
                <tr>
                  <th>Licence / Registration</th>
                  <th>Details</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>Drug Licence No. (Retail)</td>
                  <td>UP/25B/XXXX</td>
                </tr>

                <tr>
                  <td>Drug Licence No. (Wholesale)</td>
                  <td>UP/20B/XXXX</td>
                </tr>

                <tr>
                  <td>Pharmacist Registration No.</td>
                  <td>[Insert Registered Pharmacist Number]</td>
                </tr>

                <tr>
                  <td>GST Registration No.</td>
                  <td>09XXXXXXXXXXXX</td>
                </tr>

                <tr>
                  <td>Company CIN</td>
                  <td>[Insert CIN Number]</td>
                </tr>

                <tr>
                  <td>FSSAI Licence No. (if applicable)</td>
                  <td>[Insert FSSAI Number]</td>
                </tr>

                <tr>
                  <td>Registered Pharmacist Name</td>
                  <td>[Insert Pharmacist Name]</td>
                </tr>

                <tr>
                  <td>Registered Address</td>
                  <td>
                    Shop No. 61, Ground Floor, Ganga Shopping Complex, Block 1,
                    Sector 29, Noida, Uttar Pradesh – 201301
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* FOOT TEXT */}
          <p className="mt-4">
            All licences are valid and renewed as per regulatory requirements.
            Copies of our licences are available for inspection at our
            registered premises during business hours.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

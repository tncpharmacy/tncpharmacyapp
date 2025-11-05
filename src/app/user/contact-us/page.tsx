"use client";

import React, { useState } from "react";
import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import SiteHeader from "@/app/user/components/header/header";
import Footer from "@/app/user/components/footer/footer";
import Input from "@/app/components/Input/InputColSm";
import InputTextArea from "@/app/components/Input/InputTextArea";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent successfully! 🚀");
    setFormData({ name: "", email: "", mobile: "", subject: "", message: "" });
  };

  return (
    <>
      <div className="page-wrapper">
        <SiteHeader />

        {/* ======= Page Title ======= */}
        <div className="page-header text-center py-5 bg-light border-bottom">
          <h2 className="fw-bold text-primary mb-2">Contact Us</h2>
          <p className="text-muted">
            We’d love to hear from you! Reach out for any queries or feedback.
          </p>
        </div>

        {/* ======= Contact Section ======= */}
        <div className="container my-5">
          <div className="row g-4 align-items-stretch">
            {/* Left: Contact Info */}
            <div className="col-lg-5">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body p-4">
                  <h5 className="fw-bold text-primary mb-3">Get In Touch</h5>
                  <hr
                    style={{
                      border: "2px solid rgb(14 44 228)",
                      marginBottom: "50px",
                    }}
                  />
                  <p className="text-muted mb-4">
                    Have questions about our services or need support? Feel free
                    to contact us — we’re here to help!
                  </p>

                  <ul className="list-unstyled contact-list">
                    <li className="mb-3">
                      <i className="bi bi-geo-alt-fill text-primary me-2"></i>
                      <span>
                        TnC Pharmacy, Ganga Shopping Complex, Sector 29, Noida,
                        U.P. – 201303
                      </span>
                    </li>
                    <li className="mb-3">
                      <i className="bi bi-telephone-fill text-primary me-2"></i>
                      <span>+91 97178 XXXXX</span>
                    </li>
                    <li className="mb-3">
                      <i className="bi bi-envelope-fill text-primary me-2"></i>
                      <span>care@tncpharmacy.in</span>
                    </li>
                    <li>
                      <i className="bi bi-whatsapp text-success me-2"></i>
                      <span>+91 97178 XXXXX (24x7 Support)</span>
                    </li>
                  </ul>

                  <div className="mt-4">
                    <h6 className="fw-semibold text-primary mb-2">Follow us</h6>
                    <div className="d-flex gap-3">
                      <a href="#" className="text-dark fs-5">
                        <i className="bi bi-facebook"></i>
                      </a>
                      <a href="#" className="text-dark fs-5">
                        <i className="bi bi-instagram"></i>
                      </a>
                      <a href="#" className="text-dark fs-5">
                        <i className="bi bi-twitter-x"></i>
                      </a>
                      <a href="#" className="text-dark fs-5">
                        <i className="bi bi-linkedin"></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="col-lg-7">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body p-4">
                  <h5 className="fw-bold text-primary mb-3">
                    Send Us a Message
                  </h5>
                  <hr
                    style={{
                      border: "2px solid rgb(14 44 228)",
                      marginBottom: "40px",
                    }}
                  />
                  <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                      <Input
                        label="Name"
                        type="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        colSm={12}
                        required
                      />
                      <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        colSm={6}
                        required
                      />
                      <Input
                        label="Mobile"
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        colSm={6}
                        required
                      />
                      <Input
                        label="Subject"
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        colSm={12}
                        required
                      />
                      <div className="col-md-12">
                        <div className="txt_col">
                          <span className="lbl1">Contact Summary</span>
                          <textarea
                            className="txt1 h-50"
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            rows={6}
                          ></textarea>
                        </div>
                      </div>

                      <div className="col-12 text-end">
                        <button
                          type="submit"
                          className="btn btn-primary px-4 py-2 rounded-pill"
                        >
                          Send Message
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* ======= Map ======= */}
          <div className="mt-5">
            <iframe
              src="https://www.google.com/maps?q=Ganga%20Shopping%20Complex%2C%20Sector%2029%2C%20Noida&output=embed"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

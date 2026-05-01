"use client";

import "../css/site-style.css";
import "../css/user-style.css";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { useState } from "react";
import Footer from "@/app/(user)/components/footer/footer";
import toast from "react-hot-toast";
import Input from "@/app/components/Input/InputColSm";
import { useAppDispatch } from "@/lib/hooks";
import { addContactForm } from "@/lib/features/contactUsSlice/contactUsSlice";
import Link from "next/link";

export default function ContactUs() {
  const dispatch = useAppDispatch();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Mobile: only digits + max 10
    if (name === "mobile") {
      const numericValue = value.replace(/\D/g, ""); // remove non-digit
      if (numericValue.length <= 10) {
        setFormData({ ...formData, [name]: numericValue });
      }
      return;
    }

    // Name max 25
    if (name === "name" && value.length > 25) return;

    // Subject max 40
    if (name === "subject" && value.length > 40) return;

    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const { name, email, mobile, subject, message } = formData;

    // Name max 25
    if (!name.trim()) return "Name is required";
    if (name.length > 25) return "Name cannot exceed 25 characters";

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return "Invalid email format";

    // Mobile: only digits + max 10
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(mobile)) return "Mobile must be exactly 10 digits";

    // Subject max 40
    if (!subject.trim()) return "Subject is required";
    if (subject.length > 40) return "Subject cannot exceed 40 characters";

    // Message
    if (!message.trim()) return "Message is required";

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateForm();

    if (error) {
      toast.error(error);
      return;
    }
    setLoading(true);

    try {
      const result = await dispatch(
        addContactForm({
          name: formData.name,
          email: formData.email,
          number: formData.mobile, // backend expects 'number'
          subject: formData.subject,
          contact_summary: formData.message,
        })
      ).unwrap();

      if (result) {
        toast.success("Message sent successfully! 🚀");

        setFormData({
          name: "",
          email: "",
          mobile: "",
          subject: "",
          message: "",
        });
      }
    } catch (err) {
      toast.error("Something went wrong! Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-light">
        <h1 className="visually-hidden">
          Contact TnC Pharmacy – Online Pharmacy in Noida | 24x7 Support
        </h1>
        {/* ===== HEADER ===== */}
        <div className="text-center py-5 border-bottom bg-white">
          <h1 className="fw-bold text-primary">Contact Us</h1>
          <p className="text-muted">
            We are here to help! Reach out for any queries or support.
          </p>
          {/* 🔥 ADD THIS HERE */}
          <p className="text-muted small">
            Visit TnC Pharmacy in Noida Sector 29 for genuine medicines and
            healthcare products. We provide fast medicine delivery across Noida
            and Delhi NCR with pharmacist support and reliable service.
          </p>
        </div>

        <div className="container my-5">
          {/* ===== CONTACT INFO ===== */}
          <div className="row g-4">
            {/* LEFT SIDE - CONTACT INFO */}
            <div className="col-lg-7">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body p-4">
                  <h4 className="fw-bold text-primary mb-3">Get in Touch</h4>

                  <p className="text-muted">
                    We are here to help! Whether you have questions about your
                    order, need help finding a medicine, or want to share
                    feedback, our team is ready to assist you.
                  </p>

                  <h5 className="fw-semibold mt-4">Customer Support</h5>

                  <p className="mb-2">
                    <i className="bi bi-telephone-fill text-primary me-2"></i>
                    <Link
                      href="tel:+918062521280"
                      className="contact-link text-primary"
                    >
                      +91 8062521280
                    </Link>{" "}
                    (24x7)
                  </p>

                  <p className="mb-2">
                    <i className="bi bi-telephone-fill text-primary me-2"></i>
                    <Link
                      href="tel:+917042079595"
                      className="contact-link text-primary"
                    >
                      +91 7042079595
                    </Link>{" "}
                    (Mon-Sat, 10 AM - 6 PM)
                  </p>

                  <p className="mb-2">
                    <i className="bi bi-envelope-fill text-primary me-2"></i>{" "}
                    <Link
                      href="mailto:support@tncpharmacy.in"
                      className="contact-link text-primary"
                    >
                      support@tncpharmacy.in
                    </Link>
                  </p>

                  <p>
                    <i className="bi bi-whatsapp text-success me-2"></i>
                    <Link
                      href="https://wa.me/917042079595"
                      className="contact-link text-primary"
                    >
                      +91 7042079595
                    </Link>
                  </p>

                  <h5 className="fw-semibold mt-4">
                    Business & Partnership Enquiries
                  </h5>

                  <p>
                    <i className="bi bi-envelope-fill text-primary me-2"></i>{" "}
                    <Link
                      href="mailto:business@tncpharmacy.in"
                      className="contact-link text-primary"
                    >
                      business@tncpharmacy.in
                    </Link>
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE - VISIT US CARD */}
            <div className="col-lg-5">
              <div className="card shadow-sm border-0 h-100 bg-primary text-white">
                <div className="card-body p-4">
                  <h4 className="fw-bold mb-3">Visit Us</h4>

                  <p className="mb-3">TnC Pharmacy and Labs Pvt. Ltd.</p>

                  <p className="mb-0">
                    Shop No. 61, Ground Floor,
                    <br />
                    Ganga Shopping Complex, Block 1,
                    <br />
                    Sector 29, Noida,
                    <br />
                    Uttar Pradesh – 201301
                  </p>

                  <hr className="border-light my-4" />

                  <p className="mb-1">📍 Open Hours</p>
                  <p className="small">Mon – Sat: 10:00 AM – 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* ===== GOOGLE MAP ===== */}
          <div className="mb-4 mt-4 card shadow-sm border-0">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.0705780936546!2d77.33277807500595!3d28.567643287025287!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce5e8e17754a9%3A0x7acc32930c3db705!2sGanga%20Shopping%20Complex!5e0!3m2!1sen!2sin!4v1762340476585!5m2!1sen!2sin"
              width="100%"
              height="350"
              style={{ border: 0, borderRadius: "10px" }}
              loading="lazy"
            ></iframe>
          </div>

          {/* ===== CONTACT FORM ===== */}
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h4 className="fw-bold text-primary mb-3">Send Us a Message</h4>

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <Input
                    label="Name"
                    type="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    colSm={6}
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
                    type="select"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    colSm={6}
                    options={[
                      { value: "Order Issue", label: "Order Issue" },
                      { value: "Product Query", label: "Product Query" },
                      {
                        value: "Prescription Help",
                        label: "Prescription Help",
                      },
                      { value: "Feedback", label: "Feedback" },
                      { value: "Other", label: "Other" },
                    ]}
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
                      disabled={loading}
                    >
                      {loading ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

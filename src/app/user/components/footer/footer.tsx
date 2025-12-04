"use client";
import "../../css/footer.css";
import { getCategoriesList } from "@/lib/features/categorySlice/categorySlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { encodeId } from "@/lib/utils/encodeDecode";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

const Footer = () => {
  const dispatch = useAppDispatch();
  const { list: categories } = useAppSelector((state) => state.category);
  const reorderedCategories = [
    ...categories.filter((cat) => cat.category_name === "Medicines"),
    ...categories.filter((cat) => cat.category_name !== "Medicines"),
  ];

  useEffect(() => {
    dispatch(getCategoriesList());
  }, [dispatch]);

  return (
    <footer>
      {/* ======= Top Section ======= */}
      <div className="container">
        <div
          className="row aos-init aos-animate"
          data-aos="fade-up"
          data-aos-duration="1000"
          data-aos-delay="0"
        >
          {/* Left Section */}
          <div className="col-sm-9">
            <div className="row">
              {/* About */}
              <div className="col-sm-3">
                <h5 className="ftr_title">About TnC Pharmacy</h5>
                <ul className="ftr_link">
                  <li>
                    <Link href="/about-us">About Us</Link>
                  </li>
                  {/* <li>
                    <a href="#">Our Stores</a>
                  </li> */}
                  <li>
                    <Link href="#">Careers</Link>
                  </li>
                  <li>
                    <Link href="#">News & Media</Link>
                  </li>
                  {/* <li>
                    <a href="#">Our Blogs</a>
                  </li> */}
                  <li>
                    <Link href="/contact-us">Contact Us</Link>
                  </li>
                  <li>
                    <Link href="/FAQs">FAQs</Link>
                  </li>
                </ul>
              </div>

              {/* Policies */}
              <div className="col-sm-3">
                <h5 className="ftr_title">Our Policies</h5>
                <ul className="ftr_link">
                  <li>
                    <Link href="/return-policy">Return Policy</Link>
                  </li>
                  <li>
                    <Link href="/refund-policy">Refund Policy</Link>
                  </li>
                  <li>
                    <Link href="/shipping-policy">Shipping Policy</Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy">Privacy Policy</Link>
                  </li>
                  <li>
                    <Link href="/terms-and-conditions">Terms & Conditions</Link>
                  </li>
                  {/* <li>
                    <a href="#">Editorial Policy</a>
                  </li> */}
                </ul>
              </div>

              {/* Product Categories 1 */}
              <div className="col-sm-3">
                <h5 className="ftr_title">Product Categories</h5>
                <div className="row product-cat-row">
                  <div className="col-12">
                    <ul className="ftr_link">
                      {reorderedCategories.slice(0, 5).map((cat, idx) => (
                        <li key={idx}>
                          <Link
                            href={
                              cat.id === 1
                                ? "/all-medicine"
                                : `/all-product/${encodeId(cat.id)}`
                            }
                          >
                            {cat.category_name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Product Categories 2 */}
              <div className="col-sm-3">
                <h5 className="ftr_title">Product Categories</h5>
                <div className="row product-cat-row">
                  <div className="col-12">
                    <ul className="ftr_link">
                      {reorderedCategories.slice(5).map((cat, idx) => (
                        <li key={idx}>
                          <Link
                            href={
                              cat.id === 1
                                ? "/all-medicine"
                                : `/all-product/${encodeId(cat.id)}`
                            }
                          >
                            {cat.category_name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-sm-3">
            <h5 className="ftr_title">Customer Service</h5>
            <ul className="ftr_link">
              <li>
                <i className="bi bi-headphones"></i>
                <a href="#">+91 7042079595 </a>
                <span>(10:00 AM - 6:00 PM)</span>
              </li>
              <li>
                <i className="bi bi-whatsapp"></i>
                <a href="#">+91 9625768741 </a>
                <span>(24x7 hrs)</span>
              </li>
              <li>
                <i className="bi bi-envelope"></i>
                <a href="#">care@tncpharmacy.in</a>
              </li>
              <li>
                <span>
                  <b className="fw-semibold ">Address</b>
                  <br />
                  TnC Pharmacy and Labs Pvt. Ltd. Shop No. 61, Ground Floor,
                  Ganga Shopping Complex, Block 1, Sector 29, Noida, Uttar
                  Pradesh – 201301
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ======= Social & Payment ======= */}
      <div className="container">
        <div className="border-top pt-3 mt-3">
          <div className="row">
            <div className="col-sm-6">
              <h5 className="ftr_title">We are social</h5>
              <ul className="ftr_sociallink">
                <li>
                  <Link
                    href="https://www.facebook.com/profile.php?id=61583886771534"
                    className="facebook"
                  >
                    <i className="bi bi-facebook"></i>
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://x.com/tncpharmacylabs"
                    className="twitter"
                  >
                    <i className="bi bi-twitter-x"></i>
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.instagram.com/tnc.pharmacy?igsh=djI4aWY3ZjdwYmRi"
                    className="instagram"
                  >
                    <i className="bi bi-instagram"></i>
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://www.youtube.com/@tncpharmacyandlabs"
                    className="youtube"
                  >
                    <i className="bi bi-youtube"></i>
                  </Link>
                </li>
                {/* <li>
                  <Link href="#" className="linkedin">
                    <i className="bi bi-linkedin"></i>
                  </Link>
                </li> */}
              </ul>
            </div>

            <div className="col-sm-6 text-end">
              <h5 className="ftr_title">Payment Accept</h5>
              <Image
                src="/images/payment-option.png"
                alt="Payment Options"
                className="ftr_payment"
                width={200}
                height={30}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======= Copywrite ======= */}
      <div className="ftr_copywrite">
        <div className="container">
          <div className="row">
            <div className="col-sm-6">
              © 2025 TnC Pharmacy | All Rights Reserved
            </div>
            <div className="col-sm-6 text-end">
              Developed by: <a href="#">Heuristtic Minds</a>
            </div>
          </div>
        </div>
      </div>

      {/* ======= Toast (Download App) ======= */}
      <div className="toast-container position-fixed bottom-0 start-0">
        <div
          id="liveToast"
          className="toast toast-app"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          data-bs-autohide="false"
        >
          <div className="collapse show" id="mobile-qrcode">
            <div className="mob">
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="toast"
                aria-label="Close"
              ></button>
              <Image
                src="/Content/Images/logo.svg"
                className="clogo"
                alt="Logo"
                width={80}
                height={40}
              />
              <Image
                src="/Content/Images/qr-code.jpg"
                className="w-100"
                alt="QR Code"
                width={120}
                height={120}
              />
              <span className="hint">Scan to Download App</span>
            </div>
          </div>
          <Image
            src="/Content/Images/download-app.svg"
            className="toastimg"
            alt="Download App"
            data-bs-toggle="collapse"
            data-bs-target="#mobile-qrcode"
            aria-expanded="true"
            width={60}
            height={60}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;

{
  /* Additional Links (commented for now) */
}
{
  /*
                <div className="col-sm-3">
                  <h5 className="ftr_title">Additional Links</h5>
                  <ul className="ftr_link">
                    <li><a href="#">Order Medicines</a></li>
                    <li><a href="#">Online Doctor Consultation</a></li>
                    <li><a href="#">All Doctors List</a></li>
                    <li><a href="#">Login / Register</a></li>
                  </ul>
                </div>
                */
}

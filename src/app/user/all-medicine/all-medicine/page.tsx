"use client";
import "../../css/site-style.css";
import "../../css/user-style.css";
import SiteHeader from "@/app/user/components/header/header";
import MedicineList from "../../components/MedicineCard/MedicineList";
import { Image } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect } from "react";
import { getMenuMedicinesList } from "@/lib/features/medicineSlice/medicineSlice";

export default function AllMedicine() {
  const dispatch = useAppDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { medicinesList: medicines } = useAppSelector(
    (state) => state.medicine
  );

  useEffect(() => {
    dispatch(getMenuMedicinesList());
  }, [dispatch]);
  return (
    <>
      <div className="page-wrapper">
        <SiteHeader />

        <div className="body_wrap">
          {/* <FilterSidebar /> */}
          <div className="body_right">
            <div className="body_content">
              {/* <Link href={"#"}> */}
              <MedicineList medicines={medicines || []} />
              {/* </Link> */}
            </div>
          </div>
        </div>

        <footer>
          <div className="container">
            <div
              className="row aos-init aos-animate"
              data-aos="fade-up"
              data-aos-duration="1000"
              data-aos-delay="0"
            >
              <div className="col-sm-9">
                <div className="row">
                  <div className="col-sm-3">
                    <h5 className="ftr_title">About TnC Pharmacy</h5>
                    <ul className="ftr_link">
                      <li>
                        <a href="#">About us</a>
                      </li>
                      <li>
                        <a href="#">Contact Us</a>
                      </li>
                      <li>
                        <a href="#">Our Stores</a>
                      </li>
                      <li>
                        <a href="#">Careers</a>
                      </li>
                      <li>
                        <a href="#">News & Media</a>
                      </li>
                      <li>
                        <a href="#">Our Blogs</a>
                      </li>
                      <li>
                        <a href="#">FAQ’s</a>
                      </li>
                    </ul>
                  </div>
                  <div className="col-sm-3">
                    <h5 className="ftr_title">Our Policies</h5>
                    <ul className="ftr_link">
                      <li>
                        <a href="#">Returns & Refunds</a>
                      </li>
                      <li>
                        <a href="#">Shipping Terms</a>
                      </li>
                      <li>
                        <a href="#">Privacy Policy</a>
                      </li>
                      <li>
                        <a href="#">Terms and Conditions</a>
                      </li>
                      <li>
                        <a href="#">Editorial Policy</a>
                      </li>
                    </ul>
                  </div>
                  <div className="col-sm-3">
                    <h5 className="ftr_title">Product Categories</h5>
                    <ul className="ftr_link">
                      <li>
                        <a href="#">Medicines</a>
                      </li>
                      <li>
                        <a href="#">Personal Care</a>
                      </li>
                      <li>
                        <a href="#">Women Care</a>
                      </li>
                      <li>
                        <a href="#">Baby Care</a>
                      </li>
                      <li>
                        <a href="#">Sports Nutritional</a>
                      </li>
                      <li>
                        <a href="#">Ayurveda</a>
                      </li>
                      <li>
                        <a href="#">Health Devices</a>
                      </li>
                    </ul>
                  </div>
                  <div className="col-sm-3">
                    <h5 className="ftr_title">Additional Links</h5>
                    <ul className="ftr_link">
                      <li>
                        <a href="#">Order Medicines</a>
                      </li>
                      <li>
                        <a href="#">Online Doctor Consultation</a>
                      </li>
                      <li>
                        <a href="#">All Doctors List</a>
                      </li>
                      <li>
                        <a href="#">Login/Register</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="col-sm-3">
                <h5 className="ftr_title">Customer Service</h5>
                <ul className="ftr_link">
                  <li>
                    <i className="bi bi-headphones"></i>
                    <a href="#">+91 97178 XXXXX</a>
                    <span>(10:00 AM - 6:00 PM)</span>
                  </li>
                  <li>
                    <i className="bi bi-whatsapp"></i>
                    <a href="#">+91 97178 XXXXX</a>
                    <span>(24x7 hrs)</span>
                  </li>
                  <li>
                    <i className="bi bi-envelope"></i>
                    <a href="#">care@tncpharmacy.in</a>
                  </li>
                  <li>
                    <span>
                      <b className="fw-semibold">Address</b>
                      <br /> TnC Pharmacy, Ganga Shopping Complex, Sector 29,
                      Noida, U.P.  - 201303
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="container">
            <div className="border-top pt-3 mt-3">
              <div className="row">
                <div className="col-sm-6">
                  <h5 className="ftr_title">We are social</h5>
                  <ul className="ftr_sociallink">
                    <li>
                      <a href="#">
                        <i className="bi bi-facebook"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bi bi-twitter-x"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bi bi-instagram"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bi bi-youtube"></i>
                      </a>
                    </li>
                    <li>
                      <a href="#">
                        <i className="bi bi-linkedin"></i>
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="col-sm-6 text-end">
                  <div>
                    <h5 className="ftr_title">Payment Accept</h5>
                    <Image
                      src="images/payment-option.png"
                      alt=""
                      className="ftr_payment"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
                    alt=""
                  />
                  <Image
                    src="/Content/Images/qr-code.jpg"
                    className="w-100"
                    alt=""
                  />
                  <span className="hint">Scan to Download App</span>
                </div>
              </div>
              <Image
                src="/Content/Images/download-app.svg"
                className="toastimg"
                alt="download app"
                data-bs-toggle="collapse"
                data-bs-target="#mobile-qrcode"
                aria-expanded="true"
              />
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

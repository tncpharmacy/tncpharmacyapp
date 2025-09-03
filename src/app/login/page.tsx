"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../styles/style-login.css";
import Link from "next/link";
import { Button, Modal } from "react-bootstrap";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const handleLogin = () => {
    if (email === "1" && password === "1") {
      router.push(`/admin-dashboard`);
    } else if (email === "2" && password === "2") {
      router.push(`/doctor/doctor-dashboard`);
    } else if (email === "3" && password === "3") {
      router.push(`/pharmacy/pharmacy-dashboard`);
    } else if (email === "4" && password === "4") {
      router.push(`/pharmacist/pharmacist-dashboard`);
    } else {
      alert("Invalid credentials!");
    }
  };

  useEffect(() => {
    const countDownDate = new Date("Sep 22, 2025 15:37:25").getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = countDownDate - now;

      if (distance < 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <section>
        <div className="banner">
          <ul className="cb-slideshow">
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
            <li><span></span></li>
          </ul>
        </div>
      </section>
      <div id="box">
        <div>
          <Button className="btnmodal" variant="primary" onClick={handleShow}>
            Login
          </Button>
          <Modal size="lg" show={show} onHide={handleClose} centered className="loginmodal">
            <Modal.Body className="p-0">
              <div className="row">
                <div className="col-md-5 pe-0 d-none d-md-block">
                  <div className="">
                    <img src="../images/login-banner-1.jpg" className="w-100" alt="" />
                  </div>
                </div>
                <div className="col-md-7 ps-md-0 d-flex align-items-center">
                  <div className="login_form">
                    <span className="login_title">Login here</span>
                    <div className="row_login">
                      <span className="lbllogin">Email ID.</span>
                      <input
                        type="text"
                        className="txtlogin"
                        placeholder="Enter EmailID"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="row_login">
                      <span className="lbllogin">Password </span>
                      <input
                        type="password"
                        className="txtlogin"
                        placeholder="Enter Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />

                    </div>
                    <button
                      onClick={handleLogin}
                      className="btnlogin"
                    >
                      Login
                    </button>
                  </div>
                </div>
              </div>

            </Modal.Body>
          </Modal>

          <div className="middle">
            <div className="logo">
              <img src="images/logo-v.png" alt="" width="100%" />
            </div>
            <h2>Your trusted tech-enabled platform for modern healthcare solutions</h2>
            <h3>Coming soon...</h3>
            <div id="countdowntime" className="flex gap-2 text-center">
              <span>{timeLeft.days}<small> Days </small></span>
              <span>{timeLeft.hours}<small> Hours </small></span>
              <span>{timeLeft.minutes}<small> Minutes </small></span>
              <span>{timeLeft.seconds}<small> Seconds </small></span>
            </div>
            <span>
              Follow us:
              <a href="https://x.com/tncpharmacy" target="_blank"><i className="bi bi-twitter-x"></i></a>
              <a href="https://www.youtube.com/@TncPharmacy" target="_blank"><i className="bi bi-youtube"></i></a>
              <a href="https://www.facebook.com/people/TnC-Pharmacy/61577596072179" target="_blank"><i
                className="bi bi-facebook"></i></a>
              <a href="https://instagram.com/tncpharmacy" target="_blank"><i className="bi bi-instagram"></i></a>
              <a href="https://www.linkedin.com/company/tncpharmacy/" target="_blank"><i
                className="bi bi-linkedin"></i></a>
            </span>

          </div>

          <p className="coporight">
            ©
            {new Date().getFullYear()}
            &nbsp;TnC Pharmacy.
          </p>
        </div>

      </div>
    </>
  );
}

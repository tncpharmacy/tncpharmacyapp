"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "../styles/style-login.css";
import { Button, Modal } from "react-bootstrap";
import { login, getAccessToken } from "@/lib/auth/auth";
import { LoginResponse } from "@/types/login";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { loginUser } from "@/lib/features/authSlice/authSlice";

export default function LoginForm() {
  const dispatch = useAppDispatch();
  const { user, loading, error, restoreComplete } = useAppSelector(
    (state) => state.auth
  );
  const [login_id, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const [show, setShow] = useState(false);
  //const [error, setError] = useState<string | null>(null);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // ✅ redirect after login / restore
  useEffect(() => {
    if (!restoreComplete) return;
    if (user) redirectUser(user.user_type);
  }, [restoreComplete, user]);

  const redirectUser = (userType: number) => {
    switch (userType) {
      case 1:
        router.push("/admin-dashboard");
        break;
      case 2:
      case 3:
        router.push("/doctor/doctor-dashboard");
        break;
      case 4:
        router.push("/pharmacy/pharmacy-dashboard");
        break;
      case 5:
        router.push("/pharmacist/pharmacist-dashboard");
        break;
    }
  };

  const handleLogin = async () => {
    const res = await dispatch(loginUser({ login_id, password }));
    if (loginUser.fulfilled.match(res))
      redirectUser(res.payload.user.user_type);
  };

  if (!mounted) return null;

  return (
    <>
      <section>
        <div className="banner">
          <ul className="cb-slideshow">
            {[...Array(6)].map((_, i) => (
              <li key={i}>
                <span></span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div id="box">
        <div>
          <Button className="btnmodal" variant="primary" onClick={handleShow}>
            Login
          </Button>
          <Modal
            size="lg"
            show={show}
            onHide={handleClose}
            centered
            className="loginmodal"
          >
            <Modal.Body className="p-0">
              <div className="row">
                <div className="col-md-5 pe-0 d-none d-md-block">
                  <img
                    src="../images/login-banner-1.jpg"
                    className="w-100"
                    alt="Login Banner"
                  />
                </div>
                <div className="col-md-7 ps-md-0 d-flex align-items-center">
                  <div className="login_form">
                    <span className="login_title">Login here</span>
                    <div className="row_login">
                      <span className="lbllogin">Email ID</span>
                      <input
                        type="text"
                        className="txtlogin"
                        placeholder="Enter EmailID"
                        value={login_id}
                        maxLength={10}
                        onChange={(e) => setLoginId(e.target.value)}
                      />
                    </div>
                    <div className="row_login">
                      <span className="lbllogin">Password</span>
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
                      disabled={loading}
                      className="btnlogin"
                    >
                      {loading ? "Logging in..." : "Login"}
                    </button>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                  </div>
                </div>
              </div>
            </Modal.Body>
          </Modal>
        </div>
      </div>
    </>
  );
}

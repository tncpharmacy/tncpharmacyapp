"use client";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { loginUser } from "@/lib/features/authSlice/authSlice";
import "../styles/style-login.css";

interface LoginFormProps {
  show: boolean;
  handleClose: () => void;
}

export default function Login({ show, handleClose }: LoginFormProps) {
  const dispatch = useAppDispatch();
  const { user, loading, error, restoreComplete } = useAppSelector(
    (state) => state.auth
  );

  const router = useRouter();
  const [login_id, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // ✅ Wrap redirectUser in useCallback so it stays stable
  const redirectUser = useCallback(
    (userType: number) => {
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
    },
    [router] // dependency for useCallback
  );

  useEffect(() => {
    if (!restoreComplete) return;
    if (user) redirectUser(user.user_type);
  }, [restoreComplete, user, redirectUser]);

  const handleLogin = async () => {
    const res = await dispatch(loginUser({ login_id, password }));
    if (loginUser.fulfilled.match(res)) {
      redirectUser(res.payload.user.user_type);
      handleClose(); // close modal after success
    }
  };

  if (!mounted) return null;

  return (
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
                <span className="lbllogin">Login ID</span>
                <input
                  type="text"
                  className="txtlogin"
                  value={login_id}
                  onChange={(e) => setLoginId(e.target.value)}
                />
              </div>
              <div className="row_login">
                <span className="lbllogin">Password</span>
                <input
                  type="password"
                  className="txtlogin"
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
  );
}

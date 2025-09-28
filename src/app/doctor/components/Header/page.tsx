import LogoutButton from "@/app/components/Logout/LogoutButton";
import ProfileMenu from "@/app/components/ProfileMenu/ProfileMenu";
import Link from "next/link";

export default function Header() {
  return (
    <div className="header">
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-6">
            <a className="logo" href="dashboard.html">
              <img src="/images/logo.png" alt="" />
            </a>
          </div>
          <div className="col-sm-6 text-right">
            <div className="header-right">
              <div className="user_info">
                Hi: <b>Doctor</b>
              </div>
              <div className="user_dropdown">
                <span className="dropbtn">
                  <i className="bi bi-list"></i>
                </span>
                <div className="user_dropdown-content">
                  <div className="p-2 bg-white text-center">
                    <ProfileMenu />
                    <LogoutButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

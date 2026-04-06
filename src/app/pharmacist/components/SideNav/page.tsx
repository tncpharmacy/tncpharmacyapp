"use client";

import { SetStateAction, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "../../css/pharmacy-style.css";

export default function SideNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };
  console.log("pathname", pathname);
  return (
    <div className="side_menu">
      <span className="btnsidemenu cursor-pointer text-xl">
        <i className="bi bi-arrow-left"></i>
      </span>

      <ul className="side_menu-list">
        <li>
          <Link
            href="/pharmacist/retail-counter"
            className="link"
            style={{ outline: "none" }}
            onFocus={(e) => (e.currentTarget.style.backgroundColor = "#e6f0ff")}
            onBlur={(e) => (e.currentTarget.style.backgroundColor = "")}
          >
            <i className="bi bi-receipt-cutoff"></i> Retail Counter
          </Link>
        </li>

        <li>
          <Link
            href="/pharmacist/retail-counter-prescription"
            className={`link ${
              pathname.startsWith("/pharmacist/retail-counter-prescription")
                ? "activeLink"
                : ""
            }`}
            style={{ outline: "none" }}
            onFocus={(e) => (e.currentTarget.style.backgroundColor = "#e6f0ff")}
            onBlur={(e) => (e.currentTarget.style.backgroundColor = "")}
          >
            <i className="bi bi-file-medical"></i> Patient Prescriptions
          </Link>
        </li>
        <li>
          <Link
            href="/pharmacist/patient-health-bag"
            className="link"
            style={{ outline: "none" }}
            onFocus={(e) => (e.currentTarget.style.backgroundColor = "#e6f0ff")}
            onBlur={(e) => (e.currentTarget.style.backgroundColor = "")}
          >
            <i className="bi bi-cart-plus-fill"></i> Patient HealthBag
          </Link>
        </li>
        <li>
          <Link
            href="/pharmacist/order"
            className="link"
            style={{ outline: "none" }}
            onFocus={(e) => (e.currentTarget.style.backgroundColor = "#e6f0ff")}
            onBlur={(e) => (e.currentTarget.style.backgroundColor = "")}
          >
            <i className="bi bi-clipboard-check"></i> Order
          </Link>
        </li>
        {/* <li>
          <Link href="/pharmacist/purchase-invoice" className="link">
            <i className="bi bi-receipt-cutoff"></i> Purchase Invoice
          </Link>
        </li>
        <li>
          <Link href="/pharmacist/stock" className="link">
            <i className="bi bi-box"></i> Stock
          </Link>
        </li> */}
        {/* <li>
          <div onClick={() => toggleMenu("product")} className="link arrow">
            <i className="bi bi-box-seam"></i> Product Master
          </div>
          {openMenu === "product" && (
            <ul className="submenu myList">
              <li>
                <Link href="/pharmacist/medicine">
                  <i className="bi bi-capsule"></i> Medicine Details
                </Link>
              </li>
              <li>
                <Link href="/pharmacist/other-product">
                  <i className="bi bi-box-seam"></i> Other Product Details
                </Link>
              </li>
            </ul>
          )}
        </li> */}
        {/* <li
          className={`${openMenu === "Prescription-Handling" ? "active" : ""}`}
        >
          <div
            onClick={() => toggleMenu("Prescription-Handling")}
            className="link"
          >
            <i className="bi bi-prescription"></i> Prescription Handling
          </div>
        </li>
        <li className={`${openMenu === "Billing-Sales" ? "active" : ""}`}>
          <div onClick={() => toggleMenu("Billing-Sales")} className="link">
            <i className="bi bi-file-earmark-text"></i> Billing & Sales
          </div>
        </li> */}
        {/* <li>
          <Link href="/pharmacist/supplier" className="link">
            <i className="bi bi-truck"></i> Supplier
          </Link>
        </li> */}
        <li>
          <div
            onClick={() => toggleMenu("settings")}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                toggleMenu("settings");
              }
            }}
            tabIndex={0}
            className="link arrow"
            style={{
              outline: "none",
            }}
            onFocus={(e) => (e.currentTarget.style.backgroundColor = "#e6f0ff")}
            onBlur={(e) => (e.currentTarget.style.backgroundColor = "")}
          >
            <i className="bi bi-gear-wide-connected"></i> Profile & Settings
          </div>
          {openMenu === "settings" && (
            <ul className="submenu">
              <li>
                <Link
                  href="/pharmacist/view-profile"
                  style={{ outline: "none" }}
                  onFocus={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e6f0ff")
                  }
                  onBlur={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  Profile{" "}
                </Link>
              </li>
              <li>
                <Link
                  href="/pharmacist/change-password"
                  style={{ outline: "none" }}
                  onFocus={(e) =>
                    (e.currentTarget.style.backgroundColor = "#e6f0ff")
                  }
                  onBlur={(e) => (e.currentTarget.style.backgroundColor = "")}
                >
                  Change Password
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}

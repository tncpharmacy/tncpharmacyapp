"use client";

import { SetStateAction, useState } from "react";
import Link from "next/link";

export default function SideNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  return (
    <div className="side_menu">
      <span className="btnsidemenu cursor-pointer text-xl">
        <i className="bi bi-arrow-left"></i>
      </span>

      <ul className="side_menu-list">
        <li>
          <Link href="/pharmacy-dashboard" className="link">
            <i className="bi bi-activity"></i> Dashboard
          </Link>
        </li>
        <li>
          <div onClick={() => toggleMenu("medicine")} className="link arrow">
            <i className="bi bi-capsule-pill"></i> Medicine
          </div>
          {openMenu === "medicine" && (
            <ul className="submenu">
              <li>
                <Link href="#">Book Medicine</Link>
              </li>
            </ul>
          )}
        </li>
        <li className={`${openMenu === "Stock-Management" ? "active" : ""}`}>
          <div onClick={() => toggleMenu("Stock-Management")} className="link">
            <i className="bi bi-box"></i> Stock
          </div>
        </li>
        <li
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
        </li>
        <li className={`${openMenu === "Purchase-Supplier" ? "active" : ""}`}>
          <div onClick={() => toggleMenu("Purchase-Supplier")} className="link">
            <i className="bi bi-basket"></i> Purchase & Supplier
          </div>
        </li>

        <li>
          <div onClick={() => toggleMenu("settings")} className="link arrow">
            <i className="bi bi-gear-wide-connected"></i> Profile & Settings
          </div>
          {openMenu === "settings" && (
            <ul className="submenu">
              <li>
                <Link href="#">Pharmacist Profile </Link>
              </li>
              <li>
                <Link href="#">Reset Password</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}

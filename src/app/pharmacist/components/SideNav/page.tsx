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
        <li className={`${openMenu === "Retail-Counter" ? "active" : ""}`}>
          <Link href="/pharmacist/retail-counter" className="link">
            <i className="bi bi-receipt-cutoff"></i> Retail Counter
          </Link>
        </li>
        <li>
          <Link href="/patient-prescriptions" className="link">
            <i className="bi bi-file-medical"></i> Patient Prescriptions
          </Link>
        </li>
        <li>
          <Link href="/pharmacist/orders" className="link">
            <i className="bi bi-cart-plus-fill"></i> Order
          </Link>
        </li>
        <li>
          <Link href="/pharmacist/purchase-invoice" className="link">
            <i className="bi bi-receipt-cutoff"></i> Purchase Invoice
          </Link>
        </li>
        <li>
          <Link href="#" className="link">
            <i className="bi bi-box"></i> Stock
          </Link>
        </li>
        <li>
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
        </li>
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
        <li className={`${openMenu === "Purchase-Supplier" ? "active" : ""}`}>
          <div onClick={() => toggleMenu("Purchase-Supplier")} className="link">
            <i className="bi bi-basket"></i> Supplier
          </div>
        </li>

        <li>
          <div onClick={() => toggleMenu("settings")} className="link arrow">
            <i className="bi bi-gear-wide-connected"></i> Profile & Settings
          </div>
          {openMenu === "settings" && (
            <ul className="submenu">
              <li>
                <Link href="/pharmacist/view-profile">Profile </Link>
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

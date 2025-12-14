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
      <ul className="side_menu-list">
        <li>
          <Link href="/admin-dashboard" className="link">
            <i className="bi bi-speedometer2"></i> Dashboard
          </Link>
        </li>
        <li>
          <Link href="/orders" className="link">
            <i className="bi bi-bag-check"></i> Order
          </Link>
        </li>
        <li>
          <Link href="#" className="link">
            <i className="bi bi-box-seam"></i> Stock
          </Link>
        </li>
        <li>
          <Link href="/medicine" className="link">
            <i className="bi bi-box-seam"></i> Product Master
          </Link>
        </li>
        <li>
          <Link href="/pharmacy" className="link">
            <i className="bi bi-shop-window"></i> Pharmacy
          </Link>
        </li>

        <li>
          <Link href="/pharmacist" className="link">
            <i className="bi bi-person-workspace"></i> Pharmacist
          </Link>
        </li>

        <li>
          <Link href="/buyer" className="link">
            <i className="bi bi-person"></i> Buyer
          </Link>
        </li>
        <li>
          <Link href="purchase-invoice" className="link">
            <i className="bi bi-receipt-cutoff"></i> Purchase Invoice
          </Link>
        </li>
        {/* <li>
          <div onClick={() => toggleMenu("product")} className="link arrow">
            <i className="bi bi-box-seam"></i> Product Master
          </div>
          {openMenu === "product" && (
            <ul className="submenu myList">
              <li>
                <Link href="/medicine">
                  <i className="bi bi-capsule"></i> Medicine Details
                </Link>
              </li>
              <li>
                <Link href="/other-product">
                  <i className="bi bi-box-seam"></i> Other Product Details
                </Link>
              </li>
            </ul>
          )}
        </li> */}

        <li>
          <Link href="/supplier" className="link">
            <i className="bi bi-truck"></i> Supplier
          </Link>
        </li>

        <li>
          <div onClick={() => toggleMenu("admins")} className="link arrow">
            <i className="bi bi-person-gear"></i> Admin Master
          </div>
          {openMenu === "admins" && (
            <ul className="submenu myList">
              <li>
                <Link href="/category">
                  <i className="bi bi-collection me-2"></i> Category
                </Link>
              </li>
              <li>
                <Link href="/sub-category">
                  <i className="bi bi-collection-fill me-2"></i> Sub Category
                </Link>
              </li>
              <li>
                <Link href="/unit">
                  <i className="bi bi-rulers me-2"></i>Unit
                </Link>
              </li>
              <li>
                <Link href="/generic">
                  <i className="bi bi-capsule me-2"></i>Generic
                </Link>
              </li>
              <li>
                <Link href="/manufacturer">
                  <i className="bi bi-building me-2"></i>Manufacturer
                </Link>
              </li>
              <li>
                <Link href="/variant">
                  <i className="bi bi-diagram-3 me-2"></i>Variant
                </Link>
              </li>
              <li>
                <Link href="/dose-form">
                  <i className="bi bi-droplet-half me-2"></i> Dose Form
                </Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <Link href="/clinic" className="link">
            <i className="bi bi-hospital"></i> Hospital & Clinic
          </Link>
        </li>
        {/* <li>
          <Link href="/doctors" className="link">
            <i className="bi bi-person-badge"></i> Doctors
          </Link>
        </li> */}
        {/* <li>
          <Link href="/advertisement" className="link">
            <i className="bi bi-badge-ad-fill"></i> Advertisement
          </Link>
        </li> */}
        <li>
          <Link href="/admin/contact-us" className="link">
            <i className="bi bi-person-lines-fill me-2"></i> Contact Us
          </Link>
        </li>
        <li>
          <div onClick={() => toggleMenu("settings")} className="link arrow">
            <i className="bi bi-gear-wide-connected"></i> Settings
          </div>
          {openMenu === "settings" && (
            <ul className="submenu">
              <li>
                <Link href="#">Reset Password</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
      <style jsx>{`
        .myList {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .myList li::before {
          content: none !important;
        }
      `}</style>
    </div>
  );
}

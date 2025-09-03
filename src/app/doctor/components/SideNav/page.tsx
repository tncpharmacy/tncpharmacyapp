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
        <li className={`${openMenu === "order" ? "active" : ""}`}>
          <div onClick={() => toggleMenu("order")} className="link">
            <Link href="/doctor/patient/patientList" className="link">
              <i className="bi bi-person"></i> Patient
            </Link>
          </div>
        </li>
        <li>
          <div
            onClick={() => toggleMenu("Appointments-Scheduling")}
            className="link arrow"
          >
            <i className="bi bi-capsule-pill"></i> Appointments & Scheduling
          </div>
          {openMenu === "Appointments-Scheduling" && (
            <ul className="submenu">
              <li>
                <Link href="#">Book Appointment </Link>
              </li>
              <li>
                <Link href="#">View Today’s Appointments</Link>
              </li>
              <li>
                <Link href="#">Reschedule / Cancel Appointment</Link>
              </li>
              <li>
                <Link href="#">Appointment Calendar View</Link>
              </li>
              <li>
                <Link href="#">Upcoming Appointments Reminder</Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <div
            onClick={() => toggleMenu("Medical-Records")}
            className="link arrow"
          >
            <i className="bi bi-gear-wide-connected"></i> Medical Records
          </div>
          {openMenu === "Medical-Records" && (
            <ul className="submenu">
              <li>
                <Link href="#">Add Patient Visit Details </Link>
              </li>
              <li>
                <Link href="#">Upload Reports / Scans</Link>
              </li>
              <li>
                <Link href="#">Prescription History</Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <div
            onClick={() => toggleMenu("Prescription-Management")}
            className="link arrow"
          >
            <i className="bi bi-gear-wide-connected"></i> Prescription
            Management
          </div>
          {openMenu === "Prescription-Management" && (
            <ul className="submenu">
              <li>
                <Link href="#">Add Prescription</Link>
              </li>
              <li>
                <Link href="#">Add Medicines</Link>
              </li>
              <li>
                <Link href="#">Generate PDF Prescription</Link>
              </li>
              <li>
                <Link href="#">Share via Email/WhatsApp</Link>
              </li>
            </ul>
          )}
        </li>
        <li>
          <div
            onClick={() => toggleMenu("Billing-Invoices")}
            className="link arrow"
          >
            <i className="bi bi-gear-wide-connected"></i> Billing & Invoices{" "}
          </div>
          {openMenu === "Billing-Invoices" && (
            <ul className="submenu">
              <li>
                <Link href="#">Generate Bill for Patient</Link>
              </li>
              <li>
                <Link href="#"> Add Services & Charges</Link>
              </li>
              <li>
                <Link href="#"> Payment Status Tracking</Link>
              </li>
              <li>
                <Link href="#">Invoice Download / Print</Link>
              </li>
            </ul>
          )}
        </li>

        <li>
          <div onClick={() => toggleMenu("settings")} className="link arrow">
            <i className="bi bi-gear-wide-connected"></i> Profile & Settings
          </div>
          {openMenu === "settings" && (
            <ul className="submenu">
              <li>
                <Link href="/profile">Doctor Profile</Link>
              </li>
              <li>
                <Link href="#">Reset Password</Link>
              </li>
              <li>
                <Link href="#">Set Availability / Time Slots</Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
}

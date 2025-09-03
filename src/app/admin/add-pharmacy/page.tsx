"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../css/admin-style.css";
import SideNav from "../components/SideNav/page";
import Header from "../components/Header/page";
import { useRouter } from "next/navigation";

type Student = {
  id: number;
  studentId: string;
  studentName: string;
  gender: string;
  dob: string;
  mobile: string;
  email: string;
  bloodGroup: string;
  className: string;
  courseName: string;
  status: number;
};

export default function AddPharmacy() {
  const router = useRouter();

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-shop-window"></i> Add New Pharmacy
              <button
                onClick={() => router.back()}
                className="btn-style2 float-end pe-4 ps-4"
              >
                ← Back
              </button>
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Pharmacy Name</span>
                      <input type="text" className="txt1" id="" placeholder="Enter pharmacy name" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">License No.</span>
                      <input type="text" className="txt1" id="" placeholder="Enter licence number" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Valid Upto</span>
                      <input type="text" className="txt1" id="" placeholder="Enter License Expiry Date" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">GST No.</span>
                      <input type="text" className="txt1" id="" placeholder="Enter licence number" />
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Contact Name</span>
                      <input type="text" className="txt1" id="" placeholder="Enter contact name" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Mobile</span>
                      <input type="text" className="txt1" id="" placeholder="Enter Mobile number" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Email</span>
                      <input type="text" className="txt1" id="" placeholder="Enter Email" />
                    </div>
                  </div>
                 
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">ZIP Code</span>
                      <input type="text" className="txt1" id="" placeholder="Enter ZIP Code" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">District</span>
                      <input type="text" className="txt1" id="" placeholder="Enter District" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">State</span>
                      <input type="text" className="txt1" id="" placeholder="Enter State" />
                    </div>
                  </div>
                
                  <div className="col-md-8">
                    <div className="txt_col">
                      <span className="lbl1">Address </span>
                      <input type="text" className="txt1" id="" placeholder="Enter Address" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <button className="btn-style2">Submit</button>
                  </div>
                </div>


              </div>

            </div>
          </div>

        </div>
      </div>

    </>
  );
}

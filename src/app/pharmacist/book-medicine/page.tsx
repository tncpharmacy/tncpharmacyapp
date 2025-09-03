"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../css/pharmacy-style.css";
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

export default function BookMedicine() {
  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-shop-window"></i> Add New Pharmacy
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Pharmacy Name</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter pharmacy name"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Licence No.</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter licence number"
                      />
                    </div>
                  </div>
                  <div className="clearfix"></div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Address</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter Address"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Contact No</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter contact number"
                      />
                    </div>
                  </div>
                  <div className="clearfix"></div>
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

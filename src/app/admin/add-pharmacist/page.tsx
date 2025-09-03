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

export default function AddPharmacist() {


  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-shop-window"></i> Add New Pharmacist (Counter Staff)
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="clearfix"></div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Pharmacist Name</span>
                      <input type="text" className="txt1" id="" placeholder="Enter Name" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Gender</span>
                      <select className="txt1">
                        <option>-Select-</option>
                        <option>Male</option>
                        <option>Female</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Date of Birth</span>
                      <input type="text" className="txt1" id="" placeholder="Enter Date of Birth" />
                    </div>
                  </div>
                  <div className="clearfix"></div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Mobile</span>
                      <input type="text" className="txt1" id="" placeholder="Enter Mobile" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Email Id</span>
                      <input type="text" className="txt1" id="" placeholder="Enter Email Id" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Aadhaar No</span>
                      <input type="text" className="txt1" id="" placeholder="Enter Aadhaar No" />
                    </div>
                  </div>    
                  <div className="clearfix"></div>              
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Pharmacist License No.</span>
                      <input type="text" className="txt1" id="" placeholder="Enter License No" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">License Expiry Date</span>
                      <input type="text" className="txt1" id="" placeholder="Enter License Expiry Date" />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Pharmacy Name</span>
                      <select className="txt1">
                        <option>-Select-</option>
                        <option>Ganga Medical</option>
                        <option>Dev Medical</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Upload Document</span>
                      <input type="file" name="" id="" className="txt1" />
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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal, NavLink } from "react-bootstrap";
import "../../css/admin-style.css";
import SideNav from "../../components/SideNav/page";
import Header from "../../components/Header/page";
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

export default function AddSupplier() {
  const router = useRouter();
  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="row">
              <div className="col-sm-6 ">
                <div className="pageTitle">
                  <i className="bi bi-shop-window"></i> Add New Supplier
                </div>
              </div>
              <div className="col-sm-6 d-flex justify-content-end">
                <NavLink className="btn btn-primary">
                  <Button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => router.push(`/suppliers`)}
                  >
                    Back
                  </Button>
                </NavLink>
              </div>
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Pharmacy Name</span>
                      <select className="txt1">
                        <option>--Select--</option>
                        <option>Bharat Medical</option>
                        <option>Shiva Medical</option>
                        <option>S.S. Medical</option>
                        <option>Raj Medical</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Supplier Name</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter supplier name"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">License No.</span>
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
                      <span className="lbl1">GST No.</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter gst no."
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Contact Person</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter contact name"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Mobile</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter mobile number"
                      />
                    </div>
                  </div>
                  <div className="clearfix"></div>
                  {/* <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">ZIP Code</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter ZIP Code"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">District</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter District"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">State</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter State"
                      />
                    </div>
                  </div> */}
                  <div className="clearfix"></div>

                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Email</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter email"
                      />
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="txt_col">
                      <span className="lbl1">Address </span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter address"
                      />
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

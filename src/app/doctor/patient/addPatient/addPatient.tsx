"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../../css/style.css";
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

export default function AddPatient() {
  return (
    <>
      <div className="body_wrap">
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-person-add"></i> Add Doctor
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Doctor Name</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter Doctor name"
                      />
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
                      <span className="lbl1">Speciality</span>
                      <select className="txt1">
                        <option>-Select-</option>
                        <option>Cardiology</option>
                        <option>General Surgery</option>
                        <option>Neurology</option>
                        <option>Urology</option>
                      </select>
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

                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Clinic Id.</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter Clinic Id"
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
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Email Id.</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter email address"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Select Photo</span>
                      <input
                        type="file"
                        className="txt1"
                        id=""
                        placeholder="Enter email address"
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

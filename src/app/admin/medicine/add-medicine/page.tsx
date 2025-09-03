"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../../css/admin-style.css";
import SideNav from "../../components/SideNav/page";
import Header from "../../components/Header/page";
import { useRouter } from "next/navigation";
import ProfileImageUpload from "@/app/components/profile-image/ProfileImageUpload";

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

export default function AddDoctor() {
  const router = useRouter();
  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-person-add"></i> Add Medicine
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
                      <span className="lbl1">Medicine/Brand Name</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter medicine name"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Generic Name</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter generic name"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Description</span>
                      <textarea
                        className="txt1"
                        id=""
                        placeholder="Enter description here "
                      />
                    </div>
                  </div>
                  <div className="clearfix"></div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Prescription Required</span>
                      <select className="txt1">
                        <option>--Select--</option>
                        <option>Yes</option>
                        <option>No</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Category</span>
                      <select className="txt1">
                        <option>--Select--</option>
                        <option>Antibiotic</option>
                        <option>Painkiller</option>
                        <option>Analgesic</option>
                        <option>Antacid</option>
                        <option>Antiseptic</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Marketed By (Company Name)</span>
                      <select className="txt1">
                        <option>--Select--</option>
                        <option>Cipla Ltd.</option>
                        <option>Sun Pharmaceutical Ind.</option>
                        <option>Dr. Reddy’s Laboratories</option>
                        <option>Himalaya Drug Company</option>\
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Unit (Dosage Form )</span>
                      <select className="txt1">
                        <option>--Select--</option>
                        <option>Syrup</option>
                        <option>Injection</option>
                        <option>Tablet</option>
                        <option>Capsule</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Strength</span>
                      <select className="txt1">
                        <option>--Select--</option>
                        <option>250 mg</option>
                        <option>500 mg</option>
                        <option>5 ml</option>
                        <option>10 ml</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Modified Delivery Form</span>
                      <select className="txt1">
                        <option>--Select--</option>
                        <option>Extended Release (ER)</option>
                        <option>Enteric Coated</option>
                        <option>Mouth Disolving</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="txt_col">
                      <span className="lbl1">Upload multiple image list</span>
                      <input
                        type="file"
                        className="txt1"
                        id=""
                        placeholder="Enter medicine name"
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

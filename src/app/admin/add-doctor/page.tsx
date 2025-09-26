"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../css/admin-style.css";
import SideNav from "../components/SideNav/page";
import Header from "../components/Header/page";
import { useRouter } from "next/navigation";
import ProfileImageUpload from "@/app/components/profile-image/ProfileImageUpload";
import Input from "@/app/components/Input/Input";

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
              <i className="bi bi-person-add"></i> Add Doctor
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
                  <Input
                    label="Doctor Name"
                    name="doctorName"
                    // value={doctorName}
                    placeholder="Enter Doctor name"
                    //onChange={(e) => setDoctorName(e.target.value)}
                    required
                    // error={error}
                  />
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
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter Date of Birth"
                      />
                    </div>
                  </div>
                  <div className="clearfix"></div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Qualification</span>
                      <select className="txt1">
                        <option>--Select--</option>
                        <option>
                          MBBS – Bachelor of Medicine, Bachelor of Surgery
                        </option>
                        <option>BDS – Bachelor of Dental Surgery</option>
                        <option>
                          BAMS – Bachelor of Ayurvedic Medicine and Surgery
                        </option>
                        <option>
                          BHMS – Bachelor of Homeopathic Medicine and Surgery
                        </option>
                        <option>
                          BUMS – Bachelor of Unani Medicine and Surgery
                        </option>
                        <option>
                          BNYS – Bachelor of Naturopathy and Yogic Sciences
                        </option>
                        <option>
                          BSMS – Bachelor of Siddha Medicine and Surgery
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Speciality</span>
                      <select className="txt1">
                        <option>--Select--</option>
                        <option>Cardiology</option>
                        <option>General Surgery</option>
                        <option>Neurology</option>
                        <option>Urology</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Experiance (Year)</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter Year of Experiance"
                      />
                    </div>
                  </div>
                  <div className="clearfix"></div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Registration (Licence) No.</span>
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
                      <span className="lbl1">Registration Council</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter Registration Council"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Registration Year</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter Registration Year"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Valid Upto</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter Registration Expiry Date"
                      />
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="txt_col">
                      <span className="lbl1">Document Upload</span>
                      <input
                        type="file"
                        className="txt1"
                        id=""
                        placeholder="Enter Registration Expiry Date"
                      />
                    </div>
                  </div>
                  <div className="clearfix"></div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Mobile No</span>
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
                      <span className="lbl1">Whatsapp No</span>
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
                  <div className="clearfix"></div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Consultation Fee</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter consultation fee"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">Video Consultation Fee</span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter consultation fee"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="txt_col">
                      <span className="lbl1">
                        Audio (Mobile) Consultation Fee
                      </span>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="Enter consultation fee"
                      />
                    </div>
                  </div>
                  <div className="clearfix"></div>
                  <div className="col-md-4 d-flex justify-content-center">
                    <div className="txt_col border p-4">
                      <ProfileImageUpload />
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="txt_col">
                      <span className="lbl1">Professional Summary</span>
                      <textarea
                        className="txt1 h-50"
                        id=""
                        rows={6}
                        placeholder="Enter professional summary"
                      ></textarea>
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

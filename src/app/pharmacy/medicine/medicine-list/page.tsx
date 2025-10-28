"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../../css/style.css";
import SideNav from "../../components/SideNav/page";
import Header from "../../components/Header/page";
import { useRouter } from "next/navigation";

export default function MedicineList() {
  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-person-add"></i> Medicine List
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-5">
                    <div className="txt_col">
                      <span className="lbl1">Search</span>
                      <input
                        type="text"
                        className="txt1 rounded"
                        id=""
                        placeholder="Enter medicine"
                      />
                    </div>
                  </div>
                  <div className="col-md-7 text-end">
                    <div className="txt_col">
                      <Link href={"/add-medicine"} className="btn-style2 me-2">
                        <i className="bi bi-plus"></i> Add Medicine
                      </Link>
                      <button className="btn-style1">
                        <i className="bi bi-download"></i> Export Statement
                      </button>
                    </div>
                  </div>
                </div>

                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        <th>Id</th>
                        <th>Medicine Name</th>
                        <th>Generic Name</th>
                        <th>Description</th>
                        <th>Prescription Required</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Manufacturer</th>
                        <th>Variant</th>
                        <th>Unit</th>
                        <th>Strength</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>TNC321321</td>
                        <td>Augmentin 625</td>
                        <td>Amoxicillin+Clav</td>
                        <td>Broad spectrum antibiotic</td>
                        <td>Yes</td>
                        <td>Antibiotic</td>
                        <td>Mankind</td>
                        <td>Cipla Ltd.</td>
                        <td>Tablet</td>
                        <td>Tablet</td>
                        <td>250mg</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td style={{ width: "100px" }}>
                          <button className="btn btn-light btn-sm me-2">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-light btn-sm">
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>TNC321321</td>
                        <td>Dolo-650</td>
                        <td>Paracetamol</td>
                        <td>Pain reliever & fever reducer</td>
                        <td>No</td>
                        <td>Antibiotic</td>
                        <td>Mankind</td>
                        <td>Cipla Ltd.</td>
                        <td>Tablet</td>
                        <td>Tablet</td>
                        <td>650mg</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <button className="btn btn-light btn-sm me-2">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-light btn-sm">
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>TNC321321</td>
                        <td>Dolo-650</td>
                        <td>Paracetamol</td>
                        <td>Pain reliever & fever reducer</td>
                        <td>No</td>
                        <td>Antibiotic</td>
                        <td>Mankind</td>
                        <td>Cipla Ltd.</td>
                        <td>Tablet</td>
                        <td>Tablet</td>
                        <td>650mg</td>
                        <td>
                          <span className="status status-deactive"></span>
                        </td>
                        <td>
                          <button className="btn btn-light btn-sm me-2">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-light btn-sm">
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>TNC321321</td>
                        <td>Azithral 500</td>
                        <td>Azithromycin</td>
                        <td>Antibiotic for bacterial inf.</td>
                        <td>No</td>
                        <td>Antibiotic</td>
                        <td>Mankind</td>
                        <td>Cipla Ltd.</td>
                        <td>Tablet</td>
                        <td>Tablet</td>
                        <td>500mg</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <button className="btn btn-light btn-sm me-2">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-light btn-sm">
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>TNC321321</td>
                        <td>Azithral 500</td>
                        <td>Azithromycin</td>
                        <td>Antibiotic for bacterial inf.</td>
                        <td>No</td>
                        <td>Antibiotic</td>
                        <td>Mankind</td>
                        <td>Cipla Ltd.</td>
                        <td>Tablet</td>
                        <td>Tablet</td>
                        <td>500mg</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <button className="btn btn-light btn-sm me-2">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-light btn-sm">
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>TNC321321</td>
                        <td>Crocin Syrup</td>
                        <td>Paracetamol</td>
                        <td>Fever reducer for children</td>
                        <td>No</td>
                        <td>Antibiotic</td>
                        <td>Mankind</td>
                        <td>Cipla Ltd.</td>
                        <td>Syrup</td>
                        <td>Syrup</td>
                        <td>200mg</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <button className="btn btn-light btn-sm me-2">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-light btn-sm">
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>TNC321321</td>
                        <td>Crocin Syrup</td>
                        <td>Paracetamol</td>
                        <td>Fever reducer for children</td>
                        <td>No</td>
                        <td>Antibiotic</td>
                        <td>Mankind</td>
                        <td>Cipla Ltd.</td>
                        <td>Syrup</td>
                        <td>Syrup</td>
                        <td>200mg</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <button className="btn btn-light btn-sm me-2">
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-light btn-sm">
                            <i className="bi bi-trash3-fill"></i>
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

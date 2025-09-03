"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../../css/admin-style.css";
import SideNav from "../../components/SideNav/page";
import Header from "../../components/Header/page";
import { useRouter } from "next/navigation";

export default function MedicineUnit() {
  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            {/* <div className="pageTitle">
              <i className="bi bi-person-add"></i> Medicine Category List
            </div> */}

            <div className="main_content">
              <div className="row">
                {/* Left Side - Table */}
                <div className="col-sm-8 shadow-sm">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    {/* Left side - Title */}
                    <h5 className="mb-0">
                      <i className="bi bi-card-list"></i> Unit List
                    </h5>

                    {/* Right side - Search */}
                    <div className="d-flex">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search unit name"
                        style={{ width: "550px" }}
                      />
                    </div>
                  </div>

                  <div className="scroll_table mt-4">
                    <table className="table cust_table1">
                      <thead>
                        <tr>
                          <th>Id</th>
                          <th>Unit Name</th>
                          <th>Description</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>1</td>
                          <td>Tablet</td>
                          <td>Solid dosage form</td>
                          <td>
                            <span className="status status-active"></span>
                          </td>
                          {/* <td>
                            <button className="btn btn-light btn-sm me-2">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-light btn-sm">
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          </td> */}
                        </tr>
                        <tr>
                          <td>2</td>
                          <td>Capsule</td>
                          <td>Gelatin-coated dosage form</td>
                          <td>
                            <span className="status status-active"></span>
                          </td>
                          {/* <td>
                            <button className="btn btn-light btn-sm me-2">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-light btn-sm">
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          </td> */}
                        </tr>
                        <tr>
                          <td>3</td>
                          <td>Syrup</td>
                          <td>Liquid dosage form</td>
                          <td>
                            <span className="status status-active"></span>
                          </td>
                          {/* <td>
                            <button className="btn btn-light btn-sm me-2">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-light btn-sm">
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          </td> */}
                        </tr>
                        <tr>
                          <td>4</td>
                          <td>Injection</td>
                          <td>Liquid for direct injection</td>
                          <td>
                            <span className="status status-active"></span>
                          </td>
                          {/* <td>
                            <button className="btn btn-light btn-sm me-2">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-light btn-sm">
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          </td> */}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Side - Form */}
                <div className="col-sm-4">
                  <div className="card p-3 shadow-sm">
                    <h5>Add Unit</h5>
                    <hr className="w-100" />
                    <div className="row">
                      <div className="col-md-12">
                        <div className="txt_col">
                          <span className="lbl1">Unit Name</span>
                          <input
                            type="text"
                            className="txt1"
                            id=""
                            placeholder="Enter unit name"
                          />
                        </div>
                        <div className="col-md-12">
                          <div className="txt_col">
                            <span className="lbl1">Description</span>
                            <textarea
                              className="txt1 h-50"
                              id=""
                              placeholder="Enter description here"
                            ></textarea>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button className="btn btn-primary">Submit</button>
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

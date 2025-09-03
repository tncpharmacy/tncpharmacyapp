"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../css/admin-style.css";
import SideNav from "../components/SideNav/page";
import Header from "../components/Header/page";
import { useRouter } from "next/navigation";


export default function Pharmacist() {


  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-shop-window"></i> Pharmacist List
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-5">
                    <div className="txt_col">
                      <span className="lbl1">Search</span>
                      <input type="text" className="txt1 rounded" id="" placeholder="Enter pharmacist name" />
                    </div>
                  </div>
                  <div className="col-md-7 text-end">
                    <div className="txt_col">
                      <Link href={"/add-pharmacist"} className="btn-style2 me-2"><i className="bi bi-plus"></i> Add Pharmacist</Link>
                      <button className="btn-style1"><i className="bi bi-download"></i> Export Statement</button>
                    </div>
                  </div>
                </div>

                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        <th>Pharmacist Id</th>
                        <th>Pharmacist Name</th>
                        <th>Gender</th>
                        <th>Pharmacy Name</th>
                        <th>Contact No</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>TNC321321</td>
                        <td>Mohan Kumar</td>
                         <td>Male</td>
                        <td>TNC Pharmacy</td>
                        <td>9717XXXXXX</td>
                        <td><span className="status status-active"></span></td>
                        <td>
                          <button className="btn btn-light btn-sm me-2"><i className="bi bi-pencil"></i></button>
                          <button className="btn btn-light btn-sm"><i className="bi bi-trash3-fill"></i></button>
                        </td>
                      </tr>
                      <tr>
                        <td>TNC321321</td>
                        <td>Mohan Kumar</td>
                        <td>Male</td>
                        <td>TNC Pharmacy</td>
                        <td>9717XXXXXX</td>
                        <td><span className="status status-active"></span></td>
                        <td>
                          <button className="btn btn-light btn-sm me-2"><i className="bi bi-pencil"></i></button>
                          <button className="btn btn-light btn-sm"><i className="bi bi-trash3-fill"></i></button>
                        </td>
                      </tr>
                      <tr>
                        <td>TNC321321</td>
                        <td>Mohan Kumar</td>
                        <td>Male</td>
                        <td>TNC Pharmacy</td>
                        <td>9717XXXXXX</td>
                        <td><span className="status status-deactive"></span></td>
                        <td>
                          <button className="btn btn-light btn-sm me-2"><i className="bi bi-pencil"></i></button>
                          <button className="btn btn-light btn-sm"><i className="bi bi-trash3-fill"></i></button>
                        </td>
                      </tr>
                      <tr>
                        <td>TNC321321</td>
                        <td>Mohan Kumar</td>
                        <td>Male</td>
                        <td>TNC Pharmacy</td>
                        <td>9717XXXXXX</td>
                        <td><span className="status status-active"></span></td>
                        <td>
                          <button className="btn btn-light btn-sm me-2"><i className="bi bi-pencil"></i></button>
                          <button className="btn btn-light btn-sm"><i className="bi bi-trash3-fill"></i></button>
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

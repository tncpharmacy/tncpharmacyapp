"use client";

import "../css/admin-style.css";
import Header from "../components/Header/page";
import SideNav from "../components/SideNav/page";

export default function Buyer() {

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-person-add"></i> Buyer List
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-7">
                    <div className="txt_col">
                      <span className="lbl1">Search</span>
                      <input
                        type="text"
                        className="txt1 rounded"
                        id=""
                        placeholder="Enter buyer name or mobile number.."
                      />
                    </div>
                  </div>
                  <div className="col-md-5 text-end">
                    <div className="txt_col">
                      {/* <button
                        className="btn-style2 me-2"
                        onClick={() => setShowPrint(true)}
                      >
                        <i className="bi bi-plus"></i> New Order
                      </button> */}
                      {/* <button className="btn-style1">
                        <i className="bi bi-download"></i> Export Statement
                      </button> */}
                    </div>
                  </div>
                </div>

                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        <th>Buyer Id</th>
                        <th>Name</th>
                        <th>Contact No.</th>
                        <th>Reference Doctor</th>
                        <th>Last Purchase Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>ORD001</td>
                        <td>Mohan Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>500</td>
                        <td>10-08-2025</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                       
                      </tr>
                      <tr>
                        <td>ORD002</td>
                        <td>Sohan Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>600</td>
                        <td>07-08-2025</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                       
                      </tr>
                      <tr>
                        <td>ORD003</td>
                        <td>Ramesh Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>700</td>
                        <td>28-02-2025</td>
                        <td>
                          <span className="status status-deactive"></span>
                        </td>
                      </tr>
                      <tr>
                        <td>ORD004</td>
                        <td>Suresh Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>300</td>
                        <td>27-07-2025</td>
                        <td>
                          <span className="status status-active"></span>
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

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import "../../css/admin-style.css";
import SideNav from "../../components/SideNav/page";
import Header from "../../components/Header/page";
import { useRouter } from "next/navigation";

export default function OrderList() {
  const router = useRouter();
  const [showPrint, setShowPrint] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleBook = () => {
    router.push(`/doctor/appointment/bookAppointment`);
  };
  const handleHistory = () => {
    setShowHistory(true);
  };
  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-person-add"></i> Order List
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
                        placeholder="Enter order number.."
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
                        <th>Order Id</th>
                        <th>Name</th>
                        <th>Contact No.</th>
                        <th>Amount</th>
                        <th>Order Date</th>
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
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View Oreder</Tooltip>}
                          >
                            <Button className="btn btn-light btn-sm me-2" variant="primary" onClick={handleHistory}><i className="bi bi-eye-fill"></i></Button>
                          </OverlayTrigger>
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
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View Oreder</Tooltip>}
                          >
                            <Button className="btn btn-light btn-sm me-2" variant="primary" onClick={handleHistory}><i className="bi bi-eye-fill"></i></Button>
                          </OverlayTrigger>
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
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View Oreder</Tooltip>}
                          >
                            <Button className="btn btn-light btn-sm me-2" variant="primary" onClick={handleHistory}><i className="bi bi-eye-fill"></i></Button>
                          </OverlayTrigger>
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
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View Oreder</Tooltip>}
                          >
                            <Button className="btn btn-light btn-sm me-2" variant="primary" onClick={handleHistory}><i className="bi bi-eye-fill"></i></Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>ORD005</td>
                        <td>Sonu Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>500</td>
                        <td>29-07-2025</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View Oreder</Tooltip>}
                          >
                            <Button className="btn btn-light btn-sm me-2" variant="primary" onClick={handleHistory}><i className="bi bi-eye-fill"></i></Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>ORD006</td>
                        <td>Mohan Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>500</td>
                        <td>07-08-2025</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View Oreder</Tooltip>}
                          >
                            <Button className="btn btn-light btn-sm me-2" variant="primary" onClick={handleHistory}><i className="bi bi-eye-fill"></i></Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>ORD007</td>
                        <td>Mohan Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>500</td>
                        <td>01-08-2025</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View Oreder</Tooltip>}
                          >
                            <Button className="btn btn-light btn-sm me-2" variant="primary" onClick={handleHistory}><i className="bi bi-eye-fill"></i></Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>ORD008</td>
                        <td>Monu Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>400</td>
                        <td>30-06-2025</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View Oreder</Tooltip>}
                          >
                            <Button className="btn btn-light btn-sm me-2" variant="primary" onClick={handleHistory}><i className="bi bi-eye-fill"></i></Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>ORD009</td>
                        <td>Sagar Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>600</td>
                        <td>02-08-2025</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View Oreder</Tooltip>}
                          >
                            <Button className="btn btn-light btn-sm me-2" variant="primary" onClick={handleHistory}><i className="bi bi-eye-fill"></i></Button>
                          </OverlayTrigger>
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

      <Modal
        show={showHistory}
        onHide={() => setShowHistory(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Order Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="container-fluid">
            {/* Patient Info */}
            <div className="row">
              <div className="col-md-4">
                <p>
                  <strong>Name:</strong> Mohan Kumar
                </p>

                <p>
                  <strong>Address:</strong> New Delhi, India
                </p>
              </div>
              <div className="col-md-4">
                <p>
                  <strong>Contact No:</strong> 9717543210
                </p>

                <p>
                  <strong>Age:</strong> 32
                </p>
              </div>

              <div className="col-md-4">
                <p>
                  <strong>Gender:</strong> Male
                </p>
              </div>
            </div>
            <br />
            <Modal.Title>
              <i className="bi bi-clock-history"></i> Order Details
            </Modal.Title>
            <hr />

            {/* Medical Details */}
            <div className="row">
              <div className="col-md-4">
                <p style={{ whiteSpace: "pre-wrap" }}>
                  <strong>Order ID:</strong> ORD001{"\n"}
                  <strong>Order Date:</strong> 10-08-2025
                </p>
              </div>
              <div className="col-md-3">
                <p style={{ whiteSpace: "pre-wrap" }}>
                  <strong>Delivery Type:</strong> {"\n"}Home Delivery
                </p>
              </div>
              <div className="col-md-5">
                <p style={{ whiteSpace: "pre-wrap" }}>
                  <strong>Billing Address:</strong>
                  {"\n"}D-30, Block-E,
                  {"\n"}Ganesh Nagar, Akshardham,
                  {"\n"}Delhi-110092
                </p>
              </div>
            </div>

            <hr />
            {/* Prescription Table */}
            <h6>Prescription</h6>
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Quantity</th>
                  <th>Duration</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Paracetamol</td>
                  <td>500mg once a day</td>
                  <td>5</td>
                  <td>5 days</td>
                  <td>150</td>
                </tr>
                <tr>
                  <td>Azithromycin</td>
                  <td>250mg twice a day</td>
                  <td>10</td>
                  <td>5 days</td>
                  <td>200</td>
                </tr>
                <tr>
                  <td>Nimesulide</td>
                  <td>100mg twice a day</td>
                  <td>10</td>
                  <td>5 days</td>
                  <td>150</td>
                </tr>
              </tbody>
            </table>

            {/* Billing Summary Below Table */}
            <div
              style={{
                marginTop: "20px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                padding: "15px 20px",
                background: "#f8f9fa",
                maxWidth: "300px",
                marginLeft: "auto", // Yeh line keep karegi isse right align
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              }}
            >
              <h5 style={{ textAlign: "center", marginBottom: "15px" }}>
                Billing Summary
              </h5>
              <div className="d-flex justify-content-between mb-2">
                <span>Total Amount:</span>
                <strong>₹500</strong>
              </div>
              <div className="d-flex justify-content-between mb-2 text-success">
                <span>Discount:</span>
                <strong>- ₹40</strong>
              </div>
              <hr />
              <div
                className="d-flex justify-content-between"
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "bold",
                  color: "#007bff",
                }}
              >
                <span>Net Amount:</span>
                <span>₹460</span>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowHistory(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

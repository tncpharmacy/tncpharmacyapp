"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import "../../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useRouter } from "next/navigation";
import Input from "@/app/components/Input/Input";

export default function OrderList() {
  const router = useRouter();
  const [showPrint, setShowPrint] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [showReport, setShowReport] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [orderType, setOrderType] = useState("");

  // 🗓️ Aaj ki date (YYYY-MM-DD)
  const today = new Date().toISOString().split("T")[0];
  const handleExport = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert("Start Date cannot be after End Date!");
      return;
    }
    console.log("Generating report from", startDate, "to", endDate);
    // 🔽 yahan export / API call logic likho
    setShowReport(false);
  };

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
              <i className="bi bi-receipt"></i> Order Summary
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="row">
                  <div className="col-md-6">
                    <div className="search_query">
                      <a className="query_search_btn" href="javascript:void(0)">
                        <i className="bi bi-search"></i>
                      </a>
                      <input
                        type="text"
                        className="txt1"
                        id=""
                        placeholder="search by order id, name, mobile"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Order Type</span>
                      <select
                        className="txt1"
                        name="orderType"
                        value={orderType}
                        onChange={(e) => setOrderType(e.target.value)}
                        required
                      >
                        <option>-Select-</option>
                        <option>Online</option>
                        <option>Offline</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3 text-end">
                    <div className="txt_col">
                      <Button
                        variant="outline-primary"
                        onClick={() => setShowReport(true)}
                        className="btn-style1"
                      >
                        <i className="bi bi-file-earmark-text"></i> Generate
                        Report
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        <th style={{ width: "0px" }}></th>
                        <th className="fw-bold text-start">Order Id</th>
                        <th className="fw-bold text-start">Name</th>
                        <th className="fw-bold text-start">Contact No.</th>
                        <th className="fw-bold text-start">Amount</th>
                        <th className="fw-bold text-start">Order Date</th>
                        <th className="fw-bold text-start">Order Type</th>
                        <th className="fw-bold text-start">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td></td>
                        <td className="text-start">ORD001</td>
                        <td className="text-start">Mohan Kumar</td>
                        <td className="text-start">9717XXXXXX</td>
                        <td className="text-start">500</td>
                        <td className="text-start">10-08-2025</td>
                        <td className="text-start">Offline</td>
                        <td className="text-start">
                          <button
                            className="btn-style1"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-card-list"></i> Order Details
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td className="text-start">ORD001</td>
                        <td className="text-start">Mohan Kumar</td>
                        <td className="text-start">9717XXXXXX</td>
                        <td className="text-start">500</td>
                        <td className="text-start">10-08-2025</td>
                        <td className="text-start">Offline</td>
                        <td className="text-start">
                          <button
                            className="btn-style1"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-card-list"></i> Order Details
                          </button>
                          {/* <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">View Oreder</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                              onClick={handleHistory}
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger> */}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td className="text-start">ORD001</td>
                        <td className="text-start">Mohan Kumar</td>
                        <td className="text-start">9717XXXXXX</td>
                        <td className="text-start">500</td>
                        <td className="text-start">10-08-2025</td>
                        <td className="text-start">Offline</td>
                        <td className="text-start">
                          <button
                            className="btn-style1"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-card-list"></i> Order Details
                          </button>
                          {/* <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">View Oreder</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                              onClick={handleHistory}
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger> */}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td className="text-start">ORD001</td>
                        <td className="text-start">Mohan Kumar</td>
                        <td className="text-start">9717XXXXXX</td>
                        <td className="text-start">500</td>
                        <td className="text-start">10-08-2025</td>
                        <td className="text-start">Offline</td>
                        <td className="text-start">
                          <button
                            className="btn-style1"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-card-list"></i> Order Details
                          </button>
                          {/* <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">View Oreder</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                              onClick={handleHistory}
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger> */}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td className="text-start">ORD001</td>
                        <td className="text-start">Mohan Kumar</td>
                        <td className="text-start">9717XXXXXX</td>
                        <td className="text-start">500</td>
                        <td className="text-start">10-08-2025</td>
                        <td className="text-start">Offline</td>
                        <td className="text-start">
                          <button
                            className="btn-style1"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-card-list"></i> Order Details
                          </button>
                          {/* <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">View Oreder</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                              onClick={handleHistory}
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger> */}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td className="text-start">ORD001</td>
                        <td className="text-start">Mohan Kumar</td>
                        <td className="text-start">9717XXXXXX</td>
                        <td className="text-start">500</td>
                        <td className="text-start">10-08-2025</td>
                        <td className="text-start">Offline</td>
                        <td className="text-start">
                          <button
                            className="btn-style1"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-card-list"></i> Order Details
                          </button>
                          {/* <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">View Oreder</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                              onClick={handleHistory}
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger> */}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td className="text-start">ORD001</td>
                        <td className="text-start">Mohan Kumar</td>
                        <td className="text-start">9717XXXXXX</td>
                        <td className="text-start">500</td>
                        <td className="text-start">10-08-2025</td>
                        <td className="text-start">Offline</td>
                        <td className="text-start">
                          <button
                            className="btn-style1"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-card-list"></i> Order Details
                          </button>
                          {/* <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">View Oreder</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                              onClick={handleHistory}
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger> */}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td className="text-start">ORD001</td>
                        <td className="text-start">Mohan Kumar</td>
                        <td className="text-start">9717XXXXXX</td>
                        <td className="text-start">500</td>
                        <td className="text-start">10-08-2025</td>
                        <td className="text-start">Offline</td>
                        <td className="text-start">
                          <button
                            className="btn-style1"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-card-list"></i> Order Details
                          </button>
                          {/* <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">View Oreder</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                              onClick={handleHistory}
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger> */}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td className="text-start">ORD001</td>
                        <td className="text-start">Mohan Kumar</td>
                        <td className="text-start">9717XXXXXX</td>
                        <td className="text-start">500</td>
                        <td className="text-start">10-08-2025</td>
                        <td className="text-start">Offline</td>
                        <td className="text-start">
                          <button
                            className="btn-style1"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-card-list"></i> Order Details
                          </button>
                          {/* <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">View Oreder</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                              onClick={handleHistory}
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger> */}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td className="text-start">ORD001</td>
                        <td className="text-start">Mohan Kumar</td>
                        <td className="text-start">9717XXXXXX</td>
                        <td className="text-start">500</td>
                        <td className="text-start">10-08-2025</td>
                        <td className="text-start">Offline</td>
                        <td className="text-start">
                          <button
                            className="btn-style1"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-card-list"></i> Order Details
                          </button>
                          {/* <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">View Oreder</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                              onClick={handleHistory}
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger> */}
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
      {/* Order Details Modal */}
      <Modal
        show={showHistory}
        onHide={() => setShowHistory(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person-vcard"></i> Buyer Details
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
              <i className="bi bi-card-list"></i> Order Details
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

      {/* Generate Report Modal */}
      <Modal
        show={showReport}
        onHide={() => setShowReport(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-file-earmark-text me-2"></i> Generate Report
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="container-fluid">
            <div className="row align-items-end">
              <Input
                label="Start Date"
                type="date"
                name="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                max={today}
              />
              <Input
                label="End Date"
                type="date"
                name="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                max={today}
              />

              <div className="col-md-4 mb-3 d-flex align-items-end">
                <Button
                  variant="primary"
                  className="w-100 d-flex align-items-center justify-content-center gap-2"
                  style={{ height: "46px" }}
                  onClick={handleExport}
                >
                  <i className="bi bi-download"></i> Export Statement
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReport(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

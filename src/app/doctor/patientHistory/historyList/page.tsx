"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal, NavLink } from "react-bootstrap";
import "../../css/style.css";
import SideNav from "../../components/SideNav/page";
import Header from "../../components/Header/page";
import { useRouter } from "next/navigation";

export default function HistoryList() {
  const router = useRouter();
  const [showPrint, setShowPrint] = useState(false);

  const handleDetails = () => {
    setShowPrint(true);
  };
  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="row">
              <div className="col-sm-6 ">
                <div className="pageTitle ">
                  <i className="bi bi-person-add"></i> Patient History
                </div>
              </div>
              <div className="col-sm-6 d-flex justify-content-end">
                <NavLink className="btn btn-primary">
                  <Button
                    className="btn btn-primary btn-sm me-2"
                    onClick={() => router.push(`/doctor/patient/patientList`)}
                  >
                    Back
                  </Button>
                </NavLink>
              </div>
            </div>
            <div className="main_content">
              <div className="col-sm-12">
                <div className="scroll_table">
                  <table className="table cust_table1">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Contact No.</th>
                        <th>Appointment Date</th>
                        <th>Appointment Time</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Mohan Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>11-07-2025</td>
                        <td>10:30 pm</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={handleDetails}
                          >
                            <i className="bi bi-info-circle"></i> Details
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>Mohan Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>10-08-2025</td>
                        <td>12:30 pm</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={handleDetails}
                          >
                            <i className="bi bi-info-circle"></i> Details
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>Mohan Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>05-07-2025</td>
                        <td>02:30 pm</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={handleDetails}
                          >
                            <i className="bi bi-info-circle"></i> Details
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>Mohan Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>11-07-2025</td>
                        <td>11:30 am</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={handleDetails}
                          >
                            <i className="bi bi-info-circle"></i> Details
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
      <Modal
        show={showPrint}
        onHide={() => setShowPrint(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-person"></i> Patient Details
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="container-fluid">
            {/* Patient Info */}
            <div className="row">
              <div className="col-md-6">
                <p>
                  <strong>Name:</strong> Mohan Kumar
                </p>
                <p>
                  <strong>Contact No:</strong> 9717543210
                </p>
                <p>
                  <strong>Gender:</strong> Male
                </p>
                <p>
                  <strong>Age:</strong> 32
                </p>
                <p>
                  <strong>Email:</strong> john@example.com
                </p>
              </div>

              <div className="col-md-6">
                <p>
                  <strong>Appointment Date:</strong> 11 July 2025
                </p>
                <p>
                  <strong>Appointment Time:</strong> 10:30 AM
                </p>
                <p>
                  <strong>Appointment Type:</strong> Follow-up
                </p>
                <p>
                  <strong>Allergies:</strong> Penicillin
                </p>
              </div>
            </div>

            <hr />

            {/* Medical Details */}
            <div className="row">
              <div className="col-md-6">
                <p>
                  <strong>Symptoms:</strong>
                </p>
                <p>Fever, Cough, Headache</p>
              </div>
              <div className="col-md-6">
                <p>
                  <strong>Case Examination Details:</strong>
                </p>
                <p>High temperature, mild throat infection detected.</p>
              </div>
            </div>

            <hr />

            {/* Prescription */}
            <h6>Prescription</h6>
            <table className="table table-bordered table-sm">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Quantity</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Paracetamol</td>
                  <td>500mg twice a day</td>
                  <td>10</td>
                  <td>5 days</td>
                </tr>
                <tr>
                  <td>Azithromycin</td>
                  <td>250mg once a day</td>
                  <td>5</td>
                  <td>5 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrint(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

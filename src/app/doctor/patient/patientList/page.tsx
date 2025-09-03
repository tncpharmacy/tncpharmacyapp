"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import "../../css/style.css";
import SideNav from "../../components/SideNav/page";
import Header from "../../components/Header/page";
import { useRouter } from "next/navigation";
import AddPatient from "../addPatient/addPatient";

export default function PatientList() {
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
              <i className="bi bi-person-add"></i> Patient List
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
                        placeholder="Enter mobile number.."
                      />
                    </div>
                  </div>
                  <div className="col-md-7 text-end">
                    <div className="txt_col">
                      <button
                        className="btn-style2 me-2"
                        onClick={() => setShowPrint(true)}
                      >
                        <i className="bi bi-plus"></i> New Patient
                      </button>
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
                        <th>Id</th>
                        <th>Name</th>
                        <th>Contact No.</th>
                        <th>Gender</th>
                        <th>Age</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>1</td>
                        <td>Mohan Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>Male</td>
                        <td>30</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={handleBook}
                          >
                            <i className="bi bi-calendar"></i> Book
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-clock-history"></i> History
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>2</td>
                        <td>Sohan Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>Male</td>
                        <td>28</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={handleBook}
                          >
                            <i className="bi bi-calendar"></i> Book
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-clock-history"></i> History
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>3</td>
                        <td>Ramesh Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>Male</td>
                        <td>28</td>
                        <td>
                          <span className="status status-deactive"></span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={handleBook}
                          >
                            <i className="bi bi-calendar"></i> Book
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-clock-history"></i> History
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>4</td>
                        <td>Suresh Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>Male</td>
                        <td>27</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={handleBook}
                          >
                            <i className="bi bi-calendar"></i> Book
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-clock-history"></i> History
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>5</td>
                        <td>Sonu Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>Male</td>
                        <td>29</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={handleBook}
                          >
                            <i className="bi bi-calendar"></i> Book
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-clock-history"></i> History
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>6</td>
                        <td>Monu Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>Male</td>
                        <td>30</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={handleBook}
                          >
                            <i className="bi bi-calendar"></i> Book
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-clock-history"></i> History
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td>7</td>
                        <td>Sagar Kumar</td>
                        <td>9717XXXXXX</td>
                        <td>Male</td>
                        <td>32</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm me-2"
                            onClick={handleBook}
                          >
                            <i className="bi bi-calendar"></i> Book
                          </button>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={handleHistory}
                          >
                            <i className="bi bi-clock-history"></i> History
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
            <i className="bi bi-person-add"></i> Add Patient
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="container-fluid">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="form-label">Contact No</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Contact number"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Patient Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Patient name"
                />
              </div>

              <div className="col-md-3">
                <label className="form-label">Gender</label>
                <select className="form-control">
                  <option>-Select-</option>
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label">Age</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Age.."
                />
              </div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrint(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleBook}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showHistory}
        onHide={() => setShowHistory(false)}
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
                  <strong>Email:</strong> john@example.com
                </p>
              </div>

              <div className="col-md-6">
                <p>
                  <strong>Gender:</strong> Male
                </p>
                <p>
                  <strong>Age:</strong> 32
                </p>
              </div>
            </div>
            <br />
            <Modal.Title>
              <i className="bi bi-clock-history"></i> History Details
            </Modal.Title>
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
          <Button variant="secondary" onClick={() => setShowHistory(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

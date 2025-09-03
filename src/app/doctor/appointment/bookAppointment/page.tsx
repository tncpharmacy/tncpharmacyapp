"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal, NavLink } from "react-bootstrap";
import "../../css/style.css";
import SideNav from "../../components/SideNav/page";
import Header from "../../components/Header/page";
import { useRouter } from "next/navigation";

interface MedicineItem {
  medicine: string;
  dose: string;
  duration: string;
  qty: string;
  suggestion: string;
}

export default function BookAppointment() {
  const router = useRouter();
  const [medicine, setMedicine] = useState("");
  const [dose, setDose] = useState<string>(""); // default empty
  const [qty, setQty] = useState<string>(""); // default empty
  const [duration, setDuration] = useState<string>("");
  const [suggestion, setSuggestion] = useState("");
  const [medicinesList, setMedicinesList] = useState<MedicineItem[]>([]);

  // Auto calculate qty when dose or duration changes
  const handleDoseChange = (val: string) => {
    setDose(val);
    const doseNum = parseFloat(val) || 0;
    const durationNum = parseFloat(duration) || 0;
    setQty((doseNum * durationNum).toString());
  };

  const handleDurationChange = (val: string) => {
    setDuration(val);
    const doseNum = parseFloat(dose) || 0;
    const durationNum = parseFloat(val) || 0;
    setQty((doseNum * durationNum).toString());
  };

  const handleAddMedicine = () => {
    if (!medicine) return;
    const newItem: MedicineItem = {
      medicine,
      dose,
      duration,
      qty,
      suggestion,
    };
    setMedicinesList((prev) => [...prev, newItem]);

    // Reset fields
    setMedicine("");
    setDose("");
    setDuration("");
    setQty("");
    setSuggestion("");
  };

  const handleDelete = (index: number) => {
    setMedicinesList((prev) => prev.filter((_, i) => i !== index));
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
                  <i className="bi bi-person-add"></i> Book Appointment
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
                <div className="row">
                  {/* Patient Name */}
                  <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Patient Name</span>
                      <input
                        type="text"
                        className="txt1"
                        placeholder="Enter patient name"
                      />
                    </div>
                  </div>
                  {/* Contact */}
                  <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Contact No</span>
                      <input
                        type="text"
                        className="txt1"
                        placeholder="Enter contact number"
                      />
                    </div>
                  </div>
                  {/* Gender */}
                  <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Gender</span>
                      <select className="txt1">
                        <option>-Select-</option>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  {/* Age */}
                  <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Age</span>
                      <input
                        type="number"
                        className="txt1"
                        placeholder="Enter age"
                      />
                    </div>
                  </div>
                  {/* Email */}
                  {/* <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Email (optional)</span>
                      <input
                        type="email"
                        className="txt1"
                        placeholder="Enter email"
                      />
                    </div>
                  </div> */}
                  {/* Appointment Date */}
                  {/* <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Appointment Date</span>
                      <input type="date" className="txt1" />
                    </div>
                  </div> */}
                  {/* Appointment Time */}
                  {/* <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Appointment Time</span>
                      <input type="time" className="txt1" />
                    </div>
                  </div> */}
                  {/* Appointment Type */}
                  {/* <div className="col-md-3">
                    <div className="txt_col">
                      <span className="lbl1">Appointment Type</span>
                      <select className="txt1">
                        <option>-Select-</option>
                        <option>New</option>
                        <option>Follow-up</option>
                        <option>Emergency</option>
                      </select>
                    </div>
                  </div> */}
                  {/* Symptoms */}
                  <div className="col-md-6">
                    <div className="txt_col">
                      <span className="lbl1">Symptoms</span>
                      <textarea
                        className="txt1 h-50"
                        rows={4}
                        placeholder="Enter symptoms"
                      ></textarea>
                    </div>
                  </div>
                  {/* Case Examination */}
                  <div className="col-md-6">
                    <div className="txt_col">
                      <span className="lbl1">Case Examination Details</span>
                      <textarea
                        className="txt1 h-50"
                        rows={4}
                        placeholder="Enter examination details"
                      ></textarea>
                    </div>
                  </div>

                  <div className="row">
                    {/* Medicine Table */}
                    <div className="col-12 mb-3">
                      {medicinesList.length > 0 && (
                        <table className="table table-bordered">
                          <thead>
                            <tr>
                              <th>Medicine</th>
                              <th>Dosage</th>
                              <th>Qty</th>
                              <th>Duration (days)</th>
                              <th>Suggestion</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {medicinesList.map((item, index) => (
                              <tr key={index}>
                                <td>{item.medicine}</td>
                                <td>{item.dose}</td>
                                <td>{item.qty}</td>
                                <td>{item.duration}</td>
                                <td>{item.suggestion}</td>
                                <td>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDelete(index)}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Medicine Inputs */}
                    <div className="col-md-2">
                      <div className="txt_col">
                        <span className="lbl1">Medicine</span>
                        <input
                          type="text"
                          className="txt1"
                          value={medicine}
                          onChange={(e) => setMedicine(e.target.value)}
                          placeholder="Enter medicine"
                        />
                      </div>
                    </div>

                    <div className="col-md-2">
                      <div className="txt_col">
                        <span className="lbl1">Dosage</span>
                        <input
                          type="number"
                          className="txt1"
                          value={dose}
                          onChange={(e) => handleDoseChange(e.target.value)}
                          placeholder="Dose"
                        />
                      </div>
                    </div>

                    <div className="col-md-2">
                      <div className="txt_col">
                        <span className="lbl1">Duration</span>
                        <input
                          type="number"
                          className="txt1"
                          value={duration}
                          onChange={(e) => handleDurationChange(e.target.value)}
                          placeholder="Days"
                        />
                      </div>
                    </div>

                    <div className="col-md-2">
                      <div className="txt_col">
                        <span className="lbl1">Quantity</span>
                        <input
                          type="number"
                          className="txt1"
                          value={qty}
                          readOnly
                          placeholder="Qty"
                        />
                      </div>
                    </div>

                    <div className="col-md-2">
                      <div className="txt_col">
                        <span className="lbl1">Suggestion</span>
                        <input
                          type="text"
                          className="txt1"
                          value={suggestion}
                          onChange={(e) => setSuggestion(e.target.value)}
                          placeholder="Enter suggestion"
                        />
                      </div>
                    </div>

                    <div className="col-md-2 d-flex align-items-center">
                      <button
                        type="button"
                        className="btn btn-primary w-100"
                        onClick={handleAddMedicine}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Allergies */}
                  {/* <div className="col-md-6">
                    <div className="txt_col">
                      <span className="lbl1">Allergies (if any)</span>
                      <input
                        type="text"
                        className="txt1"
                        placeholder="Enter allergies"
                      />
                    </div>
                  </div> */}
                  {/* Submit */}
                  <div className="clearfix"></div>
                  <div className="col-md-4 mt-3">
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

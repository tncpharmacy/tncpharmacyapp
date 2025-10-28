"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import "../../css/pharmacy-style.css";
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
                      <Link href={"/add-medicines"} className="btn-style2 me-2">
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
                        <th>Medicine Image</th>
                        <th>Id</th>
                        <th>Medicine Name</th>
                        <th>Generic Name</th>
                        <th>Description</th>
                        <th>Prescription Required</th>
                        <th>Category</th>
                        <th>Marketed By</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{ width: "40px", borderRadius: "50%" }}
                          />
                        </td>
                        <td>TNC321321</td>
                        <td>Augmentin 625</td>
                        <td>Amoxicillin+Clav</td>
                        <td>Broad spectrum antibiotic</td>
                        <td>Yes</td>
                        <td>Antibiotic</td>
                        <td>Cipla Ltd.</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td style={{ display: "flex" }}>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">Upload Image</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-upload"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{ width: "40px", borderRadius: "50%" }}
                          />
                        </td>
                        <td>TNC321321</td>
                        <td>Augmentin 625</td>
                        <td>Amoxicillin+Clav</td>
                        <td>Broad spectrum antibiotic</td>
                        <td>Yes</td>
                        <td>Antibiotic</td>
                        <td>Cipla Ltd.</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td style={{ display: "flex" }}>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">Upload Image</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-upload"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{ width: "40px", borderRadius: "50%" }}
                          />
                        </td>
                        <td>TNC321321</td>
                        <td>Augmentin 625</td>
                        <td>Amoxicillin+Clav</td>
                        <td>Broad spectrum antibiotic</td>
                        <td>Yes</td>
                        <td>Antibiotic</td>
                        <td>Cipla Ltd.</td>
                        <td>
                          <span className="status status-deactive"></span>
                        </td>
                        <td style={{ display: "flex" }}>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">Upload Image</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-upload"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{ width: "40px", borderRadius: "50%" }}
                          />
                        </td>
                        <td>TNC321321</td>
                        <td>Augmentin 625</td>
                        <td>Amoxicillin+Clav</td>
                        <td>Broad spectrum antibiotic</td>
                        <td>Yes</td>
                        <td>Antibiotic</td>
                        <td>Cipla Ltd.</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td style={{ display: "flex" }}>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">Upload Image</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-upload"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{ width: "40px", borderRadius: "50%" }}
                          />
                        </td>
                        <td>TNC321321</td>
                        <td>Augmentin 625</td>
                        <td>Amoxicillin+Clav</td>
                        <td>Broad spectrum antibiotic</td>
                        <td>Yes</td>
                        <td>Antibiotic</td>
                        <td>Cipla Ltd.</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td style={{ display: "flex" }}>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">Upload Image</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-upload"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{ width: "40px", borderRadius: "50%" }}
                          />
                        </td>
                        <td>TNC321321</td>
                        <td>Augmentin 625</td>
                        <td>Amoxicillin+Clav</td>
                        <td>Broad spectrum antibiotic</td>
                        <td>Yes</td>
                        <td>Antibiotic</td>
                        <td>Cipla Ltd.</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td style={{ display: "flex" }}>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">Upload Image</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-upload"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{ width: "40px", borderRadius: "50%" }}
                          />
                        </td>
                        <td>TNC321321</td>
                        <td>Augmentin 625</td>
                        <td>Amoxicillin+Clav</td>
                        <td>Broad spectrum antibiotic</td>
                        <td>Yes</td>
                        <td>Antibiotic</td>
                        <td>Cipla Ltd.</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td style={{ display: "flex" }}>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">Upload Image</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-upload"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{ width: "40px", borderRadius: "50%" }}
                          />
                        </td>
                        <td>TNC321321</td>
                        <td>Augmentin 625</td>
                        <td>Amoxicillin+Clav</td>
                        <td>Broad spectrum antibiotic</td>
                        <td>Yes</td>
                        <td>Antibiotic</td>
                        <td>Cipla Ltd.</td>
                        <td>
                          <span className="status status-active"></span>
                        </td>
                        <td style={{ display: "flex" }}>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">Edit</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-pencil"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id="tooltip-top">View</Tooltip>}
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-eye-fill"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip-top">Upload Image</Tooltip>
                            }
                          >
                            <Button
                              className="btn btn-light btn-sm me-2"
                              variant="primary"
                            >
                              <i className="bi bi-upload"></i>
                            </Button>
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
    </>
  );
}

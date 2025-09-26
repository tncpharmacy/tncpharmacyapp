"use client";

import Link from "next/link";
import { useEffect } from "react";
import "../../css/style.css";
import SideNav from "@/app/pharmacy/components/SideNav/page";
import Header from "@/app/pharmacy/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchPharmacySelf } from "@/lib/features/pharmacySelfSlice/pharmacySelfSlice";

export default function ViewProfile() {
  const dispatch = useAppDispatch();
  const { selfPharmacy, loading, error } = useAppSelector(
    (state) => state.selfPharmacy
  );

  useEffect(() => {
    dispatch(fetchPharmacySelf()); // ✅ no argument, slice handles ID
  }, [dispatch]);

  const pharmacy = selfPharmacy;

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-person-add"></i> Profile
            </div>
            <div className="main_content">
              <div className="row">
                <div className="col-md-8"></div>
                <div className="col-md-4 text-end">
                  <div className="txt_col">
                    <Link href={"/update-profile"} className="btn-style2 me-2">
                      <i className="bi bi-pencil"></i> Update Profile
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-sm-12">
                <div className="container my-4">
                  <div className="row">
                    <div className="col-sm-6">
                      <div className="card p-3 mb-3">
                        <h4>Basic Info</h4>
                        <br />
                        <p>
                          <strong>Pharmacy Name:</strong>{" "}
                          {pharmacy?.pharmacy_name}
                        </p>
                        <p>
                          <strong>Pharmacy ID:</strong>{" "}
                          {pharmacy?.pharmacy_id_code}
                        </p>
                        <p>
                          <strong>License Number:</strong>{" "}
                          {pharmacy?.license_number}
                        </p>
                        <p>
                          <strong>License Valid Upto:</strong>{" "}
                          {pharmacy?.license_valid_upto}
                        </p>
                        <p>
                          <strong>GST Number:</strong> {pharmacy?.gst_number}
                        </p>
                        <p>
                          <strong>Status:</strong>{" "}
                          <span
                            className={
                              pharmacy?.status === "Active"
                                ? "text-success"
                                : "text-danger"
                            }
                          >
                            {pharmacy?.status}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="card p-3 mb-3">
                        <h4>Contact & Address</h4> <br />
                        <p>
                          <strong>Email:</strong> {pharmacy?.email_id}
                        </p>
                        <p>
                          <strong>District:</strong> {pharmacy?.district}
                        </p>
                        <p>
                          <strong>State ID:</strong> {pharmacy?.state}
                        </p>
                        <p>
                          <strong>Pincode:</strong> {pharmacy?.pincode}
                        </p>
                        <p>
                          <strong>Address:</strong> {pharmacy?.address}
                        </p>
                        <p>
                          <strong>Phone / Login ID:</strong>{" "}
                          {pharmacy?.login_id}
                        </p>
                        <p>
                          <strong>Owner Name:</strong> {pharmacy?.user_name}
                        </p>
                      </div>
                    </div>
                  </div>

                  {pharmacy?.documents && pharmacy?.documents.length > 0 && (
                    <div className="card p-3 mb-3">
                      <h4>Documents</h4>
                      <div className="d-flex flex-wrap gap-3">
                        {pharmacy.documents.map((doc) => (
                          <div key={doc.id}>
                            <img
                              src={`http://68.183.174.17:8081${doc.document}`}
                              alt={`Document ${doc.id}`}
                              style={{
                                width: "150px",
                                height: "150px",
                                objectFit: "cover",
                              }}
                              className="border rounded"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

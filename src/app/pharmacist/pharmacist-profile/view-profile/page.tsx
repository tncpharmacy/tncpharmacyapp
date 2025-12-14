"use client";

import Link from "next/link";
import { useEffect } from "react";
import "../../css/pharmacy-style.css";
import SideNav from "@/app/pharmacist/components/SideNav/page";
import Header from "@/app/pharmacist/components/Header/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { fetchPharmacistSelf } from "@/lib/features/pharmacistSelfSlice/pharmacistSelfSlice";
import { Image } from "react-bootstrap";
const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;

export default function ViewProfile() {
  const dispatch = useAppDispatch();
  const { selfPharmacy, loading, error } = useAppSelector(
    (state) => state.selfPharmacist
  );

  useEffect(() => {
    dispatch(fetchPharmacistSelf()); // ✅ no argument, slice handles ID
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
                <div className="col-md-8">
                  <Image
                    src={
                      pharmacy?.profile_pic
                        ? `${mediaBase}${pharmacy.profile_pic}`
                        : "/images/default-profile.jpg"
                    }
                    alt="Profile"
                    width={150}
                    height={150}
                    className="rounded-full object-cover border"
                  />
                </div>
                <div className="col-md-4 text-end">
                  <div className="txt_col">
                    <Link
                      href={"/pharmacist/update-profile"}
                      className="btn-style2 me-2"
                    >
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
                          {pharmacy?.pharmacy_id ?? ""}
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
                          <strong>Owner Name:</strong> {pharmacy?.user_name}
                        </p>
                        <p>
                          <strong>Email:</strong> {pharmacy?.email_id}
                        </p>
                        <p>
                          <strong>Phone / Login ID:</strong>{" "}
                          {pharmacy?.login_id}
                        </p>
                        <p>
                          <strong>Gender:</strong> {pharmacy?.gender ?? ""}
                        </p>
                        <p>
                          <strong>Date Of Birth:</strong>{" "}
                          {pharmacy?.date_of_birth ?? ""}
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
                            <Image
                              src={`${mediaBase}${doc.document}`}
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

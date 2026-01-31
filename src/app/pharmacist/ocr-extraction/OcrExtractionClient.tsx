"use client";

import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Container, Row, Alert, Spinner } from "react-bootstrap";
import Link from "next/link";
import Header from "../components/Header/page";
import SideNav from "../components/SideNav/page";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { getPharmacistBuyerByIdThunk } from "@/lib/features/pharmacistBuyerListSlice/pharmacistBuyerListSlice";

const DynamicOcrLogic = dynamic(() => import("./OcrExtractionLogic"), {
  ssr: false,
  loading: () => (
    <div className="text-center mt-5">
      <Spinner animation="border" className="mb-2" />
      <p>Loading Prescription...</p>
    </div>
  ),
});

const OcrExtractionClient: React.FC = () => {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const prescriptionId = searchParams.get("id");

  const buyerId = searchParams.get("buyerId");
  const buyerName = searchParams.get("buyerName");
  const buyerMobile = searchParams.get("buyerMobile");
  const [buyer, setBuyer] = useState(null);
  const mediaBase = process.env.NEXT_PUBLIC_MEDIA_BASE_URL;
  const encodedUrl = searchParams.get("imageUrl");
  const { pharmacyBuyersById } = useAppSelector(
    (state) => state.pharmacistBuyerList
  );
  useEffect(() => {
    if (buyerId) {
      dispatch(getPharmacistBuyerByIdThunk(Number(buyerId)));
    }
  }, [dispatch, buyerId]);

  let imageUrl = "";
  if (encodedUrl) {
    const decoded = decodeURIComponent(encodedUrl);

    // If backend sent `/media/...`
    if (decoded.startsWith("/")) {
      imageUrl = `${mediaBase}${decoded}`;
    } else {
      // If full URL already
      imageUrl = decoded;
    }
  }

  if (!imageUrl || !prescriptionId) {
    return (
      <>
        <Header />
        <div className="body_wrap">
          <SideNav />
          <div className="body_right">
            <Container className="mt-5">
              <Alert variant="danger">
                Missing prescription URL or ID.{" "}
                <Link href="/pharmacist/prescription">Go back</Link>
              </Alert>
            </Container>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="pageTitle mt-2 ms-2 d-flex justify-content-between align-items-center">
            <div>
              <i className="bi bi-receipt"></i> Patient Prescription Summary
            </div>

            <div className="d-flex align-items-center gap-4 me-3 p-2 bg-light rounded shadow-sm">
              <div className="text-primary fw-semibold">
                <i className="bi bi-person-circle me-2"></i>
                Patient:{" "}
                <span className="text-dark">
                  {pharmacyBuyersById?.data?.name || "N/A"}
                </span>
              </div>
              <div className="text-success fw-semibold">
                <i className="bi bi-telephone me-2"></i>
                Mobile:{" "}
                <span className="text-dark">
                  {pharmacyBuyersById?.data?.number || "N/A"}
                </span>
              </div>
            </div>
          </div>

          <div className="main_content">
            <DynamicOcrLogic
              imageUrl={imageUrl}
              prescriptionId={prescriptionId}
              buyerName={buyerName || ""}
              buyerMobile={Number(buyerMobile || 0)}
              buyerId={Number(buyerId || 0)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default OcrExtractionClient;

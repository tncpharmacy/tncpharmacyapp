"use client";

import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Container, Row, Col, Alert, Spinner, Card } from "react-bootstrap";
import Link from "next/link";
import Header from "../components/Header/page";
import SideNav from "../components/SideNav/page";

const DynamicOcrLogic = dynamic(() => import("./OcrExtractionLogic"), {
  ssr: false,
  loading: () => (
    <div className="text-center mt-5">
      <Spinner animation="border" className="mb-2" />
      <p>Initializing OCR Engine...</p>
    </div>
  ),
});

const OcrExtractionPage: React.FC = () => {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get("imageUrl");
  const prescriptionId = searchParams.get("id");
  const buyerId = searchParams.get("buyerId");
  const buyerName = searchParams.get("buyerName");
  const buyerMobile = searchParams.get("buyerMobile");
  //const buyerEmail = searchParams.get("buyer_email");

  if (!imageUrl || !prescriptionId) {
    return (
      <>
        <Header />
        <div className="body_wrap">
          <SideNav />
          <div className="body_right">
            <Container className="mt-5">
              <Alert variant="danger">
                Missing prescription image URL or ID in parameters.{" "}
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
            <div className="d-flex justify-content-end align-items-center gap-4 me-3 mt-2 p-2 rounded shadow-sm bg-light border">
              <div className="d-flex align-items-center text-primary fw-semibold">
                <i className="bi bi-person-circle me-2"></i>
                <span>
                  Patient:{" "}
                  <span className="text-dark">{buyerName || "N/A"}</span>
                </span>
              </div>

              <div className="d-flex align-items-center text-success fw-semibold">
                <i className="bi bi-telephone me-2"></i>
                <span>
                  Mobile:{" "}
                  <span className="text-dark">{buyerMobile || "N/A"}</span>
                </span>
              </div>
            </div>
          </div>
          <div className="main_content">
            {/* <Container> */}
            {/* <Card className="p-3 shadow-sm"> */}
            <DynamicOcrLogic
              imageUrl={imageUrl || ""}
              prescriptionId={prescriptionId || ""}
              buyerEmail={searchParams.get("buyer_email") || ""}
              buyerName={searchParams.get("buyer_name") || ""}
              buyerMobile={Number(searchParams.get("mobile") || 0)}
              buyerId={Number(searchParams.get("buyer") || 0)}
            />
            {/* </Card> */}
            {/* </Container> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default OcrExtractionPage;

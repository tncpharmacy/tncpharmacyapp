"use client";
import "../../css/site-style.css";
import "../../css/user-style.css";
import SiteHeader from "@/app/user/components/header/header";
import MedicineList from "../../components/MedicineCard/MedicineList";
import { Image } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect } from "react";
import { getMenuMedicinesList } from "@/lib/features/medicineSlice/medicineSlice";
import Footer from "@/app/user/components/footer/footer";

export default function AllMedicine() {
  const dispatch = useAppDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { medicinesList: medicines } = useAppSelector(
    (state) => state.medicine
  );
  const { loading } = useAppSelector((state) => state.medicine);
  useEffect(() => {
    dispatch(getMenuMedicinesList());
  }, [dispatch]);
  return (
    <>
      <div className="page-wrapper">
        <SiteHeader />

        <div className="body_wrap">
          {/* <FilterSidebar /> */}
          <div className="body_right">
            <div
              className="body_content"
              style={{ overflowY: "hidden", height: "calc(100vh - 100px)" }}
            >
              {/* <Link href={"#"}> */}
              <MedicineList medicines={medicines || []} loading={loading} />
              {/* </Link> */}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

"use client";
import "../../css/site-style.css";
import "../../css/user-style.css";
import SiteHeader from "@/app/user/components/header/header";
import MedicineList from "../../components/MedicineCard/MedicineList";
import { Image } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useEffect, useState } from "react";
import { getMenuMedicinesList } from "@/lib/features/medicineSlice/medicineSlice";
import Footer from "@/app/user/components/footer/footer";
import Pagination from "@/app/components/Pagination/Pagination";

export default function AllMedicine() {
  const dispatch = useAppDispatch();

  const { medicinesList, loading, count, next } = useAppSelector(
    (state) => state.medicine
  );

  const [page, setPage] = useState(1);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [prevStack, setPrevStack] = useState<string[]>([]);

  useEffect(() => {
    dispatch(getMenuMedicinesList(currentUrl));
  }, [dispatch, currentUrl]);

  const totalPages = count ? Math.ceil(count / 10) : next ? page + 1 : page;
  console.log("currentUrl:", currentUrl);
  console.log("count:", count);
  console.log("next:", next);
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
              <MedicineList medicines={medicinesList || []} loading={loading} />
              {/* </Link> */}
              {/* 🔥 PAGINATION YAHAN LAGANA HAI */}
              <div className="d-flex justify-content-center mt-3">
                <Pagination
                  currentPage={page}
                  hasNext={!!next}
                  hasPrev={page > 1} // 👈 add this
                  onPageChange={(newPage) => {
                    if (newPage > page && next) {
                      setPrevStack((prev) => [...prev, currentUrl || ""]);
                      setCurrentUrl(next);
                      setPage(newPage);
                    }

                    if (newPage < page && prevStack.length > 0) {
                      const lastUrl = prevStack[prevStack.length - 1];

                      setPrevStack((prev) => prev.slice(0, -1));
                      setCurrentUrl(lastUrl || null);
                      setPage(newPage);
                    }

                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

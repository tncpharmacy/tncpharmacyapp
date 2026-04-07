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
import { useRouter, useSearchParams } from "next/navigation";

export default function AllMedicine() {
  const dispatch = useAppDispatch();
  // const searchParams = useSearchParams();
  // const router = useRouter();

  const { medicinesList, loading, count, next } = useAppSelector(
    (state) => state.medicine
  );

  // const initialPage = Number(searchParams.get("pg")) || 1;
  const [page, setPage] = useState(1);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [prevStack, setPrevStack] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    dispatch(getMenuMedicinesList(currentUrl));
  }, [dispatch, currentUrl]);

  useEffect(() => {
    if (!loading) {
      setPageLoading(false);
    }
  }, [loading]);

  const totalPages = count ? Math.ceil(count / 10) : next ? page + 1 : page;
  // const updatePage = (newPage: number) => {
  //   const params = new URLSearchParams(searchParams.toString());
  //   params.set("pg", String(newPage));

  //   router.push(`?${params.toString()}`);
  //   setPage(newPage);
  // };
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
              <MedicineList
                medicines={medicinesList || []}
                loading={loading}
                pageLoading={pageLoading}
              />
              {/* </Link> */}
              {/* 🔥 PAGINATION  */}
              {medicinesList && medicinesList.length > 0 && !loading && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination
                    currentPage={page}
                    hasNext={!!next}
                    hasPrev={page > 1} // 👈 add this
                    onPageChange={(newPage) => {
                      setPageLoading(true);
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
                      window.scrollTo({ top: 0, behavior: "auto" });
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}

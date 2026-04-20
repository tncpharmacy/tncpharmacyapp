"use client";

import "../../css/site-style.css";
import "../../css/user-style.css";

import { useEffect, useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { getMenuMedicinesList } from "@/lib/features/medicineSlice/medicineSlice";

import MedicineList from "../../components/MedicineCard/MedicineList";
import Footer from "@/app/(user)/components/footer/footer";
import Pagination from "@/app/components/Pagination/Pagination";

export default function AllMedicineClient({
  initialData,
  initialNext,
  initialCount,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initialData: any[];
  initialNext: string | null;
  initialCount: number;
}) {
  const dispatch = useAppDispatch();

  const [page, setPage] = useState(1);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [prevStack, setPrevStack] = useState<string[]>([]);
  const [pageLoading, setPageLoading] = useState(false);

  const [medicines, setMedicines] = useState(initialData);
  const [next, setNext] = useState(initialNext);
  const [count, setCount] = useState(initialCount);

  // 🔥 ONLY pagination pe API call
  useEffect(() => {
    if (currentUrl === null) {
      setMedicines(initialData);
      setNext(initialNext);
      setCount(initialCount);

      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "auto" });
      }, 0);

      setPageLoading(false); // 🔥 important
      return;
    }

    const fetchData = async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const res: any = await dispatch(getMenuMedicinesList(currentUrl));
        const data = res?.payload;

        setMedicines(data?.data || []);
        setNext(data?.next || null);
        setCount(data?.count || 0);

        // 🔥 scroll AFTER data ready
        window.scrollTo({ top: 0, behavior: "auto" });
      } catch (err) {
        console.error(err);
      } finally {
        setPageLoading(false);
      }
    };

    fetchData();
  }, [dispatch, currentUrl, initialCount, initialNext, initialData]);

  const totalPages = count ? Math.ceil(count / 10) : page;

  return (
    <div className="page-wrapper">
      <div className="body_wrap">
        <div className="body_right">
          <div
            className="body_content"
            style={{ overflowY: "hidden", minHeight: "60vh" }}
          >
            {/* ✅ DATA */}
            <MedicineList
              medicines={medicines}
              loading={false}
              pageLoading={pageLoading}
            />

            {/* ✅ PAGINATION */}
            {medicines?.length > 0 && next && (
              <div className="d-flex justify-content-center mt-3">
                <Pagination
                  currentPage={page}
                  hasNext={!!next}
                  hasPrev={page > 1}
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
  );
}

"use client";

import { useEffect } from "react";

interface InfiniteScrollProps {
  children: React.ReactNode;
  loadMore: () => void;
  hasMore: boolean;
}

export default function InfiniteScroll({
  children,
  loadMore,
  hasMore,
}: InfiniteScrollProps) {
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const pageHeight = document.body.offsetHeight;

      // ✅ Bottom reached
      if (scrollPosition >= pageHeight - 100) {
        loadMore();
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadMore]);

  return <>{children}</>;
}

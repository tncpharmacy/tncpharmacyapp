"use client";
import React, { useEffect, useRef } from "react";

interface InfiniteScrollProps {
  children: React.ReactNode;
  loadMore: () => void;
  hasMore: boolean;
  threshold?: number;
  className?: string;
}

const InfiniteScroll: React.FC<InfiniteScrollProps> = ({
  children,
  loadMore,
  hasMore,
  threshold = 100,
  className,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !hasMore) return;

      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

      if (scrollTop + clientHeight >= scrollHeight - threshold) {
        loadMore();
      }
    };

    const container = containerRef.current;
    if (container) container.addEventListener("scroll", handleScroll);

    return () => {
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, [loadMore, hasMore, threshold]);

  return (
    <div ref={containerRef} className={className} style={{ overflowY: "auto" }}>
      {children}
    </div>
  );
};

export default InfiniteScroll;

"use client";

import { useEffect } from "react";
import { loadAnalytics, loadMetaPixel } from "@/lib/analytics";

export default function AnalyticsProvider() {
  useEffect(() => {
    loadAnalytics();
    loadMetaPixel();
  }, []);

  return null;
}

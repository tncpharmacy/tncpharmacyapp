"use client";

import { useEffect } from "react";

export default function LayoutFix() {
  useEffect(() => {
    // Bootstrap JS jo padding add karta hai, usko force reset
    document.body.style.paddingTop = "0px";
  }, []);

  return null;
}

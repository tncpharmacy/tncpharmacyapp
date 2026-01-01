"use client";

import Image from "next/image";
import "./CenterSpinner.css";

export default function CenterSpinner() {
  return (
    <div className="center-spinner-overlay">
      <div className="center-spinner-rotate">
        <Image
          src="/images/tnc-capsule.png"
          alt="Loading"
          width={70}
          height={70}
          priority
        />
      </div>
    </div>
  );
}

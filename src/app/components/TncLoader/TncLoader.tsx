"use client";

import React from "react";
import Image from "next/image";
import "./tnc-loader.css";

interface TncLoaderProps {
  size?: number; // image size
  text?: string; // optional loading text
}

const TncLoader: React.FC<TncLoaderProps> = ({
  size = 64,
  text = "Loading...",
}) => {
  return (
    <div className="tnc-loader-wrapper">
      <div className="tnc-loader">
        <Image
          src="/images/tnc-capsule.png"
          alt="Loading"
          width={size}
          height={size}
          priority
        />
      </div>
      {text && <div className="tnc-loader-text">{text}</div>}
    </div>
  );
};

export default TncLoader;

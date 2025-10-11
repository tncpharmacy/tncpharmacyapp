import React from "react";
import "../../css/medicine.css";
import Image from "next/image";

type Props = {
  name: string;
  pack?: string;
  company?: string;
  salt?: string;
  mrp?: number;
  prescription?: boolean;
  availability?: string;
};

export default function MedicineCard({
  name,
  pack,
  company,
  salt,
  mrp = 0,
  prescription,
  availability = "ADD",
}: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN").format(value);
  };

  return (
    <div className="medicine-card">
      <div className="medicine-content">
        {/* Top section */}
        <div className="medicine-top">
          {/* Placeholder for Image */}
          <div className="medicine-img">
            <Image
              src={"/images/tnc-default-small.png"}
              alt=""
              width={40}
              height={40}
            />
          </div>

          {/* Medicine Details */}
          <div className="medicine-details">
            <div className="medicine-header">
              <h3 className="medicine-name">{name}</h3>
              {prescription && (
                <div className="relative medicine-badge">
                  <Image
                    src="/images/RX-small.png"
                    alt="Prescription Required"
                    title="Prescription Required"
                    height={25}
                    width={30}
                    className="absolute top-0 right-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
            {pack && <p className="medicine-text">{pack}</p>}
            {company && <p className="medicine-text">{company}</p>}
            {salt && <p className="medicine-salt">{salt}</p>}
          </div>
        </div>

        {/* Bottom section */}
        <div className="medicine-bottom">
          <p className="medicine-mrp">MRP ₹{formatCurrency(mrp)}</p>;
          {availability === "ADD" ? (
            <button className="medicine-btn">ADD</button>
          ) : (
            <span className="medicine-na">{availability}</span>
          )}
        </div>
      </div>
    </div>
  );
}

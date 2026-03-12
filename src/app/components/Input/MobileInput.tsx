import React, { useState } from "react";

interface MobileInputProps {
  label: string;
  name: string;
  value: string;
  required?: boolean;
  colClass?: string;
  onChange: (value: string) => void;
}

const MobileInput: React.FC<MobileInputProps> = ({
  label,
  name,
  value,
  required = false,
  colClass = "col-md-4",
  onChange,
}) => {
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");

    if (val.length > 10) return;

    if (val && val.length !== 10) {
      setError("Mobile number must be 10 digits");
    } else {
      setError("");
    }

    onChange(val);
  };

  return (
    <div className={colClass}>
      <div className="txt_col">
        <span className="lbl1">
          {label} {required && <span className="text-danger">*</span>}
        </span>

        <input
          type="text"
          name={name}
          className="txt1"
          value={value || ""}
          onChange={handleChange}
          maxLength={10}
          placeholder=""
        />

        {error && <small className="text-danger fw-semibold">{error}</small>}
      </div>
    </div>
  );
};

export default MobileInput;

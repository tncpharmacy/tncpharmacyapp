import React from "react";

interface InputTextAreaProps {
  label: string;
  name: string;
  value?: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  error?: string;
  colClass?: string;
  rows?: number;
  cols?: number;
  maxLength?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const InputTextArea: React.FC<InputTextAreaProps> = ({
  label,
  name,
  value,
  placeholder,
  required = false,
  readOnly = false,
  error,
  colClass = "col-md-12",
  rows = 6,
  cols,
  maxLength,
  onChange,
}) => {
  return (
    <div className={colClass}>
      <div className="txt_col">
        <span className="lbl1">
          {label} {required && <span className="text-danger">*</span>}
        </span>

        <textarea
          id={name}
          name={name}
          className="txt1"
          value={value ?? ""}
          placeholder={placeholder}
          required={required}
          readOnly={readOnly}
          onChange={onChange}
          rows={rows}
          cols={cols}
          maxLength={maxLength}
        />

        {error && <small className="text-danger">{error}</small>}
      </div>
    </div>
  );
};

export default InputTextArea;

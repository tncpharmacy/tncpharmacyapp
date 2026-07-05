"use client";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { getSearchProductBased } from "@/lib/features/medicineSlice/medicineSlice";
import { Medicine } from "@/types/medicine";

import Select, {
  components,
  type MenuListProps,
  type OptionProps,
  type SingleValue,
} from "react-select";

type OptionType = {
  label: string;
  value: number;
  medicine: Medicine;
};

type Props = {
  value?: Medicine | null;
  label: string;
  onChange: (item: Medicine | null) => void;
  placeholder?: string;
  isDisabled?: boolean;
};

export default function ProductDropdown({
  value,
  label,
  onChange,
  placeholder = "Search Product...",
  isDisabled = false,
}: Props) {
  const dispatch = useAppDispatch();

  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const timer = useRef<NodeJS.Timeout | null>(null);

  // ==========================
  // SEARCH API
  // ==========================

  useEffect(() => {
    if (!inputValue.trim()) {
      setOptions([]);
      return;
    }

    if (timer.current) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await dispatch(getSearchProductBased(inputValue)).unwrap();

        const list: Medicine[] = Array.isArray(res?.data) ? res.data : [];

        const finalOptions: OptionType[] = list.map((item) => ({
          value: item.id,
          label: item.medicine_name,
          medicine: item,
        }));

        setOptions(finalOptions);
      } catch (err) {
        console.error(err);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [inputValue, dispatch]);

  // ==========================
  // Selected Value
  // ==========================

  const selectedValue: OptionType | null = value
    ? {
        value: value.id,
        label: value.medicine_name,
        medicine: value,
      }
    : null;

  // ==========================
  // Custom Option UI
  // ==========================

  const CustomOption = (props: OptionProps<OptionType, false>) => {
    return (
      <components.Option {...props}>
        <div
          style={{
            padding: "6px 2px",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          {props.data.medicine.medicine_name}
        </div>
      </components.Option>
    );
  };

  // ==========================
  // Selected Value
  // ==========================
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomSingleValue = (props: any) => {
    return (
      <components.SingleValue {...props}>
        {props.data.medicine.medicine_name}
      </components.SingleValue>
    );
  };

  // ==========================
  // Styles
  // ==========================

  const customStyles = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    control: (provided: any) => ({
      ...provided,
      minHeight: 46,
      borderColor: "#ced4da",
      boxShadow: "none",

      "&:hover": {
        borderColor: "#80bdff",
      },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    option: (provided: any, state: any) => ({
      ...provided,

      background: state.isFocused ? "#f5f8ff" : "#fff",

      color: "#000",

      cursor: "pointer",
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menuList: (provided: any) => ({
      ...provided,
      maxHeight: 320,
    }),
  };

  return (
    <div className="custom-input-group position-relative">
      <label
        htmlFor={"11"}
        className="floating-label fw-semibold text-dark small"
        style={{
          position: "absolute",
          top: "-10px",
          left: "10px",
          background: "#fff",
          padding: "0 6px",
          fontSize: "13px",
          color: "#495057",
          zIndex: 5,
        }}
      >
        {label}
      </label>
      <Select
        instanceId="product-dropdown"
        inputId="product-dropdown-input"
        options={options}
        value={selectedValue}
        isDisabled={isDisabled}
        isLoading={loading}
        isClearable
        placeholder={placeholder}
        filterOption={null} // API filtering only
        loadingMessage={() => "Searching products..."}
        noOptionsMessage={() =>
          inputValue ? "No products found" : "Type product name..."
        }
        onInputChange={(value, action) => {
          if (action.action === "input-change") {
            setInputValue(value);
          }

          return value;
        }}
        onChange={(option: SingleValue<OptionType>) => {
          if (!option) {
            onChange(null);
            return;
          }

          onChange(option.medicine);
        }}
        components={{
          Option: CustomOption,
          SingleValue: CustomSingleValue,
        }}
        styles={customStyles}
      />
    </div>
  );
}

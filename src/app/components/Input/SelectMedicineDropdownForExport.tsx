"use client";

import { useEffect, useRef, useState } from "react";
import { useAppDispatch } from "@/lib/hooks";
import { getSearchProductBased } from "@/lib/features/medicineSlice/medicineSlice";
import { Medicine } from "@/types/medicine";

import Select, {
  components,
  type MenuListProps,
  type OptionProps,
  type MultiValue,
} from "react-select";

type OptionType = {
  label: string;
  value: number;
  medicine: Medicine;
};

type Props = {
  value?: Medicine | null;
  label?: string;
  placeholder?: string;
  isDisabled?: boolean;
  selectedMedicines: Medicine[];
  onSelect: (medicine: Medicine) => void;
};

export default function SelectMedicineDropdownForExport({
  value,
  label,
  placeholder = "Search Product...",
  isDisabled = false,
  selectedMedicines,
  onSelect,
}: Props) {
  const dispatch = useAppDispatch();

  const [options, setOptions] = useState<OptionType[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const timer = useRef<NodeJS.Timeout | null>(null);

  const selectedIds = new Set(selectedMedicines.map((m) => m.id));
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
    const checked = selectedIds.has(props.data.value);

    return (
      <components.Option
        {...props}
        innerProps={{
          ...props.innerProps,

          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();

            onSelect(props.data.medicine);
          },
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <input type="checkbox" checked={checked} readOnly />

          <span>{props.data.label}</span>
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
        instanceId="medicine-search"
        inputId="medicine-search"
        menuPlacement="auto"
        options={options}
        value={null}
        inputValue={inputValue}
        closeMenuOnSelect={false}
        blurInputOnSelect={false}
        controlShouldRenderValue={false}
        hideSelectedOptions={false}
        isSearchable
        filterOption={null}
        isDisabled={isDisabled}
        isLoading={loading}
        placeholder={placeholder}
        components={{
          Option: CustomOption,
        }}
        styles={customStyles}
        onInputChange={(value, action) => {
          if (action.action === "input-change") {
            setInputValue(value);
          }
        }}
        onChange={() => {}}
      />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { toast } from "react-hot-toast";
import { Address, AddressResponse } from "@/types/address";
import "../../user/css/user-style.css";
import { addAddress } from "@/lib/features/addressSlice/addressSlice";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { useRouter } from "next/navigation";

interface ConfirmLocationModalProps {
  show: boolean;
  onClose: () => void;
  locationDetails: Partial<Address>;
  onSubmit: (data: Address) => void;
  userId: number;
}

export default function ConfirmLocationModal({
  show,
  onClose,
  locationDetails,
  onSubmit,
  userId,
}: ConfirmLocationModalProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<Address>>({
    id: 0,
    name: "",
    mobile: "",
    address: "",
    // city: "",
    // state: "",
    // country: "",
    pincode: "",
    location: "",
    map: "",
    // default_address: 0,
    //  status: "",
    buyer_id: userId,
    address_type_id: 1,
  });

  const [loadingPincode, setLoadingPincode] = useState(false);
  const [isFormEnabled, setIsFormEnabled] = useState(false);
  const selectedAddress = useAppSelector(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (state) => state.address.selectedAddress as any
  );

  useEffect(() => {
    const addr = selectedAddress?.data;
    if (addr) {
      setFormData({
        name: addr.name || "",
        mobile: addr.mobile || "",
        address: addr.address || "",
        location: addr.location || "",
        pincode: addr.pincode || "",
        address_type_id: addr.address_type_id || 0,
        default_address: addr.default_address || 0,
      });
    }
  }, [selectedAddress]);

  useEffect(() => {
    if (locationDetails) {
      setFormData((prev) => ({
        ...prev,
        ...locationDetails,
      }));
    }
  }, [locationDetails]);

  // 🟢 Handle Input Change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    // ✅ Validation during typing
    if (name === "name") {
      if (!/^[A-Za-z ]*$/.test(value)) return; // only alphabets
      if (value.length > 25) {
        toast.error("Name 25 characters se zyada nahi ho sakta!");
        return;
      }
    }

    if (name === "mobile") {
      if (!/^[0-9]*$/.test(value)) return; // only numbers
      if (value.length > 10) {
        toast.error("Mobile number 10 digits ka hona chahiye!");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: name === "address_type_id" ? Number(value) : value,
    }));

    // Pincode logic
    if (name === "pincode") {
      if (value.length === 6) {
        fetchPincodeDetails(value);
      } else {
        setIsFormEnabled(false);
        setFormData((prev) => ({
          ...prev,
          city: "",
          state: "",
          country: "",
          location: "",
        }));
      }
    }
  };

  // 🟢 Fetch Pincode API
  const fetchPincodeDetails = async (pincode: string) => {
    try {
      setLoadingPincode(true);
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await res.json();

      if (data[0].Status === "Success" && data[0].PostOffice?.length > 0) {
        const post = data[0].PostOffice[0];
        setFormData((prev) => ({
          ...prev,
          city: post.District || "",
          state: post.State || "",
          country: post.Country || "India",
          location: `${post.Name}, ${post.District}, ${post.State}, ${post.Country}`,
        }));
        setIsFormEnabled(true);
        toast.success("Location fetched successfully!");
      } else {
        toast.error("Invalid pincode. Please try again.");
        setIsFormEnabled(false);
      }
    } catch (err) {
      console.error("Error fetching pincode:", err);
      toast.error("Error fetching pincode data.");
      setIsFormEnabled(false);
    } finally {
      setLoadingPincode(false);
    }
  };

  // 🟠 Warn if trying to focus without pincode
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!isFormEnabled && e.target.name !== "pincode") {
      e.target.blur();
      toast.error("Please enter a pin code first.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Final validation before submit
    if (!isFormEnabled) {
      toast.error("Please enter a pin code first.");
      return;
    }

    if (!formData.name || !/^[A-Za-z ]+$/.test(formData.name)) {
      toast.error("Name me sirf alphabets allowed hain!");
      return;
    }

    if (formData.name.length > 25) {
      toast.error("Name 25 characters se zyada nahi ho sakta!");
      return;
    }

    if (!formData.mobile || formData.mobile.length !== 10) {
      toast.error("Mobile number 10 digits ka hona chahiye!");
      return;
    }

    try {
      // ✅ Redux slice call
      const resultAction = await dispatch(
        addAddress(formData as Address)
      ).unwrap();

      toast.success("Address added successfully! 🎉");
      console.log("✅ API Response:", resultAction);
      // ✅ Parent ko batado data refresh kare
      onSubmit(resultAction);

      // ✅ Modal close karo
      onClose();

      // ✅ Form reset karo
      setFormData({
        id: 0,
        name: "",
        mobile: "",
        address: "",
        pincode: "",
        location: "",
        map: "",
        buyer_id: userId,
        address_type_id: 1,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("❌ Error:", error);
      toast.error(error || "Address save karte waqt error aaya!");
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      centered
      backdropClassName="custom-modal-backdrop"
      contentClassName="custom-modal-content"
    >
      <div className="p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-semibold mb-0">Add Address Details</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          ></button>
        </div>
        <hr color="black" />

        <form onSubmit={handleSubmit}>
          <p className="text-muted small mb-2">
            * Fields marked with an asterisk are required.
          </p>

          {/* Address Type */}
          <div className="mb-3">
            <div className="d-flex gap-4">
              {[
                { id: 1, label: "Home" },
                { id: 2, label: "Office" },
                { id: 3, label: "Other" },
              ].map((opt) => (
                <div className="form-check" key={opt.id}>
                  <input
                    type="radio"
                    className="form-check-input"
                    id={opt.label.toLowerCase()}
                    name="address_type_id"
                    value={opt.id}
                    checked={formData.address_type_id === opt.id}
                    onChange={handleChange}
                    //onFocus={handleFocus}
                    //disabled={!isFormEnabled}
                  />
                  <label
                    htmlFor={opt.label.toLowerCase()}
                    className="lbl1"
                    style={{ fontSize: "14px", fontWeight: "500" }}
                  >
                    {opt.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Pincode */}
          <div className="col-md-12">
            <div className="txt_col m-14">
              <span className="lbl1">*Pincode</span>
              <input
                type="text"
                name="pincode"
                className="form-control"
                style={{ fontSize: "14px", lineHeight: "2" }}
                value={formData.pincode}
                onChange={handleChange}
                required
                maxLength={6}
              />
              {loadingPincode && (
                <small className="text-info">Fetching location...</small>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="col-md-12">
            <div className="txt_col m-14">
              <span className="lbl1">
                *House Number, Floor, Building Name, Locality
              </span>
              <input
                type="text"
                name="address"
                className="form-control"
                style={{ fontSize: "14px", lineHeight: "2" }}
                value={formData.address}
                onChange={handleChange}
                required
                readOnly={!isFormEnabled}
                onFocus={handleFocus}
              />
            </div>
          </div>

          {/* Location (Editable After Pincode) */}
          <div className="col-md-12">
            <div className="txt_col m-14">
              <span className="lbl1">*Location</span>
              <input
                type="text"
                name="location"
                className="form-control"
                style={{ fontSize: "14px", lineHeight: "2" }}
                value={formData.location}
                onChange={handleChange}
                readOnly={!isFormEnabled}
                onFocus={handleFocus}
                required
              />
            </div>
          </div>

          {/* Name */}
          <div className="col-md-12">
            <div className="txt_col m-14">
              <span className="lbl1">*Recipient’s Name</span>
              <input
                type="text"
                name="name"
                className="form-control"
                style={{ fontSize: "14px", lineHeight: "2" }}
                value={formData.name}
                onChange={handleChange}
                required
                readOnly={!isFormEnabled}
                onFocus={handleFocus}
                maxLength={25}
              />
            </div>
          </div>

          {/* Mobile */}
          <div className="col-md-12">
            <div className="txt_col m-14">
              <span className="lbl1">*Mobile</span>
              <input
                type="text"
                name="mobile"
                className="form-control"
                style={{ fontSize: "14px", lineHeight: "2" }}
                value={formData.mobile}
                onChange={handleChange}
                required
                readOnly={!isFormEnabled}
                onFocus={handleFocus}
                maxLength={10}
              />
            </div>
          </div>

          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={!isFormEnabled}
          >
            Save Address
          </button>
        </form>
      </div>
    </Modal>
  );
}

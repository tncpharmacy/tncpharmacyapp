"use client";

import { useState } from "react";
import "../css/style.css";
import SideNav from "@/app/pharmacy/components/SideNav/page";
import Header from "@/app/pharmacy/components/Header/page";
import Input from "@/app/components/Input/Input";
import { useAppDispatch } from "@/lib/hooks";
import { changePassword } from "@/lib/features/changePasswordSlice/changePasswordSlice";
import { getUser } from "@/lib/auth/auth";
import toast from "react-hot-toast";
import PasswordInput from "@/app/components/Input/PasswordInput";

export default function ChangePassword() {
  const dispatch = useAppDispatch();

  const user = getUser();
  const userId = Number(user?.user_id ?? 0);
  const userTypeId = Number(user?.user_type ?? 0);

  const [formData, setFormData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await dispatch(
        changePassword({
          userId,
          userTypeId,
          data: {
            old_password: formData.old_password,
            new_password: formData.new_password,
            confirm_password: formData.confirm_password,
          },
        })
      ).unwrap(); // ← yahan se direct response milega

      // SUCCESS TOAST
      toast.success(res.message || "Password updated successfully!");
      // RESET FIELDS
      setFormData({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // ERROR TOAST
      toast.error(error?.message || "Something went wrong!");
    }
  };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              <i className="bi bi-shield-lock"></i> Change Password
            </div>

            <div className="main_content">
              <form onSubmit={handleSubmit} className="row g-3">
                <PasswordInput
                  label="Old Password"
                  name="old_password"
                  value={formData.old_password}
                  onChange={handleChange}
                  required
                />

                <PasswordInput
                  label="New Password"
                  name="new_password"
                  value={formData.new_password}
                  onChange={handleChange}
                  required
                />

                <PasswordInput
                  label="Confirm Password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  required
                />

                <div className="col-md-12">
                  <button type="submit" className="btn btn-primary">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

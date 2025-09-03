"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { addDoctor, removeDoctor } from "@/lib/features/doctor/doctorSlice";

export default function DoctorPage() {
  const dispatch = useAppDispatch();
  //  const doctors = useAppSelector((state) => state.doctor.list);

  return (
    <div>
      <h2>Doctor List</h2>
      <button
        onClick={() =>
          dispatch(
            addDoctor({
              id: Date.now(),
              doctorId: "D101",
              doctorName: "Dr. Pulkit",
              gender: "M",
              specialization: "Cardiologist",
              mobile: "9999999999",
              email: "drpulkit@test.com",
              experience: 5,
              status: 1,
            })
          )
        }
      >
        Add Doctor
      </button>

      <ul>
        {/* {doctors.map((doc) => (
          <li key={doc.id}>
            {doc.doctorName} ({doc.specialization})
            <button onClick={() => dispatch(removeDoctor(doc.id))}>
              Remove
            </button>
          </li>
        ))} */}
      </ul>
    </div>
  );
}

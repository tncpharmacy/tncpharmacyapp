"use client";
import PatientPrescription from "@/app/pharmacist/patient-prescriptions/PatienPrescriptionModal";
import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { getPrescriptionListPharmacistThunk } from "@/lib/features/pharmacistPrescriptionSlice/pharmacistPrescriptionSlice";

const NotificationBell = () => {
  const [showModal, setShowModal] = useState(false);
  const [animate, setAnimate] = useState(false);

  // useRef to hold the previous count reliably across component lifecycles
  const prevUnreadCountRef = useRef(0);
  // useRef to track if the component has mounted for the very first time (DOM load)
  const isInitialMount = useRef(true);

  const dispatch = useAppDispatch();
  const { list } = useAppSelector((state) => state.pharmacistPrescription);
  // ✅ Audio ref ko hata diya gaya hai - no sound
  // const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🧮 Unread count (Only those not handled)
  const unreadCount =
    list?.filter((item) => item.handle_by === null)?.length || 0;

  // 🔁 Fetch prescriptions on load
  useEffect(() => {
    dispatch(getPrescriptionListPharmacistThunk());
  }, [dispatch]);

  // 🔔 Play bell animation (no sound now)
  const startAnimation = () => {
    setAnimate(true);
    // Stop animation after 1 second
    setTimeout(() => setAnimate(false), 1000);
  };

  // 🔔 Bell Animation Logic (Fixed for Sidenav/Page Load)
  useEffect(() => {
    const currentCount = unreadCount;
    const previousCount = prevUnreadCountRef.current;
    const hasAnimatedInitial = sessionStorage.getItem("initialBellAnimated");

    // --- 1. COUNT INCREASE CHECK (Highest Priority) ---
    // Animation start karo agar count badha hai.
    if (currentCount > previousCount) {
      startAnimation();
    }

    // --- 2. INITIAL PAGE LOAD CHECK (Only on First Mount of the Session) ---
    // Yeh block sirf component ke pehle render par hi chalta hai.
    else if (isInitialMount.current) {
      // Agar pehli baar mount hua hai AND session mein animation abhi tak nahi chala hai
      if (currentCount > 0 && !hasAnimatedInitial) {
        startAnimation();
        // Flag set kardo taaki sidebar navigation par dobara na chale
        sessionStorage.setItem("initialBellAnimated", "true");
      }
    }

    // Hamesha component ke pehle mount ko false set kar do
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }

    // Hamesha current count ko ref mein update karo for the next comparison
    prevUnreadCountRef.current = currentCount;

    // Dependencies: unreadCount for count change trigger, list for initial data check
  }, [unreadCount, list]);

  // 🖱️ Manual open (No animation/sound on click)
  const handleOpenModal = () => {
    // ✅ click event par sirf modal open hoga, animation nahi.
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // Auto open modal once per session on page load (Existing logic)
  useEffect(() => {
    if (!list || list.length === 0) return; // wait for data

    const hasOpened = sessionStorage.getItem("prescriptionModalOpened");

    if (unreadCount > 0 && !hasOpened) {
      setShowModal(true);
      sessionStorage.setItem("prescriptionModalOpened", "true");
    }
  }, [unreadCount, list]);

  return (
    <>
      {/* CSS for shake animation */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
                    .shake-bell {
                        animation: shake 0.8s ease-in-out;
                    }
                    @keyframes shake {
                        0% { transform: rotate(0deg); }
                        25% { transform: rotate(-15deg); }
                        50% { transform: rotate(15deg); }
                        75% { transform: rotate(-10deg); }
                        100% { transform: rotate(0deg); }
                    }
                `,
        }}
      />

      <div
        style={{ position: "relative", cursor: "pointer", marginRight: "15px" }}
        onClick={handleOpenModal}
        className={animate ? "shake-bell" : ""}
      >
        <i className="bi bi-bell" style={{ fontSize: "26px" }}></i>

        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "-6px",
              right: "3px",
              backgroundColor: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 5px",
              fontSize: "10px",
              minWidth: "18px",
              textAlign: "center",
              lineHeight: "1",
            }}
          >
            {unreadCount}
          </span>
        )}
      </div>

      {/* ✅ Audio tag remove kar diya gaya hai */}

      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Patient Prescriptions</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <PatientPrescription onClose={handleCloseModal} />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default NotificationBell;

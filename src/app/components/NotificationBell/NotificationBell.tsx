"use client";
import PatientPrescription from "@/app/pharmacist/patient-prescriptions/PatienPrescriptionModal";
import React, { useState, useEffect, useRef } from "react";
import { Modal, Button } from "react-bootstrap";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { getPrescriptionListPharmacistThunk } from "@/lib/features/pharmacistPrescriptionSlice/pharmacistPrescriptionSlice";

const NotificationBell = () => {
  const [showModal, setShowModal] = useState(false);
  const [animate, setAnimate] = useState(false);
  const dispatch = useAppDispatch();
  const { list } = useAppSelector((state) => state.pharmacistPrescription);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // 🔁 Fetch prescriptions on load
  useEffect(() => {
    dispatch(getPrescriptionListPharmacistThunk());
  }, [dispatch]);

  // 🧮 Unread count
  const unreadCount =
    list?.filter((item) => item.handle_by === null)?.length || 0;

  // 🔔 Play bell
  const playBell = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    }
    setAnimate(true);
    setTimeout(() => setAnimate(false), 1000);
  };

  // 🖱️ Manual open
  const handleOpenModal = () => {
    playBell();
    setShowModal(true);
  };

  const handleCloseModal = () => setShowModal(false);

  // ✅ Auto open modal once per session on page load
  useEffect(() => {
    if (!list || list.length === 0) return; // wait for data

    const hasOpened = sessionStorage.getItem("prescriptionModalOpened");

    if (unreadCount > 0 && !hasOpened) {
      setShowModal(true);
      sessionStorage.setItem("prescriptionModalOpened", "true");
    }
    // 👇 only depend on count + list length, not full array
  }, [unreadCount, list, list?.length]);

  return (
    <>
      <div
        style={{ position: "relative", cursor: "pointer" }}
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
            }}
          >
            {unreadCount}
          </span>
        )}
      </div>

      <audio
        ref={audioRef}
        src="/notification-bell/notification-bel.mp3"
        preload="auto"
      />

      <Modal show={showModal} onHide={handleCloseModal} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Patient Prescriptions</Modal.Title>
        </Modal.Header>

        <Modal.Body style={{ maxHeight: "75vh", overflowY: "auto" }}>
          <PatientPrescription />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style jsx>{`
        .shake-bell {
          animation: shake 0.8s ease-in-out;
        }
        @keyframes shake {
          0% {
            transform: rotate(0deg);
          }
          25% {
            transform: rotate(-15deg);
          }
          50% {
            transform: rotate(15deg);
          }
          75% {
            transform: rotate(-10deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </>
  );
};

export default NotificationBell;

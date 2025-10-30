"use client";
import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import Input from "@/app/components/Input/InputColSm";

// ✅ Define type for Profile object
export interface Profile {
  name: string;
  mobile: string;
  email: string;
}

// ✅ Define props type
interface EditProfileModalProps {
  show: boolean;
  handleClose: () => void;
  profile: Profile;
  setProfile: React.Dispatch<React.SetStateAction<Profile>>;
  handleUpdate: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  show,
  handleClose,
  profile,
  setProfile,
  handleUpdate,
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <b>Update Profile</b>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Input
              label={"Patient Name"}
              type="text"
              name="name"
              value={profile.name}
              colSm={12}
              onChange={handleChange}
            />
            <Input
              label={"Mobile"}
              type="text"
              name="mobile"
              value={profile.mobile}
              colSm={12}
              onChange={handleChange}
            />
            <Input
              label={"Email"}
              type="email"
              name="email"
              value={profile.email}
              colSm={12}
              onChange={handleChange}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleUpdate}
          style={{
            background: "linear-gradient(135deg, #264b8c, #ff7b00)",
            border: "none",
          }}
        >
          Update
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditProfileModal;

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import DataTable, { TableColumn } from "react-data-table-component";
import SideNav from "../components/SideNav/page";
import Header from "../components/Header/page";
import { useRouter } from "next/navigation";

type Student = {
  id: number;
  studentId: string;
  studentName: string;
  gender: string;
  dob: string;
  mobile: string;
  email: string;
  bloodGroup: string;
  className: string;
  courseName: string;
  status: number;
};

export default function StudentList() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [pending, setPending] = useState(true);
  const [filterText, setFilterText] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const [selectedStudentStatus, setSelectedStudentStatus] = useState<
    number | null
  >(null);

  const fetchData = async () => {
    const res = await fetch(
      "https://acapi.heuristticminds.com/api/StudentList/Get-GetStudentListALL"
    );
    const data = await res.json();
    setStudents(data);
    setPending(false);
  };
  useEffect(() => {
    fetchData();
  }, []);

  const handleChangeStatus = async (id: number) => {
    try {
      const response = await fetch(
        `https://acapi.heuristticminds.com/api/StudentList/Update-ChangeStudentStatus?id=${id}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
          },
        }
      );

      // Use .text() if response is not JSON
      const result = await response.text();
      console.log("Server Response:", result);

      // Refresh list
      fetchData();
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.studentName.toLowerCase().includes(filterText.toLowerCase()) ||
      student.email.toLowerCase().includes(filterText.toLowerCase()) ||
      student.className.toLowerCase().includes(filterText.toLowerCase())
  );

  const handleStudentEdit = (id: number) => {
    router.push(`/admin/student-registration/${id}`);
  };

  const columns: TableColumn<Student>[] = [
    { name: "ID", selector: (row) => row.id, sortable: true, width: "80px" },
    {
      name: "Student Id",
      selector: (row) => row.studentId,
      sortable: true,
      width: "140px",
    },
    { name: "Name", selector: (row) => row.studentName, sortable: true },
    {
      name: "Gender",
      selector: (row) => row.gender,
      sortable: true,
      width: "100px",
    },
    {
      name: "DOB",
      selector: (row) => new Date(row.dob).toLocaleDateString("en-GB"),
      sortable: true,
    },
    { name: "Mobile", selector: (row) => row.mobile, sortable: true },
    { name: "Email", selector: (row) => row.email },
    {
      name: "Blood Group",
      selector: (row) => row.bloodGroup,
      sortable: true,
      width: "120px",
    },
    { name: "Class Name", selector: (row) => row.className, sortable: true },
    {
      name: "Course Name",
      selector: (row) => row.courseName,
      sortable: true,
      width: "220px",
    },
    {
      name: "Status",
      cell: (row) => (
        <span
          onClick={() => {
            setSelectedStudentId(row.id);
            setSelectedStudentStatus(row.status);
            setShowModal(true);
          }}
          className={`status ${
            row.status === 0 ? "status-deactive" : "status-active"
          } cursor-pointer`}
          title="Click to change status"
        >
          {row.status === 0 ? "Deactive" : "Active"}
        </span>
      ),
      width: "100px",
    },
    {
      name: "Action",
      cell: (row) => (
        <>
          <Button
            className="me-2"
            variant="primary"
            size="sm"
            onClick={() => handleStudentEdit(row.id)}
          >
            Edit
          </Button>
          <Button variant="primary" size="sm">
            View
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Header />
      <div className="row">
        <div className="col-sm-3">
          {" "}
          <SideNav />
        </div>
        <div className="col-sm-9">
          <h2>Student List</h2>
          <div className="container-fluid">
            <div className="row">
              <div className="col-sm-6">
                <input
                  type="text"
                  placeholder="Search by name, email, or class..."
                  className="mb-4 px-4 py-2 border rounded w-full max-w-md w-100"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                />
              </div>
              <div className="col-sm-6">
                <Link href={"/student-registration"}>Student Registration</Link>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-12">
              <DataTable
                columns={columns}
                data={filteredStudents}
                progressPending={pending}
                pagination
                highlightOnHover
                responsive
                striped
                persistTableHead
                // defaultSortFieldId={1}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Inside your return statement (after DataTable): */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Status Change</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to{" "}
          {selectedStudentStatus === 0 ? "active" : "deactive"}{" "}
          {"this student's status?"}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              if (selectedStudentId !== null) {
                await handleChangeStatus(selectedStudentId);
              }
              setShowModal(false);
            }}
          >
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

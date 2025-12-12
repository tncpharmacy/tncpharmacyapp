"use client";
import Link from "next/link";
import "../css/admin-style.css";
import Header from "../components/Header/page";
import SideNav from "../components/SideNav/page";
import { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";
ChartJS.register(
  CategoryScale,
  ArcElement,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function AdminDashboard() {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
        text: "Vertical Bar Chart Example",
      },
    },
  };

  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Order",
        data: [
          1500, 1800, 2000, 2280, 1890, 2390, 3490, 3000, 2000, 2780, 2890,
          3390,
        ],
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Return",
        data: [
          900, 1300, 1200, 1270, 580, 730, 340, 800, 900, 1270, 1180, 1230,
        ],
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
    ],
  };
  const data2 = {
    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
    datasets: [
      {
        label: "# of Votes",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <>
      <Header />
      <div className="body_wrap">
        <SideNav />
        <div className="body_right">
          <div className="body_content">
            <div className="pageTitle">
              Dashboard
              <span className="float-end">
                <i className="bi bi-calendar-week"></i> 02 Aug, 2025
              </span>
            </div>
            <div className="row">
              <div className="col-sm-6">
                <div className="cardsmall h-100">
                  <span className="l1 border-bottom pb-2 mb-2">
                    Sales Report
                  </span>
                  <Bar options={options} data={data} />
                </div>
              </div>

              <div className="col-sm-6">
                <div className="dashboardgrid">
                  <div className="cardsmall">
                    <span className="l1">
                      Total Sales <i className="bi bi-info-circle"></i>
                    </span>
                    <span className="l3">₹2,54,987.00</span>
                    <hr />
                    <a href="#" className="btn btn-primary btn-sm float-start">
                      View Now
                    </a>
                  </div>
                  <div className="cardsmall">
                    <span className="l1">
                      Total Order <i className="bi bi-info-circle"></i>
                    </span>
                    <span className="l3">3,244</span>
                    <hr />
                    <a href="#" className="btn btn-primary btn-sm float-start">
                      View Now
                    </a>
                  </div>
                  <div className="cardsmall">
                    <span className="l1">
                      Returns <i className="bi bi-info-circle"></i>
                    </span>
                    <span className="l3">51</span>
                    <hr />
                    <a href="#" className="btn btn-primary btn-sm float-start">
                      View Now
                    </a>
                  </div>
                  <div className="cardsmall">
                    <span className="l1">
                      Visitors <i className="bi bi-info-circle"></i>
                    </span>
                    <span className="l3">6,354</span>
                    <hr />
                    <a href="#" className="btn btn-primary btn-sm float-start">
                      View Now
                    </a>
                  </div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="cardsmall mt-3">
                  <span className="l1 border-bottom pb-2 mb-2">
                    Top Salling Medicine
                  </span>
                  <table className="table align-middle table-borderless table-centered table-nowrap mb-0">
                    <thead className="text-muted table-light">
                      <tr>
                        <th scope="col">Medicine Name</th>
                        <th scope="col">Sales</th>
                        <th scope="col">In Store</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{
                              width: "40px",
                              borderRadius: "50%",
                              marginRight: "10px",
                            }}
                          />
                          Medicine Name
                        </td>
                        <td>999</td>
                        <td>150</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{
                              width: "40px",
                              borderRadius: "50%",
                              marginRight: "10px",
                            }}
                          />
                          Medicine Name
                        </td>
                        <td>999</td>
                        <td>150</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{
                              width: "40px",
                              borderRadius: "50%",
                              marginRight: "10px",
                            }}
                          />
                          Medicine Name
                        </td>
                        <td>999</td>
                        <td>150</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{
                              width: "40px",
                              borderRadius: "50%",
                              marginRight: "10px",
                            }}
                          />
                          Medicine Name
                        </td>
                        <td>999</td>
                        <td>150</td>
                      </tr>
                      <tr>
                        <td>
                          <img
                            src="images/medicine-img.jpg"
                            alt=""
                            style={{
                              width: "40px",
                              borderRadius: "50%",
                              marginRight: "10px",
                            }}
                          />
                          Medicine Name
                        </td>
                        <td>999</td>
                        <td>150</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="cardsmall mt-3" style={{ height: "100%" }}>
                  <span className="l1 border-bottom pb-2 mb-2">
                    Top Salling Medicine
                  </span>
                  <div className="d-flex justify-content-center">
                    <div style={{ width: "280px", height: "280px" }}>
                      <Pie
                        data={data2}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false, // allows container to control size
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

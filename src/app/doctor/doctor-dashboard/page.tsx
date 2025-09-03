"use client";
import Link from "next/link";
import "../css/style.css";
import Header from "../components/Header/page";
import SideNav from "../components/SideNav/page";
import { useState } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function PharmacyDashboard() {
  const data = [
    {
      name: "January",
      Order: 1200,
      Success: 1000,
      Return: 200,
    },
    {
      name: "February",
      Order: 500,
      Success: 400,
      Return: 100,
    },
    {
      name: "March",
      Order: 1100,
      Success: 1000,
      Return: 200,
    },
    {
      name: "April",
      Order: 1200,
      Success: 1000,
      Return: 200,
    },
    {
      name: "May",
      Order: 1200,
      Success: 1000,
      Return: 200,
    },
    {
      name: "June",
      Order: 1200,
      Success: 1000,
      Return: 200,
    },
    {
      name: "July",
      Order: 1200,
      Success: 1000,
      Return: 200,
    },
    {
      name: "August",
      Order: 1200,
      Success: 1000,
      Return: 200,
    },
    {
      name: "September",
      Order: 1200,
      Success: 1000,
      Return: 200,
    },
    {
      name: "October",
      Order: 1200,
      Success: 1000,
      Return: 200,
    },
    {
      name: "November",
      Order: 1200,
      Success: 1000,
      Return: 200,
    },
    {
      name: "December",
      Order: 1200,
      Success: 1000,
      Return: 200,
    },
  ];
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
                    Patient Report
                  </span>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      width={500}
                      height={250}
                      data={data}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="Order"
                        fill="#8884d8"
                        activeBar={<Rectangle fill="pink" stroke="blue" />}
                      />
                      <Bar
                        dataKey="Success"
                        fill="#82ca9d"
                        activeBar={<Rectangle fill="gold" stroke="purple" />}
                      />
                      <Bar
                        dataKey="Return"
                        fill="#ff7289ff"
                        activeBar={<Rectangle fill="gold" stroke="purple" />}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="col-sm-6">
                <div className="dashboardgrid">
                  <div className="cardsmall">
                    <span className="l1">
                      Total Patient <i className="bi bi-info-circle"></i>
                    </span>
                    <span className="l3">₹2,54,987.00</span>
                    <hr />
                    <a href="#" className="btn btn-primary btn-sm float-start">
                      View Now
                    </a>
                  </div>
                  <div className="cardsmall">
                    <span className="l1">
                      Total Appointments <i className="bi bi-info-circle"></i>
                    </span>
                    <span className="l3">3,244</span>
                    <hr />
                    <a href="#" className="btn btn-primary btn-sm float-start">
                      View Now
                    </a>
                  </div>
                  <div className="cardsmall">
                    <span className="l1">
                      Today’s Appointments <i className="bi bi-info-circle"></i>
                    </span>
                    <span className="l3">60</span>
                    <hr />
                    <a href="#" className="btn btn-primary btn-sm float-start">
                      View Now
                    </a>
                  </div>
                  <div className="cardsmall">
                    <span className="l1">
                      Total Doctor <i className="bi bi-info-circle"></i>
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

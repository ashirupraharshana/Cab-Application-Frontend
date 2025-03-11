import React, { useState, useEffect } from "react";
import { Container, Alert, Table, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

function ViewEarningFromEachDriver() {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [driverEarnings, setDriverEarnings] = useState({});
  const [driverNames, setDriverNames] = useState({});

  useEffect(() => {
    fetch("http://localhost:8080/bookings/all")
      .then((response) => response.json())
      .then((data) => {
        const paidBookings = data.filter((booking) => booking.paymentstatus === 1);

        const total = paidBookings.reduce((sum, booking) => sum + (booking.totalfee || 0), 0);
        setTotalEarnings(total);

        const earningsByDriver = {};
        const driverIds = new Set();

        paidBookings.forEach((booking) => {
          if (booking.driverid) {
            earningsByDriver[booking.driverid] = (earningsByDriver[booking.driverid] || 0) + booking.totalfee;
            driverIds.add(booking.driverid);
          }
        });

        setDriverEarnings(earningsByDriver);
        fetchDriverDetails([...driverIds]);
      })
      .catch((error) => console.error("Error fetching bookings:", error));
  }, []);

  const fetchDriverDetails = (driverIds) => {
    if (driverIds.length === 0) return;

    fetch("http://localhost:8080/users/all")
      .then((response) => response.json())
      .then((drivers) => {
        const namesMap = {};
        drivers.forEach((driver) => {
          if (driverIds.includes(driver.id)) {
            namesMap[driver.id] = driver.username;
          }
        });
        setDriverNames(namesMap);
      })
      .catch((error) => console.error("Error fetching drivers:", error));
  };

  const earningsData = Object.keys(driverEarnings).map((driverId) => ({
    name: driverNames[driverId] || `Driver ID: ${driverId}`,
    earnings: driverEarnings[driverId],
  }));

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Admin</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/AdminDash">Manage Cars</Nav.Link>
              <Nav.Link as={Link} to="/AdminManageDrivers">Manage Drivers</Nav.Link>
              <Nav.Link as={Link} to="/AdminManageUsers">Manage Users</Nav.Link>
              <Nav.Link as={Link} to="/AdminViewBookings">Assign Drivers</Nav.Link>
              <Nav.Link as={Link} to="/AdminManageBookings">Manage Bookings</Nav.Link>
              <Nav.Link as={Link} to="/Earnings">View Earnings</Nav.Link>
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <h3 className="text-center mb-4">Earnings - Paid Bookings</h3>
        <Alert variant="success" className="text-center fw-bold">
          Total Earnings: ${totalEarnings.toFixed(2)}
        </Alert>

        <h4 className="text-center mt-4">Earnings Per Driver</h4>
        <Table striped bordered hover responsive className="mt-3">
          <thead className="table-dark">
            <tr>
              <th>Driver Name</th>
              <th>Total Earnings ($)</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(driverEarnings).length > 0 ? (
              Object.keys(driverEarnings).map((driverId) => (
                <tr key={driverId}>
                  <td>{driverNames[driverId] || `Driver ID: ${driverId}`}</td>
                  <td>${driverEarnings[driverId].toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center">No earnings available</td>
              </tr>
            )}
          </tbody>
        </Table>

        <h4 className="text-center mt-4">Earnings Bar Chart</h4>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={earningsData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
            <XAxis dataKey="name" angle={-10} textAnchor="end" interval={0} height={60} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="earnings" fill="#8884d8" barSize={50} />
          </BarChart>
        </ResponsiveContainer>
      </Container>
    </>
  );
}

export default ViewEarningFromEachDriver;

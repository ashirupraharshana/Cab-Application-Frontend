import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Card, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function DriverEarning() {
  const driverId = localStorage.getItem("userId");
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/bookings/all")
      .then((response) => response.json())
      .then((data) => {
        const completedBookings = data.filter(
          (booking) => String(booking.driverid) === driverId && booking.bookstatus === 2
        );
        setBookings(completedBookings);
      })
      .catch((error) => console.error("Error fetching bookings:", error));
  }, [driverId]);

  const totalEarning = bookings.reduce((sum, booking) => sum + (booking.totalfee || 0), 0);

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Driver Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/DriverDash">My Bookings</Nav.Link>
              <Nav.Link as={Link} to="/DriverConformedBookings">Confirmed Bookings</Nav.Link>
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <h3 className="text-center fw-bold my-4 text-primary">Driver Earnings</h3>
        <h5 className="text-center text-secondary mb-4" style={{ display: 'none' }}>
          Your Driver ID: <span className="fw-bold">{driverId || "Not Available"}</span>
        </h5>

        <Card className="mb-4 text-center p-4 shadow-lg bg-success text-white rounded-4">
          <h4 className="display-6">Total Earnings: <strong>${totalEarning.toFixed(2)}</strong></h4>
          <h5 className="mt-2">Your Share (10%): <strong>${(totalEarning * 0.10).toFixed(2)}</strong></h5>
        </Card>

        {bookings.length > 0 ? (
          <Row className="g-4">
            {bookings.map((booking) => (
              <Col key={booking.id} md={6} lg={4}>
                <Card className="shadow-sm rounded-3 border-0">
                  <Card.Body>
                    <Card.Title className="text-primary fw-bold">Booking ID: {booking.id}</Card.Title>
                    <Card.Text className="text-muted small">
                      <strong>User ID:</strong> {booking.userid} <br />
                      <strong>Car ID:</strong> {booking.carid} <br />
                      <strong>Location:</strong> {booking.location} <br />
                      <strong>Time:</strong> {booking.time} <br />
                      <strong>Total Fee:</strong> <span className="fw-bold text-success">${booking.totalfee.toFixed(2)}</span> <br />
                      <strong>Payment Status:</strong>
                      <span className={`fw-bold ms-2 ${booking.paymentstatus === 1 ? "text-success" : "text-danger"}`}>
                        {booking.paymentstatus === 1 ? "Paid" : "Pending"}
                      </span>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <p className="text-center text-muted mt-4">No earnings to display</p>
        )}
      </Container>
    </>
  );
}

export default DriverEarning;

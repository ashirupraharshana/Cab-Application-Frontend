import React, { useState, useEffect } from "react";
import { Card, Container, ListGroup, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

function UserViewNotPaidBookings() {
  const userId = localStorage.getItem("userId"); // Logged-in user ID
  const [bookings, setBookings] = useState([]);

  // Fetch bookings data
  useEffect(() => {
    fetch("http://localhost:8080/bookings/all")
      .then((response) => response.json())
      .then((data) => {
        const unpaidBookings = data.filter(
          (booking) => String(booking.userid) === userId && booking.paymentstatus === 0
        );
        setBookings(unpaidBookings);
      })
      .catch((error) => console.error("Error fetching bookings:", error));
  }, []);

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">User Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/UserBookCar">Book A Car</Nav.Link>
              <Nav.Link as={Link} to="/ViewMyBookings">View Bookings</Nav.Link>
              <Nav.Link as={Link} to="/BookingInProgress">Bookings in Progress</Nav.Link>
              
              <Nav.Link as={Link} to="/UserViewNotPaidBookings">No Paid Bookings</Nav.Link>
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
        <span className="text-light me-3 d-none">Logged in as: <strong>(ID: {userId})</strong></span>
      </Navbar>

      <Container className="mt-4">
        <h4 className="text-center mb-4">Unpaid Bookings</h4>
        {bookings.length > 0 ? (
          <ListGroup>
            {bookings.map((booking) => (
              <ListGroup.Item key={booking.id} className="mb-3">
                <Card className="d-flex flex-row align-items-center">
                  {/* Booking Details */}
                  <Card.Body>
                    <Card.Title>Booking ID: {booking.id}</Card.Title>
                    <Card.Text>
                      <strong>Car ID:</strong> {booking.carid} <br />
                      <strong>Location:</strong> {booking.location} <br />
                      <strong>Time:</strong> {booking.time} <br />
                      <strong>Distance:</strong> {booking.travelDistance > 0 ? `${booking.travelDistance} km` : "Not Complete"} <br />
                      <strong>Total Fee:</strong> ${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"} <br />
                      <strong>Payment Status:</strong> <span className="text-danger">Unpaid</span>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-center">No unpaid bookings found.</p>
        )}
      </Container>
    </>
  );
}

export default UserViewNotPaidBookings;

import React, { useEffect, useState } from "react";
import { Card, ListGroup, Container, Row, Col } from "react-bootstrap";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

function UserBookingHistory() {
  // Retrieve logged-in user ID from localStorage
  const userId = localStorage.getItem("userId");
  const [bookings, setBookings] = useState([]);
  const [carImages, setCarImages] = useState({}); // Store car images

  // Fetch bookings for logged-in user
  useEffect(() => {
    fetch("http://localhost:8080/bookings/all")
      .then((response) => response.json())
      .then((data) => {
        // Filter bookings for the logged-in user
        const userBookings = data.filter((booking) => String(booking.userid) === userId);
        setBookings(userBookings);

        // Fetch car images for each booking
        userBookings.forEach((booking) => fetchCarImage(booking.carid));
      })
      .catch((error) => console.error("Error fetching bookings:", error));
  }, [userId]);

  // Fetch car image by car ID
  const fetchCarImage = (carId) => {
    fetch(`http://localhost:8080/cars/${carId}`)
      .then((response) => response.json())
      .then((carData) => {
        setCarImages((prevImages) => ({
          ...prevImages,
          [carId]: carData.photo.startsWith("data:image")
            ? carData.photo
            : `data:image/jpeg;base64,${carData.photo}`,
        }));
      })
      .catch((error) => console.error("Error fetching car image:", error));
  };

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
            <Nav.Link as={Link} to="/UserBookingHistory">Booking History</Nav.Link>
            <Nav.Link as={Link} to="/UserViewNotPaidBookings">Not Paid Bookings</Nav.Link>
            <Nav.Link as={Link} to="/">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
      <span className="text-light me-3 d-none">Logged in as: <strong>(ID: {userId})</strong></span>
    </Navbar>
    
    <Container>
      <h2 className="text-center my-4">User Booking History</h2>
      <p className="text-center">Logged-in User ID: <strong>{userId || "Not Available"}</strong></p>

      {bookings.length > 0 ? (
        <Row>
          {bookings.map((booking) => (
            <Col key={booking.id} md={4} className="mb-4">
              <Card>
                {/* Car Image */}
                {carImages[booking.carid] && (
                  <Card.Img
                    variant="top"
                    src={carImages[booking.carid]}
                    alt={`Car ${booking.carid}`}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                )}

                <Card.Body>
                  <Card.Title>Booking ID: {booking.id}</Card.Title>
                  <Card.Text>
                    <strong>Car ID:</strong> {booking.carid} <br />
                    <strong>Driver:</strong> {booking.driverid ? `ID: ${booking.driverid}` : "Not Assigned"} <br />
                    <strong>Location:</strong> {booking.location} <br />
                    <strong>Time:</strong> {booking.time} <br />
                    <strong>Status:</strong>{" "}
                    <span className={booking.bookstatus === 0 ? "text-warning" : "text-success"}>
                      {booking.bookstatus === 0 ? "Pending" : "Confirmed"}
                    </span>
                    <br />
                    <strong>Total Fee:</strong> ${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"} <br />
                    <strong>Payment Status:</strong>{" "}
                    <span className={booking.paymentstatus === 0 ? "text-danger" : "text-success"}>
                      {booking.paymentstatus === 0 ? "Unpaid" : "Paid"}
                    </span>
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <p className="text-center mt-4">No bookings found for your account.</p>
      )}
    </Container>
    </>
  );
}

export default UserBookingHistory;

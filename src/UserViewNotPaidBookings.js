import React, { useState, useEffect } from "react";
import { Card, Container, ListGroup, Navbar, Nav, Button, Image, Modal, Form, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function UserViewNotPaidBookings() {
  const userId = localStorage.getItem("userId"); // Logged-in user ID
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState({}); // Store car details
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  // Fetch bookings data
  useEffect(() => {
    fetch("http://localhost:8080/bookings/all")
      .then((response) => response.json())
      .then((data) => {
        const unpaidBookings = data.filter(
          (booking) => String(booking.userid) === userId && booking.paymentstatus === 0
        );
        setBookings(unpaidBookings);
        fetchCarDetails(unpaidBookings);
      })
      .catch((error) => console.error("Error fetching bookings:", error));
  }, []);

  // Fetch car details based on car IDs
  const fetchCarDetails = async (bookings) => {
    const carIds = [...new Set(bookings.map((b) => b.carid))];
    const carData = {};

    await Promise.all(
      carIds.map(async (carId) => {
        try {
          const response = await fetch(`http://localhost:8080/cars/${carId}`);
          const car = await response.json();
          carData[carId] = {
            name: car.model,
            photo: car.photo,
          };
        } catch (error) {
          console.error(`Error fetching car ${carId}:`, error);
          carData[carId] = { name: "Unknown Car", photo: "" };
        }
      })
    );

    setCars(carData);
  };

  // Open Payment Modal
  const handleShowModal = (booking) => {
    setSelectedBooking(booking);
    setPaymentDetails({
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    });
    setShowModal(true);
  };

  // Close Payment Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  // Handle input change
  const handleInputChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  // Handle Payment Processing
  const handlePayment = async () => {
    if (!selectedBooking) return;

    // Simple validation
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
      alert("Please fill in all payment details.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/bookings/update/${selectedBooking.id}/paymentstatus`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Payment update failed");
      }

      // Update UI after payment
      setBookings((prev) => prev.filter((booking) => booking.id !== selectedBooking.id));
      alert("Payment successful!");
      handleCloseModal();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Try again.");
    }
  };

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Mega City Cab</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/UserBookCar">Book A Car</Nav.Link>
              <Nav.Link as={Link} to="/ViewMyBookings">View Bookings</Nav.Link>
              <Nav.Link as={Link} to="/BookingInProgress">Bookings in Progress</Nav.Link>
              <Nav.Link as={Link} to="/UserViewNotPaidBookings">Not Paid Bookings</Nav.Link>
              <Nav.Link as={Link} to="/AboutUs">About us</Nav.Link>
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
  <h4 className="text-center mb-4">Unpaid Bookings</h4>

  {bookings.length > 0 ? (
    bookings.map((booking) => (
      <Card key={booking.id} className="mb-4 shadow-lg border-0" style={{ background: "#f8f9fa" }}>
        <Card.Body className="p-4">
          <Row className="align-items-center">

            {/* Car Photo */}
            <Col md={4} className="text-center">
              {cars[booking.carid]?.photo ? (
                <img
                  src={cars[booking.carid].photo.startsWith("data:image")
                    ? cars[booking.carid].photo
                    : `data:image/jpeg;base64,${cars[booking.carid].photo}`}
                  alt={cars[booking.carid]?.name || "Car Image"}
                  className="img-fluid rounded shadow-sm"
                  style={{ maxWidth: "100%", height: "180px", objectFit: "cover" }}
                />
              ) : (
                <p className="text-muted">No photo available</p>
              )}
            </Col>

            {/* Booking Details */}
            <Col md={5}>
              <Card.Title className="text-primary fw-bold mb-3">Booking ID: {booking.id}</Card.Title>
              <Card.Text>
                <strong className="text-secondary">Car:</strong> {cars[booking.carid]?.name || "Unknown Car"} <br />
                <strong className="text-secondary">Location:</strong> {booking.location} <br />
                <strong className="text-secondary">Time:</strong> {booking.time} <br />
                <strong className="text-secondary">Distance:</strong> {booking.travelDistance > 0 ? `${booking.travelDistance} km` : "Not Complete"} <br />
                <strong className="text-secondary">Total Fee:</strong>{" "}
                <span className="fw-bold">${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"}</span> <br />
                <strong className="text-secondary">Payment Status:</strong> <span className="text-danger fw-bold">Unpaid</span>
              </Card.Text>
            </Col>

            {/* Pay Button */}
            <Col md={3} className="text-center d-flex flex-column gap-2">
            <Button
  variant="success"
  className="fw-bold px-4 py-2"
  onClick={() => handleShowModal(booking)}
  disabled={booking.travelDistance === 0} // Disable if distance is 0
>
  Pay Now
</Button>

            </Col>
          </Row>
        </Card.Body>
      </Card>
    ))
  ) : (
    <p className="text-center text-muted">No unpaid bookings found.</p>
  )}
</Container>


      {/* Payment Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Payment Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <Form>
              <Form.Group>
                <Form.Label>Card Number</Form.Label>
                <Form.Control type="text" name="cardNumber" value={paymentDetails.cardNumber} onChange={handleInputChange} placeholder="Enter card number" />
              </Form.Group>
              <Form.Group className="mt-2">
                <Form.Label>Expiry Date</Form.Label>
                <Form.Control type="text" name="expiryDate" value={paymentDetails.expiryDate} onChange={handleInputChange} placeholder="MM/YY" />
              </Form.Group>
              <Form.Group className="mt-2">
                <Form.Label>CVV</Form.Label>
                <Form.Control type="text" name="cvv" value={paymentDetails.cvv} onChange={handleInputChange} placeholder="Enter CVV" />
              </Form.Group>
              <p className="mt-3"><strong>Total Fee:</strong> ${selectedBooking.totalfee.toFixed(2)}</p>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
          <Button variant="success" onClick={handlePayment}>Pay Now</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default UserViewNotPaidBookings;

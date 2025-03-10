import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, ListGroup, Card, Button, Modal, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

function DriverDash() {
  const userId = localStorage.getItem("userId"); // Logged-in driver ID
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cars, setCars] = useState({});
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    amount: 0
  });

  // Fetch all bookings
  useEffect(() => {
    fetch("http://localhost:8080/bookings/all")
      .then((response) => response.json())
      .then((data) => setBookings(data))
      .catch((error) => console.error("Error fetching bookings:", error));
  }, []);

  // Filter bookings where logged-in user ID matches booking.userid, bookstatus is 1 (Confirmed), and paymentstatus is 0 (Unpaid)
  const filteredBookings = bookings.filter(
    (booking) => String(booking.userid) === userId && booking.bookstatus === 1 && booking.paymentstatus === 0
  );

  // Open Payment Modal
  const handleShowModal = (booking) => {
    setSelectedBooking(booking);
    setPaymentDetails({ ...paymentDetails, amount: booking.totalfee });
    setShowModal(true);
  };

  // Close Payment Modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails({ ...paymentDetails, [name]: value });
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
  
    if (!selectedBooking) {
      alert("No booking selected for payment.");
      return;
    }
  
    try {
      console.log("Processing payment for:", selectedBooking.id, paymentDetails);
  
      // TODO: Integrate real payment gateway here
  
      // Simulating successful payment
      alert("Payment Successful!");
  
      // Make API request to update payment status
      const response = await fetch(`http://localhost:8080/bookings/update/${selectedBooking.id}/paymentstatus`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) {
        throw new Error("Failed to update payment status.");
      }
  
      // Update UI: Set payment status to 1 (Paid)
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === selectedBooking.id ? { ...booking, paymentstatus: 1 } : booking
        )
      );
  
      handleCloseModal();
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Payment failed. Please try again.");
    }
  };

  useEffect(() => {
    const fetchCarDetails = async () => {
      const carData = {};
      await Promise.all(
        bookings.map(async (booking) => {
          if (!carData[booking.carid]) {
            try {
              const response = await fetch(`http://localhost:8080/cars/${booking.carid}`);
              if (response.ok) {
                const carInfo = await response.json();
                carData[booking.carid] = carInfo;
              }
            } catch (error) {
              console.error(`Error fetching car details for car ID ${booking.carid}:`, error);
            }
          }
        })
      );
      setCars(carData);
    };
  
    if (bookings.length > 0) {
      fetchCarDetails();
    }
  }, [bookings]);
  
  
  return (
    <>
    {/* Navbar */}
<Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
  <div className="container">
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
  </div>
</Navbar>

      {/* Dashboard Content */}
      <Container>
        <h4 className="text-center mb-4">Your Driver ID: {userId || "Not Available"}</h4>

        {filteredBookings.length > 0 ? (
          <ListGroup>
            {filteredBookings.map((booking) => (
              <ListGroup.Item key={booking.id} className="mb-3">
             <Card className="d-flex flex-row align-items-center">
  {/* Car Photo (Left Side) */}
  {cars[booking.carid] && cars[booking.carid].photo ? (
    <div className="flex-shrink-0">
      <img
        src={
          cars[booking.carid].photo.startsWith("http") || cars[booking.carid].photo.startsWith("data:image")
            ? cars[booking.carid].photo
            : `data:image/jpeg;base64,${cars[booking.carid].photo}`
        }
        alt={cars[booking.carid].model}
        className="img-fluid rounded-start"
        style={{ width: "150px", height: "150px", objectFit: "cover" }}
      />
    </div>
  ) : (
    <div
      className="d-flex align-items-center justify-content-center bg-light"
      style={{ width: "150px", height: "150px", color: "#888" }}
    >
      No Image Available
    </div>
  )}

  {/* Booking Details (Right Side) */}
  <Card.Body>
    <Card.Title>Booking ID: {booking.id}</Card.Title>
    <Card.Subtitle className="mb-2 text-muted">User ID: {booking.userid}</Card.Subtitle>
    <Card.Text>
      <strong>Car ID:</strong> {booking.carid} <br />
      <strong>Location:</strong> {booking.location} <br />
      <strong>Time:</strong> {booking.time} <br />
      <strong>Distance:</strong> {booking.travelDistance > 0 ? `${booking.travelDistance} km` : "Not Complete"} <br />
      <strong>Total Fee:</strong> ${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"} <br />
      <strong>Payment Status:</strong> <span className="text-danger">Unpaid</span>
    </Card.Text>

    {/* Pay Online Button - Positioned at bottom right */}
    <div className="d-flex justify-content-end">
      <Button variant="success" onClick={() => handleShowModal(booking)}>
        Pay Online
      </Button>
    </div>
  </Card.Body>
</Card>

              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-center mt-4">No confirmed bookings assigned to you.</p>
        )}
      </Container>

      {/* Payment Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pay Online</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePaymentSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Card Number</Form.Label>
              <Form.Control
                type="text"
                name="cardNumber"
                placeholder="Enter card number"
                value={paymentDetails.cardNumber}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Expiry Date</Form.Label>
              <Form.Control
                type="text"
                name="expiryDate"
                placeholder="MM/YY"
                value={paymentDetails.expiryDate}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>CVV</Form.Label>
              <Form.Control
                type="password"
                name="cvv"
                placeholder="CVV"
                value={paymentDetails.cvv}
                onChange={handleInputChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                name="amount"
                value={paymentDetails.amount}
                readOnly
              />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={handleCloseModal} className="me-2">
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Pay Now
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default DriverDash;

import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, ListGroup, Card, Button, Modal, Form, Row, Col } from "react-bootstrap";
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
    (booking) => String(booking.userid) === userId && booking.paymentstatus === 0
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
      const carIds = [...new Set(bookings.map((b) => b.carid))]; // Unique car IDs
      const carData = {};
  
      await Promise.all(
        carIds.map(async (carid) => {
          try {
            const response = await fetch(`http://localhost:8080/cars/${carid}`);
            if (response.ok) {
              const carInfo = await response.json();
              carData[carid] = carInfo;
            }
          } catch (error) {
            console.error(`Error fetching car details for Car ID ${carid}:`, error);
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
  </div>
</Navbar>

      {/* Dashboard Content */}
      <Container>
        <h4 className="text-center mb-4">Your Driver ID: {userId || "Not Available"}</h4>

        {filteredBookings.length > 0 ? (
    filteredBookings.map((booking) => (
      <Card key={booking.id} className="mb-4 shadow-lg border-0" style={{ background: "#f8f9fa" }}>
        <Card.Body className="p-4">
          <Row className="align-items-center">
            {/* Car Photo */}
            <Col md={4} className="text-center">
              {cars[booking.carid]?.photo ? (
                <img
                  src={cars[booking.carid].photo.startsWith("data:image") ? cars[booking.carid].photo : `data:image/jpeg;base64,${cars[booking.carid].photo}`}
                  alt={`Car ${cars[booking.carid]?.model}`}
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
                <strong className="text-secondary">User ID:</strong> {booking.userid} <br />
                <strong className="text-secondary">Car Name:</strong> {cars[booking.carid]?.model || "N/A"} <br />
                <strong className="text-secondary">Location:</strong> {booking.location} <br />
                <strong className="text-secondary">Time:</strong> {booking.time} <br />
                <strong className="text-secondary">Status:</strong>{" "}
                <span
  className="fw-bold"
  style={{
    color:
      booking.bookstatus === 1
        ? "blue"
        : booking.bookstatus === 2
        ? "green"
        : booking.bookstatus === 3
        ? "red"
        : "orange",
  }}
>
  {["Pending", "In Progress", "Complete", "Cancelled"][booking.bookstatus] || "Unknown"}
</span>


                <br />
                <strong className="text-secondary">Total Fee:</strong>{" "}
                <span className="fw-bold">${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"}</span> <br />
                <strong className="text-secondary">Payment Status:</strong>{" "}
                <span className={`fw-bold ${booking.paymentstatus === 0 ? "text-danger" : "text-success"}`}>
                  {booking.paymentstatus === 0 ? "Payment Pending" : "Paid"}
                </span>
              </Card.Text>
            </Col>

            {/* Buttons */}
            <Col md={3} className="text-center d-flex flex-column gap-2">
            <Button
  variant="success"
  className="fw-bold px-4 py-2"
  onClick={() => handleShowModal(booking)}
  disabled={booking.bookstatus !== 2} // Only enabled when bookstatus is 2 (Complete)
>
  Pay Online
</Button>



            </Col>
          </Row>
        </Card.Body>
      </Card>
    ))
  ) : (
    <p className="text-center mt-4 text-muted">No confirmed bookings assigned to you.</p>
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

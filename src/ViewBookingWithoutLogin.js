import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Form, Button, Alert, Card, Row, Col } from "react-bootstrap";
import { Modal } from "react-bootstrap";

const ViewBookingWithoutLogin = () => {
  const [idNumber, setIdNumber] = useState("");
  const [bookings, setBookings] = useState([]); // Store multiple bookings
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState({});
  const [cars, setCars] = useState({});
  const [showModal, setShowModal] = useState(false);
const [selectedBooking, setSelectedBooking] = useState(null);
const [paymentDetails, setPaymentDetails] = useState({
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  amount: 0
});

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setBookings([]); // Clear previous results
    setLoading(true); // Set loading to true when the request starts

    if (!idNumber) {
      setError("Please enter an ID number.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/bookings/idNumber/${idNumber}`);
      if (!response.ok) throw new Error("No bookings found for this ID Number");

      const data = await response.json();

      // Filter only unpaid bookings
      const unpaidBookings = data.filter((booking) => booking.paymentstatus === 0);
      setBookings(unpaidBookings);

      if (unpaidBookings.length === 0) {
        setError("No unpaid bookings found for this ID Number.");
      } else {
        fetchDrivers(unpaidBookings);
        fetchCars(unpaidBookings);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  // Fetch driver details using driverid
  const fetchDrivers = async (bookings) => {
    const driverIds = [...new Set(bookings.map((booking) => booking.driverid))];
    const driverData = {};
    await Promise.all(
      driverIds.map(async (driverId) => {
        if (driverId !== "-1") {
          try {
            const response = await fetch(`http://localhost:8080/drivers/${driverId}`);
            const driver = await response.json();
            driverData[driverId] = driver.name;
          } catch (error) {
            console.error(`Error fetching driver ${driverId}:`, error);
            driverData[driverId] = "Unknown Driver";
          }
        } else {
          driverData[driverId] = "Driver Not Assigned";
        }
      })
    );
    setDrivers(driverData);
  };

  // Fetch car details using carid
  const fetchCars = async (bookings) => {
    const carIds = [...new Set(bookings.map((booking) => booking.carid))];
    const carData = {};
    await Promise.all(
      carIds.map(async (carId) => {
        try {
          const response = await fetch(`http://localhost:8080/cars/${carId}`);
          const car = await response.json();
          carData[carId] = { name: car.model, photo: car.photo };
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
  setPaymentDetails({ ...paymentDetails, amount: booking.totalfee });
  setShowModal(true);
};

// Close Payment Modal
const handleCloseModal = () => {
  setShowModal(false);
  setSelectedBooking(null);
};

// Handle Input Changes
const handleInputChange = (e) => {
  const { name, value } = e.target;
  setPaymentDetails({ ...paymentDetails, [name]: value });
};

// Handle Payment
const handlePaymentSubmit = async (e) => {
  e.preventDefault();

  if (!selectedBooking) {
    alert("No booking selected for payment.");
    return;
  }

  try {
    console.log("Processing payment for:", selectedBooking.id, paymentDetails);

    // Simulating a successful payment
    alert("Payment Successful!");

    // Update payment status in backend
    const response = await fetch(
      `http://localhost:8080/bookings/update/${selectedBooking.id}/paymentstatus`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" }
      }
    );

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

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">User Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/BookACarImmediately">Book a Car</Nav.Link>
              <Nav.Link as={Link} to="/ViewBookingWithoutLogin">View Bookings</Nav.Link>
              <Nav.Link as={Link} to="/ViewBookingAllWithoutLogin">Pay for Bookings</Nav.Link>
              <Nav.Link as={Link} to="/">Login</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>

        {/* Form to get ID number */}
        <Form onSubmit={handleSearch} className="mb-4">
          <Form.Group controlId="idNumber">
            <Form.Label>Enter ID Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your ID number"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit" className="mt-2">
            {loading ? "Loading..." : "Search"}
          </Button>
        </Form>

        {/* Display error message if any */}
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Display bookings in gallery view */}
        {bookings.length > 0 && (
         <Row className="justify-content-center">
         {bookings.map((booking) => (
           <Col md={6} lg={4} key={booking.id} className="mb-4">
             <Card className="shadow-sm border-0 rounded">
               <Card.Img
                 variant="top"
                 src={
                   cars[booking.carid]?.photo?.startsWith("data:image")
                     ? cars[booking.carid].photo
                     : `data:image/jpeg;base64,${cars[booking.carid]?.photo || ""}`
                 }
                 alt={cars[booking.carid]?.name || "Car Image"}
                 style={{ height: "220px", objectFit: "cover", borderRadius: "8px 8px 0 0" }}
               />
               <Card.Body className="d-flex flex-column">
                 <Card.Title className="fw-bold text-center">{cars[booking.carid]?.name || "Unknown Car"}</Card.Title>
                 <Card.Text className="text-muted small">
                   <strong>Driver:</strong> {drivers[booking.driverid] || "Loading..."} <br />
                   <strong>Location:</strong> {booking.location} <br />
                   <strong>Time:</strong> {booking.time} <br />
                   <strong>Status:</strong> 
                   <span className={`badge ${booking.bookstatus === 0 ? "bg-warning text-dark" : "bg-success"}`}>
                     {booking.bookstatus === 0 ? "Pending" : "Confirmed"}
                   </span> <br />
                   <strong>Payment:</strong> 
                   <span className={`badge ${booking.paymentstatus === 0 ? "bg-danger" : "bg-success"}`}>
                     {booking.paymentstatus === 0 ? "Unpaid" : "Paid"}
                   </span> <br />
                   <strong>Total Fee:</strong> <span className="text-primary fw-bold">${booking.totalfee}</span>
                 </Card.Text>
                 <div className="mt-auto text-center">
                   {booking.paymentstatus === 0 && (
                     <Button variant="success" onClick={() => handleShowModal(booking)} className="w-100">
                       Pay Now
                     </Button>
                   )}
                 </div>
               </Card.Body>
             </Card>
           </Col>
         ))}
       </Row>
       
        )}

        {/* If no bookings found */}
        {bookings.length === 0 && error && (
          <Alert variant="info">No bookings found for this ID Number.</Alert>
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
};

export default ViewBookingWithoutLogin;

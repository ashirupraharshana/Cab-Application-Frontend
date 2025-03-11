import React, { useState, useEffect } from "react";
import { Card, Container, ListGroup, Navbar, Nav, Button, Image, Modal, Form } from "react-bootstrap";
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
          <Navbar.Brand as={Link} to="/">User Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/UserBookCar">Book A Car</Nav.Link>
              <Nav.Link as={Link} to="/ViewMyBookings">View Bookings</Nav.Link>
              <Nav.Link as={Link} to="/BookingInProgress">Bookings in Progress</Nav.Link>
              <Nav.Link as={Link} to="/UserViewNotPaidBookings">No Paid Bookings</Nav.Link>
              <Nav.Link as={Link} to="/AboutUs">About us</Nav.Link>
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <h4 className="text-center mb-4">Unpaid Bookings</h4>
        {bookings.length > 0 ? (
          <ListGroup>
            {bookings.map((booking) => (
              <ListGroup.Item key={booking.id} className="mb-3">
                <Card className="d-flex flex-row align-items-center">
                  {/* Car Image */}
                  <Image
                    src={
                      cars[booking.carid]?.photo?.startsWith("data:image")
                        ? cars[booking.carid].photo
                        : `data:image/jpeg;base64,${cars[booking.carid]?.photo || ""}`
                    }
                    alt={cars[booking.carid]?.name || "Car Image"}
                    style={{
                      width: "150px",
                      height: "100px",
                      objectFit: "cover",
                      marginRight: "20px",
                      borderRadius: "8px",
                    }}
                  />

                  {/* Booking Details */}
                  <Card.Body>
                    <Card.Title>Booking ID: {booking.id}</Card.Title>
                    <Card.Text>
                      <strong>Car:</strong> {cars[booking.carid]?.name || "Unknown Car"} <br />
                      <strong>Location:</strong> {booking.location} <br />
                      <strong>Time:</strong> {booking.time} <br />
                      <strong>Distance:</strong> {booking.travelDistance > 0 ? `${booking.travelDistance} km` : "Not Complete"} <br />
                      <strong>Total Fee:</strong> ${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"} <br />
                      <strong>Payment Status:</strong> <span className="text-danger">Unpaid</span>
                    </Card.Text>
                  </Card.Body>

                  {/* Pay Button */}
                  <Button variant="success" onClick={() => handleShowModal(booking)} className="m-3">
                    Pay Now
                  </Button>
                </Card>
              </ListGroup.Item>
            ))}
          </ListGroup>
        ) : (
          <p className="text-center">No unpaid bookings found.</p>
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

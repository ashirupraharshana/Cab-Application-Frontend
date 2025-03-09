import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Row, Col, Card, Button, Modal, Form } from "react-bootstrap";

function UserBookCar() {
  const [cars, setCars] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [bookingData, setBookingData] = useState({
    idNumber: "",
    location: "",
    time: "",
  });

  // Fetch car details
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch("http://localhost:8080/cars/all");
        const data = await response.json();
        setCars(data);
      } catch (error) {
        console.error("Error fetching car details:", error);
      }
    };

    fetchCars();
  }, []);

  // Open modal with selected car ID
  const handleBookNow = (carId) => {
    setSelectedCarId(carId);
    setShowModal(true);
  };

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCarId) {
      alert("Error: No car selected!");
      return;
    }

    const bookingRequest = {
      userid: "-1", // Set userId to -1 as requested
      carid: selectedCarId,
      idNumber: bookingData.idNumber, // Include idNumber
      location: bookingData.location,
      time: bookingData.time,
      bookstatus: 0,
      paymentstatus: 0,
      totalfee: 0,
    };

    try {
      const response = await fetch("http://localhost:8080/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingRequest),
      });

      if (!response.ok) throw new Error("Booking failed");

      alert("Booking successful!");
      setShowModal(false);
      setBookingData({ idNumber: "", location: "", time: "" });
    } catch (error) {
      console.error("Error booking car:", error);
      alert("Booking failed. Try again.");
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
              <Nav.Link as={Link} to="/UserBookingHistory">Booking History</Nav.Link>
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <h2 className="text-center my-4">Book a Car</h2>

        <Row>
          {cars.map((car) => (
            <Col key={car.id} md={4} className="mb-4">
              <Card>
                <Card.Img
                  variant="top"
                  src={car.photo.startsWith("data:image") ? car.photo : `data:image/jpeg;base64,${car.photo}`}
                  alt={car.model}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <Card.Body>
                  <Card.Title>{car.model}</Card.Title>
                  <Card.Text>
                    <strong>License Plate:</strong> {car.licensePlate} <br />
                    <strong>Seats:</strong> {car.seats} <br />
                    <strong>Capacity:</strong> {car.capacity} CC <br />
                    <strong>Price per Km:</strong> ${car.pricePerKm} <br />
                  </Card.Text>
                  <Button variant="primary" onClick={() => handleBookNow(car.id)}>Book Now</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Booking Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Book Car</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>ID Number</Form.Label>
                <Form.Control
                  type="text"
                  name="idNumber"
                  value={bookingData.idNumber}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Pickup Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={bookingData.location}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Pickup Time</Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="time"
                  value={bookingData.time}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Button variant="primary" type="submit">Confirm Booking</Button>
            </Form>
          </Modal.Body>
        </Modal>
      </Container>
    </>
  );
}

export default UserBookCar;

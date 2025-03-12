import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Form, Button, Alert, Card, Row, Col } from "react-bootstrap";

const ViewBookingWithoutLogin = () => {
  const [idNumber, setIdNumber] = useState("");
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cars, setCars] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setBookings([]);
    setLoading(true);

    if (!idNumber) {
      setError("Please enter an ID number.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/bookings/idNumber/${idNumber}`);
      if (!response.ok) throw new Error("No bookings found for this ID Number");
      
      const data = await response.json();
      setBookings(data);
      fetchCars(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          carData[carId] = { name: "Unknown Car", photo: "" };
        }
      })
    );
    setCars(carData);
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
              <Nav.Link as={Link} to="/BookACarImmediately">Book a Car</Nav.Link>
              <Nav.Link as={Link} to="/ViewBookingWithoutLogin">Pay for Bookings</Nav.Link>
              <Nav.Link as={Link} to="/ViewBookingAllWithoutLogin">View Bookings</Nav.Link>
              <Nav.Link as={Link} to="/AboutUsWithoutLogin">AboutUs</Nav.Link>
              <Nav.Link as={Link} to="/">Login</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
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

        {error && <Alert variant="danger">{error}</Alert>}

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
                    <Card.Text className="text-muted small">
                      <strong>Location:</strong> {booking.location} <br />
                      <strong>Time:</strong> {booking.time} <br />
                      <strong>Status:</strong> 
                      <span className={`badge ${booking.bookstatus === 0 ? "bg-warning text-dark" : "bg-success"}`}>
                      {booking.bookstatus === 0
  ? "Pending"
  : booking.bookstatus === 1
  ? "In Progress"
  : booking.bookstatus === 2
  ? "Complete"
  : "Cancelled"}
</span>
 <br />
                      <strong>Payment:</strong> 
                      <span className={`badge ${booking.paymentstatus === 0 ? "bg-danger" : "bg-success"}`}>
                        {booking.paymentstatus === 0 ? "Unpaid" : "Paid"}
                      </span> <br />
                      <strong>Total Fee:</strong> <span className="text-primary fw-bold">${booking.totalfee}</span>
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {bookings.length === 0 && error && <Alert variant="info">No bookings found for this ID Number.</Alert>}
      </Container>
    </>
  );
};

export default ViewBookingWithoutLogin;
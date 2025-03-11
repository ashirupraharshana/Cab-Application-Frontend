import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Form, Button, Alert, Card, Row, Col } from "react-bootstrap";

const ViewBookingWithoutLogin = () => {
  const [idNumber, setIdNumber] = useState("");
  const [bookings, setBookings] = useState([]); // Store multiple bookings
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState({});
  const [cars, setCars] = useState({});

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

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">User Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/BookACarImmediately">Book A Car</Nav.Link>
              <Nav.Link as={Link} to="/ViewBookingWithoutLogin">View Bookings</Nav.Link>
              <Nav.Link as={Link} to="/">Get Out</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <h2 className="text-center mb-4">View Bookings Without Login</h2>

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
          <Row>
            {bookings.map((booking) => (
              <Col md={4} key={booking.id} className="mb-4">
                <Card>
                  <Card.Img
                    variant="top"
                    src={
                      cars[booking.carid]?.photo?.startsWith("data:image")
                        ? cars[booking.carid].photo
                        : `data:image/jpeg;base64,${cars[booking.carid]?.photo || ""}`
                    }
                    alt={cars[booking.carid]?.name || "Car Image"}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Title>{cars[booking.carid]?.name || "Unknown Car"}</Card.Title>
                    <Card.Text>
                      <strong>Driver:</strong> {drivers[booking.driverid] || "Loading..."} <br />
                      <strong>Location:</strong> {booking.location} <br />
                      <strong>Time:</strong> {booking.time} <br />
                      <strong>Status:</strong> {booking.bookstatus === 0 ? "Pending" : "Confirmed"} <br />
                      <strong>Payment:</strong> {booking.paymentstatus === 0 ? "Unpaid" : "Paid"} <br />
                      <strong>Total Fee:</strong> ${booking.totalfee}
                      <button>Pay</button>
                    </Card.Text>
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
    </>
  );
};

export default ViewBookingWithoutLogin;

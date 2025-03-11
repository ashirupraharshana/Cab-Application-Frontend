import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav } from "react-bootstrap";


import { Card, Button, Container, Row, Col, Modal, Form } from "react-bootstrap";

function UserBookCar() {
  const [cars, setCars] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState(null);
  const [bookingData, setBookingData] = useState({
    location: "",
    time: "",
  });

  // Retrieve userId from localStorage
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    setUserId(storedUserId || "N/A"); // Fallback if not found
  }, []);

  // Fetch car details
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch("http://localhost:8080/cars/all");
        const data = await response.json();
        
        // Filter only cars with status = 0
        const availableCars = data.filter(car => car.status === 0);
        
        setCars(availableCars);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const bookingRequest = {
      userid: userId, // Include userId in booking request
      carid: selectedCarId,
      location: bookingData.location,
      time: bookingData.time,
      bookstatus: 0,
      paymentstatus: 0,
      totalfee: 0,
    };
  
    try {
      // Step 1: Create the booking
      const bookingResponse = await fetch("http://localhost:8080/bookings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingRequest),
      });
  
      if (!bookingResponse.ok) throw new Error("Booking failed");
  
      // Step 2: Update the car status to 1 (Available)
      const statusUpdateResponse = await fetch(`http://localhost:8080/cars/updateStatus/${selectedCarId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!statusUpdateResponse.ok) throw new Error("Failed to update car status");
  
      alert("Booking successful! Car status updated.");
      setShowModal(false);
    } catch (error) {
      console.error("Error:", error);
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
        
        <Nav.Link as={Link} to="/UserViewNotPaidBookings">Not Paid Bookings</Nav.Link>
        <Nav.Link as={Link} to="/">Logout</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Container>
  <span className="text-light me-3 d-none">Logged in as: <strong>(ID: {userId})</strong></span>
</Navbar>

    
    <Container>
      <h2 className="text-center my-4">Book a Car</h2>
      
      {/* Display Logged-in User ID */}
      <h5 className="text-center text-primary">Logged in as User ID: {userId}</h5>

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
                <Card.Text className="p-3 bg-light rounded shadow-sm">
  <div className="d-flex align-items-center">
    <strong className="me-2 text-primary">
      <i className="fas fa-car"></i> License Plate:
    </strong>
    <span className="fw-bold text-dark">{car.licensePlate}</span>
  </div>

  <div className="d-flex align-items-center mt-2">
    <strong className="me-2 text-success">
      <i className="fas fa-user-friends"></i> Seats:
    </strong>
    <span className="fw-bold text-dark">{car.seats}</span>
  </div>

  <div className="d-flex align-items-center mt-2">
    <strong className="me-2 text-info">
      <i className="fas fa-tachometer-alt"></i> Capacity:
    </strong>
    <span className="fw-bold text-dark">{car.capacity} CC</span>
  </div>

  <div className="d-flex align-items-center mt-2">
    <strong className="me-2 text-danger">
      <i className="fas fa-dollar-sign"></i> Price per Km:
    </strong>
    <span className="fw-bold text-dark">${car.pricePerKm}</span>
  </div>
</Card.Text>

                <Button variant="primary" onClick={() => handleBookNow(car.id)}>
                  Book Now
                </Button>
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
              <Form.Label>User ID</Form.Label>
              <Form.Control type="text" value={userId} disabled />
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

            <Button variant="primary" type="submit">
              Confirm Booking
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
     </>
  );
}

export default UserBookCar;
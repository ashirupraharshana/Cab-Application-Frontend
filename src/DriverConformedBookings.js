import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Card, Button, Modal, Form, Row, Col, } from "react-bootstrap";
import { Link } from "react-router-dom";

function DriverDash() {
  const driverId = localStorage.getItem("userId");
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [travelDistance, setTravelDistance] = useState("");
  const [pricePerKm, setPricePerKm] = useState(null);
  const [totalCost, setTotalCost] = useState(0);
  const [cars, setCars] = useState({});

  useEffect(() => {
    fetch("http://localhost:8080/bookings/all")
      .then((response) => response.json())
      .then((data) =>
        setBookings(
          data.filter(
            (booking) =>
              String(booking.driverid) === driverId &&
              booking.bookstatus === 1 || booking.bookstatus ==2 &&
              booking.paymentstatus === 0 // Only show unpaid bookings
          )
        )
      )
      .catch((error) => console.error("Error fetching bookings:", error));
  }, [driverId]);
  

  const handleArrivedClick = (booking) => {
    setSelectedBooking(booking);
    fetch(`http://localhost:8080/cars/${booking.carid}`)
      .then((response) => response.json())
      .then((data) => {
        setPricePerKm(data.pricePerKm);
        setShowModal(true);
      })
      .catch((error) => console.error("Error fetching car details:", error));
  };

// Handle Payment Submission
const handlePaymentSubmit = (e) => {
  e.preventDefault();
  console.log("Processing payment for:", selectedBooking.id, paymentDetails);

  // Simulating payment API integration
  alert("Payment Successful!");

  // Update booking payment status in the backend
  handlePayManually(selectedBooking.id);

  // Close modal
  handleCloseModal();
};

const handlePayManually = (bookingId) => {
  fetch(`http://localhost:8080/bookings/update/${bookingId}/paymentstatus`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentstatus: 1 }), //  Ensure status is updated
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }
      return response.json();
    })
    .then((updatedBooking) => {
      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === updatedBooking.id ? updatedBooking : booking
        )
      );
      alert("Payment status updated successfully!");
    })
    .catch((error) => {
      console.error("Error updating payment status:", error);
      alert("Error updating payment status");
    });
};

  
  

  const handleTravelDistanceChange = (e) => {
    const distance = e.target.value;
    setTravelDistance(distance);
    setTotalCost(distance * pricePerKm);
  };

  const handleSubmit = () => {
    if (!travelDistance || !pricePerKm) {
      alert("Please enter a valid travel distance.");
      return;
    }
  
    const totalFee = travelDistance * pricePerKm;
  
    // Step 1: Update booking status to 2
    fetch(`http://localhost:8080/bookings/update/${selectedBooking.id}/status2`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update booking status");
        }
        return response.json();
      })
      .then(() => {
        // Step 2: Update travelDistance
        return fetch(`http://localhost:8080/bookings/update/${selectedBooking.id}/traveldistance`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ travelDistance: parseInt(travelDistance, 10) }),
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update travel distance");
        }
        return response.json();
      })
      .then(() => {
        // Step 3: Update totalFee
        return fetch(`http://localhost:8080/bookings/update/${selectedBooking.id}/totalfee`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ totalfee: totalFee }),
        });
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update total fee");
        }
        return response.json();
      })
      .then((updatedBooking) => {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.id === updatedBooking.id ? updatedBooking : booking
          )
        );
        setShowModal(false);
        alert("Booking status updated to 'Completed' and total fee updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating booking status, travel distance, or total fee:", error);
        alert("Error updating booking details.");
      });
      fetch(`http://localhost:8080/cars/updateStatusToAvailable/${selectedBooking.carid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      })
      .then(response => {
        if (!response.ok) throw new Error("Failed to update car status");
        return response.json();
      })
      .then(() => {
        alert("Car status updated to Available!");
      })
      .catch(error => console.error("Error updating car status:", error));
      
  };

  useEffect(() => {
    const fetchCarDetails = async () => {
      const uniqueCarIds = [...new Set(bookings.map((b) => b.carid))];
      const carData = {};
  
      await Promise.all(
        uniqueCarIds.map(async (carid) => {
          try {
            const response = await fetch(`http://localhost:8080/cars/${carid}`);
            if (!response.ok) throw new Error("Failed to fetch car data");
            const data = await response.json();
            carData[carid] = data;
          } catch (error) {
            console.error(`Error fetching car details for carid ${carid}:`, error);
          }
        })
      );
  
      setCars((prevCars) => ({ ...prevCars, ...carData }));
    };
  
    if (bookings.length > 0) {
      fetchCarDetails();
    }
  }, [bookings]);
  
  

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Driver Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
            <Nav.Link as={Link} to="/DriverDash">My Bookings</Nav.Link>

            <Nav.Link onClick={(e) => e.preventDefault()}>Conformed Bookings</Nav.Link>
            <Nav.Link as={Link} to="/DriverEarning">Driver Earning</Nav.Link>
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

 {/* Bookings Section */}
<Container>
<h3 className="text-center fw-bold my-4 text-primary d-none">Your Driver Dashboard</h3>
<h5 className="text-center text-secondary mb-4 d-none">
  Your Driver ID: <span className="fw-bold">{driverId || "Not Available"}</span>
</h5>


  {bookings.length > 0 ? (
    bookings.map((booking) => (
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
                <strong className="text-secondary">Car ID:</strong> {booking.carid} <br />
                <strong className="text-secondary">Location:</strong> {booking.location} <br />
                <strong className="text-secondary">Time:</strong> {booking.time} <br />
                <strong className="text-secondary">Status:</strong> <span className="text-success fw-bold">Confirmed</span> <br />
                <strong className="text-secondary">Total Fee:</strong> <span className="fw-bold">${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"}</span> <br />
                <strong className="text-secondary">Payment Status:</strong>{" "}
                <span className={`fw-bold ${booking.paymentstatus === 0 ? "text-danger" : "text-success"}`}>
                  {booking.paymentstatus === 0 ? "Payment Pending" : "Paid"}
                </span>
              </Card.Text>
            </Col>

            {/* Buttons */}
            <Col md={3} className="text-center d-flex flex-column gap-2">
              <Button variant="success" className="fw-bold px-4 py-2" onClick={() => handleArrivedClick(booking)}>
                Arrived
              </Button>
              <Button 
                variant="warning" 
                className="fw-bold px-4 py-2" 
                onClick={() => handlePayManually(booking.id)}
                disabled={booking.paymentstatus === 1}
              >
                Paid Manually
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    ))
  ) : (
    <p className="text-center mt-4 text-muted">No bookings found</p>
  )}
</Container>


      {/* Modal for Entering Travel Distance */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enter Travel Distance</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBooking && (
            <>
              <p><strong>Booking ID:</strong> {selectedBooking.id}</p>
              <p><strong>Car ID:</strong> {selectedBooking.carid}</p>
              <p><strong>Price Per Km:</strong> ${pricePerKm ? pricePerKm.toFixed(2) : "Loading..."}</p>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Travel Distance (km)</Form.Label>
                  <Form.Control
                    type="number"
                    value={travelDistance}
                    onChange={handleTravelDistanceChange}
                    placeholder="Enter distance"
                  />
                </Form.Group>
                <p><strong>Total Cost:</strong> ${totalCost.toFixed(2)}</p>
                
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit}>Submit</Button>

        </Modal.Footer>
      </Modal>
    </>
  );
}

export default DriverDash;

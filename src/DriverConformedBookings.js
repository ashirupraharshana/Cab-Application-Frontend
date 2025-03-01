import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Card, Button, Modal, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

function DriverDash() {
  const driverId = localStorage.getItem("userId");
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [travelDistance, setTravelDistance] = useState("");
  const [pricePerKm, setPricePerKm] = useState(null);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    fetch("http://localhost:8080/bookings/all")
      .then((response) => response.json())
      .then((data) =>
        setBookings(
          data.filter(
            (booking) =>
              String(booking.driverid) === driverId &&
              booking.bookstatus === 1 &&
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
  
    // Update travelDistance first
    fetch(`http://localhost:8080/bookings/update/${selectedBooking.id}/traveldistance`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ travelDistance: parseInt(travelDistance, 10) }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to update travel distance");
        }
        return response.json();
      })
      .then(() => {
        // Now update totalFee
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
        alert("Travel distance and total fee updated successfully!");
      })
      .catch((error) => {
        console.error("Error updating travel distance or total fee:", error);
        alert("Error updating travel distance or total fee");
      });
  };
  

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Driver Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/DriverBookings">My Bookings</Nav.Link>
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Bookings */}
      <Container>
        <h4 className="text-center">Your Driver ID: {driverId || "Not Available"}</h4>

        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <Card key={booking.id} className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title>Booking ID: {booking.id}</Card.Title>
                <Card.Text>
                  <strong>User ID:</strong> {booking.userid} <br />
                  <strong>Car ID:</strong> {booking.carid} <br />
                  <strong>Location:</strong> {booking.location} <br />
                  <strong>Time:</strong> {booking.time} <br />
                  <strong>Status:</strong> Confirmed <br />
                  <strong>Total Fee:</strong> ${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"} <br />
                  <strong>Payment Status:</strong>{" "}
                    <span style={{ color: booking.paymentstatus === 0 ? "red" : "green", fontWeight: "bold" }}>
                    {booking.paymentstatus === 0 ? "Payment Pending" : "Paid"}
                </span>

                  
                </Card.Text>
                <Button variant="success" onClick={() => handleArrivedClick(booking)}>Arrived</Button>
                <Button 
  variant="warning" 
  onClick={() => handlePayManually(booking.id)}
  disabled={booking.paymentstatus === 1} // Disable if already paid
>
  Paid Manually
</Button>

              </Card.Body>
            </Card>
          ))
        ) : (
          <p className="text-center mt-4">No bookings found</p>
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

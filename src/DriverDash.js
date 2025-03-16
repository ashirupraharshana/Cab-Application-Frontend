import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Card, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function DriverDash() {
  const driverId = localStorage.getItem("userId");
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState({});

  useEffect(() => {
    fetch("http://localhost:8080/bookings/all")
      .then((response) => response.json())
      .then((data) => setBookings(data))
      .catch((error) => console.error("Error fetching bookings:", error));
  }, []);

  useEffect(() => {
    const fetchCarDetails = async () => {
      if (bookings.length === 0) return;
      const carIds = [...new Set(bookings.map((b) => b.carid))];
      const newCarIds = carIds.filter((id) => !cars[id]);
      if (newCarIds.length === 0) return;

      const carData = {};
      await Promise.all(
        newCarIds.map(async (carid) => {
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

    fetchCarDetails();
  }, [bookings]);

  const handleCancel = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:8080/bookings/update/${bookingId}/status3`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error("Failed to update booking status");

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, bookstatus: 2 } : booking
        )
      );

      alert(`Booking ${bookingId} has been cancelled.`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to cancel booking. Try again.");
    }
  };

  const handleConfirm = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:8080/bookings/update/${bookingId}/status1`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) throw new Error(`Failed to update booking status: ${response.statusText}`);

      const updatedBooking = await response.json();

      setBookings((prevBookings) =>
        prevBookings.map((booking) =>
          booking.id === bookingId ? { ...booking, bookstatus: updatedBooking.bookstatus } : booking
        )
      );

      alert(`Booking ${bookingId} is now In Progress.`);
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to confirm booking. Try again.");
    }
  };

  const filteredBookings = bookings.filter(
    (booking) => String(booking.driverid) === driverId && booking.bookstatus !== 2
  );

  const updateCarStatus = async (carId) => {
    try {
      const response = await fetch(`http://localhost:8080/cars/updateStatusToAvailable/${carId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
  
      if (!response.ok) throw new Error("Failed to update car status");
  
      alert("Car status updated successfully!");
  
      // Optional: Refresh state or reload page if needed
      window.location.reload();
    } catch (error) {
      console.error("Error updating car status:", error);
      alert("Failed to update car status. Try again.");
    }
  };
  
  

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Driver Dashboard</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link onClick={(e) => e.preventDefault()}>My Bookings</Nav.Link>
              <Nav.Link as={Link} to="/DriverConformedBookings">Confirmed Bookings</Nav.Link>
              <Nav.Link as={Link} to="/DriverEarning">Driver Earning</Nav.Link>
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <h4 className="text-center mb-4">Your Driver ID: {driverId || "Not Available"}</h4>

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
                      <strong className="text-secondary">Car ID:</strong> {booking.carid} <br />
                      <strong className="text-secondary">Location:</strong> {booking.location} <br />
                      <strong className="text-secondary">Time:</strong> {booking.time} <br />
                      <strong className="text-secondary">Status:</strong>{" "}
                      <span className="fw-bold" style={{ color: booking.bookstatus === 0 ? "orange" 
                      : booking.bookstatus === 1 ? "blue" 
                      : booking.bookstatus === 2 ? "green" 
                      : "red" }}>
  {booking.bookstatus === 0 ? "Pending" 
  : booking.bookstatus === 1 ? "In Progress" 
  : booking.bookstatus === 2 ? "Complete" 
  : "Cancelled"}
</span>

                      <br />
                      <strong className="text-secondary">Total Fee:</strong>{" "}
                      <span className="fw-bold">Rs.{booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"}</span> <br />
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
  onClick={() => handleConfirm(booking.id)}
  disabled={booking.bookstatus !== 0} // Disable if bookstatus is not 0
>
  Confirm
</Button>

<Button
  variant="danger"
  className="fw-bold px-4 py-2"
  onClick={() => {
    const action = window.confirm("Click OK to Cancel Booking");
    if (action) {
      handleCancel(booking.id);
      updateCarStatus(booking.carid);
    }
  }}
  disabled={booking.bookstatus !== 0} // Disable if bookstatus is not 0
>
  Cancel
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
    </>
  );
}

export default DriverDash;

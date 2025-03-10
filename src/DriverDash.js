import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Card, Button, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function DriverDash() {
  const driverId = localStorage.getItem("userId");
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState({});
  const [loadingCars, setLoadingCars] = useState(false);

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
      setLoadingCars(true);
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
      setLoadingCars(false);
    };

    fetchCarDetails();
  }, [bookings]);

  const handleCancel = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:8080/bookings/update/${bookingId}/status2`, {
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
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <h4 className="text-center mb-4">Your Driver ID: {driverId || "Not Available"}</h4>

        {filteredBookings.length > 0 ? (
          <Row className="g-4">
            {filteredBookings.map((booking) => {
              const car = cars[booking.carid];

              return (
                <Col key={booking.id} xs={12} md={6} lg={4}>
                  <Card className="shadow-sm">
                    <Card.Body>
                      <Card.Title className="text-center">Booking ID: {booking.id}</Card.Title>

                      {car && (
                        <>
                          <p className="text-center">
                            <strong>Car:</strong> {car.model}
                          </p>

                          {car?.photo ? (
                            <div className="text-center">
                              <img
                                src={car.photo.startsWith("data:image") ? car.photo : `data:image/jpeg;base64,${car.photo}`}
                                alt={car.model}
                                className="img-fluid rounded shadow"
                                style={{ maxWidth: "100%", height: "200px", objectFit: "cover" }}
                              />
                            </div>
                          ) : (
                            <p className="text-muted text-center">No photo available</p>
                          )}
                        </>
                      )}

                      <Card.Text className="mt-3">
                        <strong>Location:</strong> {booking.location} <br />
                        <strong>Time:</strong> {booking.time} <br />
                        <strong>Status:</strong>{" "}
                        <span
                          className={
                            booking.bookstatus === 0
                              ? "text-warning"
                              : booking.bookstatus === 1
                              ? "text-primary"
                              : "text-danger"
                          }
                        >
                          {booking.bookstatus === 0 ? "Pending" : booking.bookstatus === 1 ? "In Progress" : "Cancelled"}
                        </span>
                        <br />
                        <strong>Total Fee:</strong> ${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"} <br />
                        <strong>Payment Status:</strong>{" "}
                        <span className={booking.paymentstatus === 0 ? "text-danger" : "text-success"}>
                          {booking.paymentstatus === 0 ? "Unpaid" : "Paid"}
                        </span>
                      </Card.Text>

                      <div className="d-flex justify-content-between">
                        <Button variant="success" onClick={() => handleConfirm(booking.id)}>Confirm</Button>
                        <Button variant="danger" onClick={() => handleCancel(booking.id)}>Cancel</Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ) : (
          <p className="text-center">No bookings found</p>
        )}
      </Container>
    </>
  );
}

export default DriverDash;

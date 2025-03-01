import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Card, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

function DriverDash() {
  const driverId = localStorage.getItem("userId"); // Get logged-in driver's ID
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState({}); // Store car details (keyed by car ID)
  const [loadingCars, setLoadingCars] = useState(false); // Loading state for cars

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
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) throw new Error("Failed to update booking status");
  
      // Update the UI after cancellation
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
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      if (!response.ok) throw new Error(`Failed to update booking status: ${response.statusText}`);
  
      const updatedBooking = await response.json(); // Await response JSON
  
      // Check if backend actually returned updated data
      console.log("Updated Booking:", updatedBooking);
  
      // Update UI with new status
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


              <Nav.Link as={Link} to="/DriverConformedBookings">Conformed Bookings</Nav.Link>
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        <h4 className="text-center mb-4">Your Driver ID: {driverId || "Not Available"}</h4>

        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => {
            const car = cars[booking.carid];
            return (
              <Card key={booking.id} className="mb-3 shadow-sm">
                <Card.Body>
                  <Card.Title>Booking ID: {booking.id}</Card.Title>
                  {car ? (
                    <>
                      <strong>Car:</strong> {car.model} <br />
                      {car.photo ? (
                        <img
                          src={car.photo.startsWith("data:image") ? car.photo : `data:image/jpeg;base64,${car.photo}`}
                          alt={car.model}
                          className="img-fluid mt-2"
                          style={{ maxWidth: "200px", borderRadius: "5px" }}
                        />
                      ) : (
                        <p className="text-muted">No photo available</p>
                      )}
                    </>
                  ) : (
                    <p>{loadingCars ? <Spinner animation="border" size="sm" /> : "Loading car details..."}</p>
                  )}

                  <Card.Text>
                    <strong>Location:</strong> {booking.location} <br />
                    <strong>Time:</strong> {booking.time} <br />
                    <strong>Status:</strong>{" "}
                    <span className={booking.bookstatus === 0 ? "text-warning" : "text-success"}>
                    <strong>Status:</strong>{" "}
<span
  className={
    booking.bookstatus === 0
      ? "text-warning" // Yellow for Pending
      : booking.bookstatus === 1
      ? "text-primary" // Blue for In Progress
      : "text-danger" // Red for Cancelled
  }
>
  {booking.bookstatus === 0
    ? "Pending"
    : booking.bookstatus === 1
    ? "In Progress"
    : "Cancelled"}
</span>

                    </span>
                    <br />
                    <strong>Total Fee:</strong> ${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"} <br />
                    <strong>Payment Status:</strong>{" "}
                    <span className={booking.paymentstatus === 0 ? "text-danger" : "text-success"}>
                      {booking.paymentstatus === 0 ? "Unpaid" : "Paid"}
                    </span>
                  </Card.Text>

                  <div className="d-flex justify-content-end gap-2">
                  <Button variant="success" onClick={() => handleConfirm(booking.id)}>Confirm</Button>
                    <Button variant="danger" onClick={() => handleCancel(booking.id)}>Cancel</Button>

                  </div>
                </Card.Body>
              </Card>
            );
          })
        ) : (
          <p className="text-center">No bookings found</p>
        )}
      </Container>
    </>
  );
}

export default DriverDash;

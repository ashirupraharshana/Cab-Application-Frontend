import React, { useEffect, useState } from "react";
import { Container, Card, Button, Row, Col, Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

function AdminViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState({}); // Store car details by car ID
  const [loadingCars, setLoadingCars] = useState(false);

  // Fetch all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:8080/bookings/all");
        if (!response.ok) throw new Error("Failed to fetch bookings");
  
        const data = await response.json();
  
        // Filter bookings where bookstatus is 2 (Complete) or 0 (Pending)
        const filteredBookings = data.filter(booking => booking.bookstatus === 2 || booking.bookstatus === 0);
  
        setBookings(filteredBookings); // Update state with filtered data
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
  
    fetchBookings();
  }, []);
  
  // Fetch car details only for needed car IDs
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
      window.location.reload();
    } catch (error) {
      console.error("Error updating booking status:", error);
      alert("Failed to cancel booking. Try again.");
    }
    
  };

  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Admin</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
            <Nav.Link as={Link} to="/AdminDash">Manage Cars</Nav.Link>
              <Nav.Link as={Link} to="/AdminManageDrivers">Manage Drivers</Nav.Link>
              <Nav.Link as={Link} to="/AdminManageUsers">Manage Users</Nav.Link>
              <Nav.Link as={Link} to="/AdminViewBookings">Assign Drivers</Nav.Link>
              <Nav.Link as={Link} to="/AdminManageBookings">Manage Bookings</Nav.Link>
              <Nav.Link as={Link} to="/Earnings">View Earnings </Nav.Link>
              <Nav.Link as={Link} to="/ViewEarningFromEachDriver">Each Driver Earnings </Nav.Link>
              <Nav.Link as={Link} to="/AdminCancelledBoolings">Cancalled Bookings </Nav.Link>
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="mt-4">
        <h2 className="text-center mb-4">Admin - All Bookings</h2>
        {bookings.length > 0 ? (
          <Row>
            {bookings.map((booking) => {
              const car = cars[booking.carid];
              return (
                <Col key={booking.id} md={4} sm={6} xs={12} className="mb-4">
                  <Card className="shadow-sm">
                    {car?.photo ? (
                      <Card.Img 
                        variant="top" 
                        src={car.photo.startsWith("data:image") ? car.photo : `data:image/jpeg;base64,${car.photo}`}
                        alt={car.model} 
                        style={{ height: "200px", objectFit: "cover" }}
                      />
                    ) : (
                      <div className="text-center py-5 bg-light">No Image Available</div>
                    )}
                    <Card.Body>
                      <Card.Title>{car ? car.model : "Car Details Loading..."}</Card.Title>
                      <Card.Text>
                        <strong>Booking ID:</strong> {booking.id} <br />
                        <strong>User ID:</strong> {booking.userid} <br />
                        <strong>Location:</strong> {booking.location} <br />
                        <strong>Time:</strong> {booking.time} <br />
                        <strong>Total Fee:</strong> ${booking.totalfee?.toFixed(2) || "N/A"} <br />
                        <strong>Payment:</strong> 
                        <span className={booking.paymentstatus === 0 ? "text-danger" : "text-success"}>
                          {booking.paymentstatus === 0 ? "Unpaid" : "Paid"}
                        </span>
                      </Card.Text>
                      <button
  onClick={() => {
    const action = window.confirm("Click OK to Cancel Booking");
    if (action) {
      handleCancel(booking.id);
      updateCarStatus(booking.carid);
    }
  }}
  className="btn btn-danger w-100"
  disabled={booking.bookstatus === 1 || booking.bookstatus === 2 || booking.bookstatus === 3} // Disable if bookstatus is 1, 2, or 3
>
  Cancel Booking
</button>
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

export default AdminViewBookings;

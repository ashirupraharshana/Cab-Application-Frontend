import React, { useEffect, useState } from "react";
import { Container, Card, Dropdown, Button, Navbar, Nav, Modal, Form, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

function AdminViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [cars, setCars] = useState({});
  const [loadingCars, setLoadingCars] = useState(false);

  // Fetch all bookings but only show those where driverid === "-1"
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:8080/bookings/all");
        if (!response.ok) throw new Error("Failed to fetch bookings");

        const data = await response.json();
        const filteredBookings = data.filter((booking) => booking.driverid === "-1"); // Filter for unassigned bookings
        setBookings(filteredBookings);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  // Fetch all drivers (staff)
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch("http://localhost:8080/users/staff");
        if (!response.ok) throw new Error("Failed to fetch drivers");

        const data = await response.json();
        setDrivers(data);
      } catch (error) {
        console.error("Error fetching drivers:", error);
      }
    };

    fetchDrivers();
  }, []);

  // Fetch car details only for new car IDs
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

  // Assign driver to a booking
  const handleAssignDriver = async (bookingId, driverId) => {
    try {
      const response = await fetch(`http://localhost:8080/bookings/update/${bookingId}/driver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverid: driverId }),
      });

      if (!response.ok) throw new Error("Failed to assign driver");

      alert("Driver assigned successfully!");

      // Refresh bookings
      setBookings((prevBookings) => prevBookings.filter((b) => b.id !== bookingId));
    } catch (error) {
      console.error("Error assigning driver:", error);
      alert("Failed to assign driver.");
    }
  };

  // Delete a booking
  const handleDeleteBooking = async (bookingId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this booking?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8080/bookings/delete/${bookingId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete booking");

      alert("Booking deleted successfully!");
      setBookings(bookings.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking.");
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
            <Nav.Link as={Link} to="/">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

    <Container className="mt-4">
    <h2 className="text-center mb-4">Admin - Unassigned Bookings</h2>
  
    {bookings.length > 0 ? (
      <div className="row">
        {bookings.map((booking) => {
          const car = cars[booking.carid];
  
          return (
            <div key={booking.id} className="col-md-4 col-sm-6 mb-4">
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
                    <strong>Total Fee:</strong> ${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"} <br />
                    <strong>Payment:</strong>{" "}
                    <span className={booking.paymentstatus === 0 ? "text-danger" : "text-success"}>
                      {booking.paymentstatus === 0 ? "Unpaid" : "Paid"}
                    </span>
                  </Card.Text>
  
                  {/* Assign Driver Dropdown */}
                  <Dropdown className="mb-2">
                    <Dropdown.Toggle variant="primary" size="sm">Assign Driver</Dropdown.Toggle>
                    <Dropdown.Menu>
                      {drivers.length > 0 ? (
                        drivers.map((driver) => (
                          <Dropdown.Item key={driver.id} onClick={() => handleAssignDriver(booking.id, driver.id)}>
                            {driver.username} (ID: {driver.id})
                          </Dropdown.Item>
                        ))
                      ) : (
                        <Dropdown.Item disabled>No Drivers Available</Dropdown.Item>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
  
                  <Button variant="danger" size="sm" onClick={() => handleDeleteBooking(booking.id)}>
                    Delete Booking
                  </Button>
                </Card.Body>
              </Card>
            </div>
          );
        })}
      </div>
    ) : (
      <p className="text-center">No unassigned bookings found</p>
    )}
  </Container>
  </>
  );
}

export default AdminViewBookings;

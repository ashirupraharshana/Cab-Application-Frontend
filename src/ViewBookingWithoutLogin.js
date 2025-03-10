import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Container, Form, Button, Table, Alert } from "react-bootstrap";

const ViewBookingWithoutLogin = () => {
  const [idNumber, setIdNumber] = useState("");
  const [bookings, setBookings] = useState([]); // Store multiple bookings
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      setBookings(data);
      if (data.length === 0) {
        setError("No bookings found for this ID Number.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false); // Reset loading state
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

        {/* Display multiple bookings in a table */}
        {bookings.length > 0 && (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Car ID</th>
                <th>Driver ID</th>
                <th>Location</th>
                <th>Time</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Total Fee</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id}>
                  <td>{booking.id}</td>
                  <td>{booking.carid}</td>
                  <td className={booking.driverid === "-1" ? "text-danger" : ""}>
                    {booking.driverid === "-1" ? "Driver Not Assigned" : booking.driverid}
                  </td>
                  <td>{booking.location}</td>
                  <td>{booking.time}</td>
                  <td>{booking.bookstatus === 0 ? "Pending" : "Confirmed"}</td>
                  <td>{booking.paymentstatus === 0 ? "Unpaid" : "Paid"}</td>
                  <td>${booking.totalfee}</td>
                </tr>
              ))}
            </tbody>
          </Table>
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

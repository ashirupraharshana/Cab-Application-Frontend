import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function UserDash() {
  // Retrieve user info from localStorage
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">User Dashboard</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/UserBookCar">Book A Car</Nav.Link>
            <Nav.Link as={Link} to="/ViewMyBookings">View Bookings</Nav.Link>
            <Nav.Link as={Link} to="/BookingInProgress">Bookings in Progress</Nav.Link>
            <Nav.Link as={Link} to="/UserBookingHistory">Booking History</Nav.Link>
            <Nav.Link as={Link} to="/">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
      {/* Hide User ID */}
      <span className="text-light me-3"><strong></strong></span>
    </Navbar>
  );
}

export default UserDash;

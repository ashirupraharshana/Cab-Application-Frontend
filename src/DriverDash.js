import React from 'react';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function DriverDash() {
  return (
  <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
  <Container>
    <Navbar.Brand as={Link} to="/">Admin</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="ms-auto">
        <Nav.Link as={Link} to="/AdminDash">Manage Cars</Nav.Link>
        <Nav.Link as={Link} to="/DriverDash">Manage Driver</Nav.Link>
        <Nav.Link as={Link} to="/UserDash">User</Nav.Link>
        <Nav.Link as={Link} to="/">Logout</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </Container>
</Navbar>
  );
}

export default DriverDash;

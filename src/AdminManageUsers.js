import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Table, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

const AdminManageUsers = () => {
  const [drivers, setDrivers] = useState([]);
  const [error, setError] = useState("");

  // Fetch all Drivers
  const fetchDrivers = () => {
    fetch("http://localhost:8080/users/all")
      .then((response) => response.json())
      .then((data) => setDrivers(data.filter((driver) => driver.userrole === 2)))
      .catch(() => setError("Failed to fetch drivers"));
  };

  useEffect(() => {
    fetchDrivers(); // Fetch drivers when component mounts
  }, []);

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this driver?");
    
    if (!confirmDelete) return; // Stop if user cancels
  
    fetch(`http://localhost:8080/users/delete/${id}`, {
      method: "DELETE",
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete driver");
        }
        setDrivers(drivers.filter((driver) => driver.id !== id));
      })
      .catch(() => setError("Failed to delete driver"));
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

      <Container>
        <h1 className="mb-4">Manage Drivers</h1>

        {error && <Alert variant="danger">{error}</Alert>}

        {/* Driver Table */}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No drivers available.</td>
              </tr>
            ) : (
              drivers.map((driver, index) => (
                <tr key={driver.id}>
                  <td>{index + 1}</td>
                  <td>{driver.username}</td>
                  <td>{driver.email}</td>
                  <td>{driver.phonenumber}</td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(driver.id)}>Delete</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Container>
    </>
  );
};

export default AdminManageUsers;

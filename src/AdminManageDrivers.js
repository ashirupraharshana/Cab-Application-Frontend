import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Table, Button, Modal, Form, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";

function AdminManageDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phonenumber: "",
    password: "",
    userrole: 1,
    status: 0,
  });

  // Fetch all drivers
  const fetchDrivers = () => {
    fetch("http://localhost:8080/users/all")
      .then((response) => response.json())
      .then((data) => setDrivers(data.filter(driver => driver.userrole === 1)))
      .catch(() => setError("Failed to fetch drivers"));
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://localhost:8080/users/staffregister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to add driver");

      setSuccess("Driver added successfully!");
      setShowModal(false);
      setFormData({ username: "", email: "", phonenumber: "", password: "", userrole: 1, status: 0 });

      // Refresh driver list
      fetchDrivers();
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle delete driver
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this driver?")) {
      try {
        const response = await fetch(`http://localhost:8080/users/delete/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete driver");

        alert("Driver deleted successfully!");
        fetchDrivers();
      } catch (error) {
        alert(error.message);
      }
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

      <Container>
        <h1 className="mb-4">Manage Drivers</h1>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Driver List</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>+ Add Driver</Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

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
                <td colSpan="7" className="text-center">No drivers available.</td>
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

      {/* Add Driver Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Driver</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" name="username" value={formData.username} onChange={handleInputChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" name="email" value={formData.email} onChange={handleInputChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="text" name="phonenumber" value={formData.phonenumber} onChange={handleInputChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" value={formData.password} onChange={handleInputChange} required />
            </Form.Group>

            <Button variant="primary" type="submit">Add Driver</Button>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default AdminManageDrivers;
import React, { useState, useEffect } from "react";
import { Navbar, Nav, Container, Card, Button, Modal, Form, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./App.css"; 


function AdminDash() {
  const [cars, setCars] = useState([]); // Store car data from backend
  const [showModal, setShowModal] = useState(false); // Control modal visibility
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);



  // Form Data
  const [formData, setFormData] = useState({
    model: "",
    licensePlate: "",
    seats: "",
    capacity: "",
    pricePerKm: "",
    photo: "",
  });

  // Fetch all cars
  const fetchCarDetails = () => {
    fetch("http://localhost:8080/cars/all")
      .then((response) => response.json())
      .then((data) => setCars(data))
      .catch(() => setError("Failed to fetch cars"));
  };

  useEffect(() => {
    fetchCarDetails();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Resize and encode image to Base64
  const resizeImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const maxSize = 500;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxSize) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else if (height > width && height > maxSize) {
          width = (width * maxSize) / height;
          height = maxSize;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        callback(canvas.toDataURL("image/jpeg"));
      };
    };
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      resizeImage(file, (resizedBase64) => {
        setFormData((prev) => ({ ...prev, photo: resizedBase64 }));
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("http://localhost:8080/cars/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: "0" }),
      });

      if (!response.ok) throw new Error("Failed to add car");

      setSuccess("Car added successfully!");
      setShowModal(false);
      setFormData({ model: "", licensePlate: "", seats: "", capacity: "", pricePerKm: "", photo: "" });

      // Refresh car list
      fetchCarDetails();
    } catch (err) {
      setError(err.message);
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
              <Nav.Link onClick={fetchCarDetails}>Manage Cars</Nav.Link>
              <Nav.Link as={Link} to="/AdminManageDrivers">Manage Driver</Nav.Link>
              <Nav.Link as={Link} to="/UserDash">User</Nav.Link>
              <Nav.Link as={Link} to="/">Logout</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>



      <Container>
        <h1 className="mb-4">Admin Dashboard</h1>
        
        {/* Manage Cars Section */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>Car Gallery</h2>
          <Button variant="primary" onClick={() => setShowModal(true)}>+ Add Car</Button>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Car Gallery */}
        <div className="d-flex flex-wrap justify-content-center">
          {cars.length === 0 ? (
            <p>No cars available.</p>
          ) : (
            cars.map((car, index) => (
              <Card key={index} className="m-2" style={{ width: "18rem" }}>
                <Card.Img variant="top" src={car.photo} alt="Car" style={{ height: "200px", objectFit: "cover" }} />
                <Card.Body>
                  <Card.Title>{car.model}</Card.Title>
                  <Card.Text>
                    <strong>License Plate:</strong> {car.licensePlate} <br />
                    <strong>Seats:</strong> {car.seats} <br />
                    <strong>Capacity:</strong> {car.capacity} <br />
                    <strong>Price per KM:</strong> ${car.pricePerKm} <br />
                    <strong>Status:</strong> {car.status === "0" ? "Available" : "Not Available"}
                    <div className="d-flex justify-content-between">
                    <Button
  variant="danger"
  size="sm"
  onClick={async () => {
    if (window.confirm("Are you sure you want to delete this car?")) {
      try {
        const response = await fetch(`http://localhost:8080/cars/delete/${car.id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("Failed to delete car");

        alert("Car deleted successfully!");
        fetchCarDetails(); // Refresh car list
      } catch (error) {
        alert(error.message);
      }
    }
  }}
>
  Delete
</Button>

<Button
  variant="warning"
  size="sm"
  onClick={() => {
    setFormData(car); // Populate form with selected car details
    setShowModal(true); // Open the modal
  }}
>
  Edit
</Button>

{/* Edit Car Modal */}
<Modal show={showModal} onHide={() => setShowModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Edit Car</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    <Form
      onSubmit={async (e) => {
        e.preventDefault();
        try {
          const response = await fetch(`http://localhost:8080/cars/update/${formData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          });

          if (!response.ok) throw new Error("Failed to update car");

          alert("Car updated successfully!");
          setShowModal(false);
          fetchCarDetails(); // Refresh car list
        } catch (error) {
          alert(error.message);
        }
      }}
    >
      <Form.Group className="mb-3">
        <Form.Label>Model</Form.Label>
        <Form.Control type="text" name="model" value={formData.model} onChange={handleInputChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>License Plate</Form.Label>
        <Form.Control type="text" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Seats</Form.Label>
        <Form.Control type="number" name="seats" value={formData.seats} onChange={handleInputChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Capacity</Form.Label>
        <Form.Control type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Price per KM</Form.Label>
        <Form.Control type="number" step="0.01" name="pricePerKm" value={formData.pricePerKm} onChange={handleInputChange} required />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Photo</Form.Label>
        <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
      </Form.Group>

      <Button variant="primary" type="submit">
        Save Changes
      </Button>
    </Form>
  </Modal.Body>
</Modal>


                    </div>
                  </Card.Text>
                </Card.Body>
              </Card>
            ))
          )}
        </div>
      </Container>

      {/* Add Car Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Car</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Model</Form.Label>
              <Form.Control type="text" name="model" value={formData.model} onChange={handleInputChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>License Plate</Form.Label>
              <Form.Control type="text" name="licensePlate" value={formData.licensePlate} onChange={handleInputChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Seats</Form.Label>
              <Form.Control type="number" name="seats" value={formData.seats} onChange={handleInputChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Capacity</Form.Label>
              <Form.Control type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Price per KM</Form.Label>
              <Form.Control type="number" step="0.01" name="pricePerKm" value={formData.pricePerKm} onChange={handleInputChange} required />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Photo</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
            </Form.Group>

            <Button variant="primary" type="submit">
              Add Car
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      
    </>
  );


}

export default AdminDash;

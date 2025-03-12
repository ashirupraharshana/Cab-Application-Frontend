import React, { useEffect, useState } from "react";
import { Navbar, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";

function ViewMyBookings() {
  const userId = localStorage.getItem("userId");
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState({});

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:8080/bookings/all");
        if (!response.ok) throw new Error("Failed to fetch bookings");

        const data = await response.json();
        const userBookings = data.filter((booking) => booking.userid === userId);
        setBookings(userBookings);

        // Fetch car details
        const carIds = [...new Set(userBookings.map((b) => b.carid))]; // Unique car IDs
        const carData = {};
        await Promise.all(
          carIds.map(async (carid) => {
            try {
              const carResponse = await fetch(`http://localhost:8080/cars/${carid}`);
              if (!carResponse.ok) throw new Error("Failed to fetch car data");
              const carInfo = await carResponse.json();
              carData[carid] = carInfo;
            } catch (error) {
              console.error(`Error fetching car details for carid ${carid}:`, error);
            }
          })
        );
        setCars(carData);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [userId]);

  const handleDelete = async (bookingId) => {
    if (!window.confirm("Are you sure you want to delete this booking?")) return;

    try {
      const response = await fetch(`http://localhost:8080/bookings/delete/${bookingId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete booking");

      setBookings(bookings.filter((booking) => booking.id !== bookingId));
      alert("Booking deleted successfully!");
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking.");
    }
  };

  return (
<>
    {/* Navbar */}
<Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
  <div className="container">
    <Navbar.Brand as={Link} to="/">Mega City Cab</Navbar.Brand>
    <Navbar.Toggle aria-controls="basic-navbar-nav" />
    <Navbar.Collapse id="basic-navbar-nav">
      <Nav className="ms-auto">
        <Nav.Link as={Link} to="/UserBookCar">Book A Car</Nav.Link>
        <Nav.Link as={Link} to="/ViewMyBookings">View Bookings</Nav.Link>
        <Nav.Link as={Link} to="/BookingInProgress">Bookings in Progress</Nav.Link>
        
        <Nav.Link as={Link} to="/UserViewNotPaidBookings">Not Paid Bookings</Nav.Link>
        <Nav.Link as={Link} to="/AboutUs">About us</Nav.Link>
        <Nav.Link as={Link} to="/">Logout</Nav.Link>
      </Nav>
    </Navbar.Collapse>
  </div>
</Navbar>

<div className="container">
  <h2 className="text-center my-4">My Bookings</h2>
  {bookings.length > 0 ? (
    <div className="row justify-content-center">
      {bookings.map((booking) => {
        const car = cars[booking.carid];
        return (
          <div key={booking.id} className="col-md-3 mb-4 d-flex justify-content-center">
            <div className="card shadow-lg" style={{ width: "18rem" }}>
              {car && car.photo ? (
                <img
                  src={car.photo.startsWith("data:image") ? car.photo : `data:image/jpeg;base64,${car.photo}`}
                  alt={car.model}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
              ) : (
                <div className="card-img-top d-flex align-items-center justify-content-center" 
                     style={{ height: "200px", backgroundColor: "#f0f0f0", color: "#888" }}>
                  No Image Available
                </div>
              )}
              <div className="card-body text-center">
              <h5 className="card-title d-none">Booking ID: {booking.id}</h5>
                {car && <p className="card-text"><strong>Car:</strong> {car.model}</p>}
                <p className="card-text"><strong>Location:</strong> {booking.location}</p>
                <p className="card-text">
                  <strong>Status:</strong> 
                  <span
  className="fw-bold"
  style={{
    color:
      booking.bookstatus === 1
        ? "blue"
        : booking.bookstatus === 2
        ? "green"
        : booking.bookstatus === 3
        ? "red"
        : "orange",
  }}
>
  {booking.bookstatus === 0
    ? "Pending"
    : booking.bookstatus === 1
    ? "In Progress"
    : booking.bookstatus === 2
    ? "Complete"
    : "Cancelled"}
</span>

                </p>
                <p className="card-text"><strong>Fee:</strong> ${booking.totalfee.toFixed(2)}</p>
                <p className="card-text">
                  <strong>Payment:</strong> 
                  <span className={`fw-bold ${booking.paymentstatus === 0 ? "text-danger" : "text-success"}`}>
                    {booking.paymentstatus === 0 ? "Unpaid" : "Paid"}
                  </span>
                </p>
                <button
                  onClick={() => handleDelete(booking.id)}
                  className="btn btn-danger w-100"
                >
                  Delete Booking
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <p className="text-center fw-bold text-secondary fs-5">No bookings found for your account.</p>
  )}
</div>

    </>
  );
}

export default ViewMyBookings;

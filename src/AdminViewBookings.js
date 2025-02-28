import React, { useEffect, useState } from "react";
import { Container, Card, Dropdown, Button } from "react-bootstrap";

function AdminViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:8080/bookings/all");
        if (!response.ok) throw new Error("Failed to fetch bookings");

        const data = await response.json();
        setBookings(data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

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

  const handleAssignDriver = async (bookingId, driverId) => {
    try {
      const response = await fetch(`http://localhost:8080/bookings/update/${bookingId}/driver`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverid: driverId }),
      });
  
      if (!response.ok) throw new Error("Failed to assign driver");
  
      alert("Driver assigned successfully!");
  
      const updatedResponse = await fetch("http://localhost:8080/bookings/all");
      if (!updatedResponse.ok) throw new Error("Failed to refresh bookings");
  
      const updatedBookings = await updatedResponse.json();
      setBookings(updatedBookings);
    } catch (error) {
      console.error("Error assigning driver:", error);
      alert("Failed to assign driver.");
    }
  };

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
    <Container className="mt-4">
      <h2 className="text-center">Admin - View Bookings</h2>
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <Card key={booking.id} className="mb-3">
            <Card.Body>
              <Card.Title>Booking ID: {booking.id}</Card.Title>
              <Card.Text>
                <strong>User ID:</strong> {booking.userid} <br />
                <strong>Car ID:</strong> {booking.carid} <br />
                <strong>Driver:</strong> {booking.driverid ? `ID: ${booking.driverid}` : "Not Assigned"} <br />
                <strong>Location:</strong> {booking.location} <br />
                <strong>Time:</strong> {booking.time} <br />
                <strong>Status:</strong> {booking.bookstatus === 0 ? "Pending" : "Confirmed"} <br />
                <strong>Total Fee:</strong> ${booking.totalfee.toFixed(2)} <br />
                <strong>Payment Status:</strong> {booking.paymentstatus === 0 ? "Unpaid" : "Paid"}
              </Card.Text>
              <Dropdown>
                <Dropdown.Toggle variant="primary">Assign Driver</Dropdown.Toggle>
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
              <Button variant="danger" className="mt-2" onClick={() => handleDeleteBooking(booking.id)}>
                Delete Booking
              </Button>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p className="text-center">No bookings found</p>
      )}
    </Container>
  );
}

export default AdminViewBookings;

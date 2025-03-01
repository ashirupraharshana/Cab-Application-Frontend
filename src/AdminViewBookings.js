import React, { useEffect, useState } from "react";
import { Container, Card, Dropdown, Button, Spinner } from "react-bootstrap";

function AdminViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [cars, setCars] = useState({}); // Store car details by car ID
  const [loadingCars, setLoadingCars] = useState(false);

  // Fetch all bookings
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

      const carIds = [...new Set(bookings.map((b) => b.carid))]; // Get unique car IDs
      const newCarIds = carIds.filter((id) => !cars[id]); // Fetch only new cars

      if (newCarIds.length === 0) return;

      setLoadingCars(true);
      const carData = {};

      await Promise.all(
        newCarIds.map(async (carid) => {
          try {
            const response = await fetch(`http://localhost:8080/cars/${carid}`);
            if (!response.ok) throw new Error("Failed to fetch car data");

            const data = await response.json();
            carData[carid] = data; // Store data
          } catch (error) {
            console.error(`Error fetching car details for carid ${carid}:`, error);
          }
        })
      );

      setCars((prevCars) => ({ ...prevCars, ...carData })); // Merge with previous state
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
      const updatedResponse = await fetch("http://localhost:8080/bookings/all");
      if (!updatedResponse.ok) throw new Error("Failed to refresh bookings");

      const updatedBookings = await updatedResponse.json();
      setBookings(updatedBookings);
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
    <Container className="mt-4">
      <h2 className="text-center mb-4">Admin - View Bookings</h2>

      {bookings.length > 0 ? (
        bookings.map((booking) => {
          const car = cars[booking.carid]; // Get car details

          return (
            <Card key={booking.id} className="mb-3 shadow-sm">
              <Card.Body>
                <Card.Title>Booking ID: {booking.id}</Card.Title>
                {car ? (
                  <>
                    <strong>Car:</strong> {car.model} <br />
                    {car.photo ? (
                      <img
                        src={car.photo.startsWith("data:image") ? car.photo : `data:image/jpeg;base64,${car.photo}`}
                        alt={car.model}
                        className="img-fluid mt-2"
                        style={{ maxWidth: "200px", borderRadius: "5px" }}
                      />
                    ) : (
                      <p className="text-muted">No photo available</p>
                    )}
                  </>
                ) : (
                  <p>{loadingCars ? <Spinner animation="border" size="sm" /> : "Loading car details..."}</p>
                )}

                <Card.Text>
                  <strong>User ID:</strong> {booking.userid} <br />
                  <strong>Car ID:</strong> {booking.carid} <br />
                  <strong>Driver:</strong> {booking.driverid ? `ID: ${booking.driverid}` : "Not Assigned"} <br />
                  <strong>Location:</strong> {booking.location} <br />
                  <strong>Time:</strong> {booking.time} <br />
                  <strong>Status:</strong>{" "}
                  <span className={booking.bookstatus === 0 ? "text-warning" : "text-success"}>
                    {booking.bookstatus === 0 ? "Pending" : "Confirmed"}
                  </span>
                  <br />
                  <strong>Total Fee:</strong> ${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"} <br />
                  <strong>Payment Status:</strong>{" "}
                  <span className={booking.paymentstatus === 0 ? "text-danger" : "text-success"}>
                    {booking.paymentstatus === 0 ? "Unpaid" : "Paid"}
                  </span>
                </Card.Text>

                {/* Assign Driver Dropdown */}
                <Dropdown className="mt-2">
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

                {/* Delete Booking Button */}
                <Button variant="danger" className="mt-2" onClick={() => handleDeleteBooking(booking.id)}>
                  Delete Booking
                </Button>
              </Card.Body>
            </Card>
          );
        })
      ) : (
        <p className="text-center">No bookings found</p>
      )}
    </Container>
  );
}

export default AdminViewBookings;

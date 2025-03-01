import React, { useEffect, useState } from "react";
import { Container, Card, Button, Row, Col } from "react-bootstrap";

function AdminViewBookings() {
  const [bookings, setBookings] = useState([]);
  const [cars, setCars] = useState({}); // Store car details by car ID
  const [loadingCars, setLoadingCars] = useState(false);

  // Fetch all bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("http://localhost:8080/bookings/all");
        if (!response.ok) throw new Error("Failed to fetch bookings");

        const data = await response.json();
        setBookings(data); // Display all bookings
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };
    fetchBookings();
  }, []);

  // Fetch car details only for needed car IDs
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

  // Cancel a booking
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      const response = await fetch(`http://localhost:8080/bookings/delete/${bookingId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to cancel booking");
      alert("Booking canceled successfully!");
      setBookings(bookings.filter((booking) => booking.id !== bookingId));
    } catch (error) {
      console.error("Error canceling booking:", error);
      alert("Failed to cancel booking.");
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center mb-4">Admin - All Bookings</h2>
      {bookings.length > 0 ? (
        <Row>
          {bookings.map((booking) => {
            const car = cars[booking.carid];
            return (
              <Col key={booking.id} md={4} sm={6} xs={12} className="mb-4">
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
                      <strong>Total Fee:</strong> ${booking.totalfee?.toFixed(2) || "N/A"} <br />
                      <strong>Payment:</strong> 
                      <span className={booking.paymentstatus === 0 ? "text-danger" : "text-success"}>
                        {booking.paymentstatus === 0 ? "Unpaid" : "Paid"}
                      </span>
                    </Card.Text>
                    <Button variant="danger" size="sm" onClick={() => handleCancelBooking(booking.id)}>
                      Cancel Booking
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : (
        <p className="text-center">No bookings found</p>
      )}
    </Container>
  );
}

export default AdminViewBookings;

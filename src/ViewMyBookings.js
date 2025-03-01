import React, { useEffect, useState } from "react";

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
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>My Bookings</h2>
      {bookings.length > 0 ? (
        bookings.map((booking) => {
          const car = cars[booking.carid];
          return (
            <div key={booking.id} style={{ border: "1px solid #ddd", borderRadius: "10px", padding: "15px", marginBottom: "20px", boxShadow: "0 2px 5px rgba(0,0,0,0.1)" }}>
              {car && car.photo ? (
        <img
        src={car.photo.startsWith("data:image") ? car.photo : `data:image/jpeg;base64,${car.photo}`}
        alt={car.model}
        style={{
          width: "300px", // Makes sure the image fits the container
          height: "300px", // Ensures aspect ratio is maintained
          display: "block", // Prevents inline spacing issues
          margin: "auto", // Centers the image
          borderRadius: "10px", // Rounded corners for a cleaner look
        }}
      />
      
              ) : (
                <p style={{ textAlign: "center", fontStyle: "italic", color: "#888" }}>No car photo available</p>
              )}

              <h3 style={{ margin: "10px 0" }}>Booking ID: {booking.id}</h3>
              {car && <p><strong>Car Model:</strong> {car.model}</p>}
              <p><strong>Location:</strong> {booking.location}</p>
              <p><strong>Time:</strong> {booking.time}</p>
              <p>
                <strong>Status:</strong>{" "}
                <span style={{ color: booking.bookstatus === 0 ? "orange" : "green", fontWeight: "bold" }}>
                  {booking.bookstatus === 0 ? "Pending" : "Confirmed"}
                </span>
              </p>
              <p><strong>Total Fee:</strong> ${booking.totalfee.toFixed(2)}</p>
              <p>
                <strong>Payment Status:</strong>{" "}
                <span style={{ color: booking.paymentstatus === 0 ? "red" : "green", fontWeight: "bold" }}>
                  {booking.paymentstatus === 0 ? "Unpaid" : "Paid"}
                </span>
              </p>
              <button
                onClick={() => handleDelete(booking.id)}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  padding: "8px 15px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  display: "block",
                  marginTop: "10px",
                  width: "100%",
                }}
              >
                Delete Booking
              </button>
            </div>
          );
        })
      ) : (
        <p style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold", color: "#555" }}>
          No bookings found for your account.
        </p>
      )}
    </div>
  );
}

export default ViewMyBookings;

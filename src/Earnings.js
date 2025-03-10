import React, { useState, useEffect } from "react";
import { Container, Alert, Table } from "react-bootstrap";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from "recharts";

function Earnings() {
  const [bookings, setBookings] = useState([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/bookings/all")
      .then((response) => response.json())
      .then((data) => {
        const paidBookings = data.filter((booking) => booking.paymentstatus === 1);
        setBookings(paidBookings);

        // Calculate total earnings
        const total = paidBookings.reduce((sum, booking) => sum + (booking.totalfee || 0), 0);
        setTotalEarnings(total);

        // Prepare chart data (group by booking time)
        const earningsByDate = {};
        paidBookings.forEach((booking) => {
          const date = new Date(booking.time).toLocaleDateString(); // Format date
          earningsByDate[date] = (earningsByDate[date] || 0) + booking.totalfee;
        });

        // Convert to array for Recharts
        const formattedData = Object.keys(earningsByDate).map((date) => ({
          date,
          earnings: earningsByDate[date],
        }));

        setChartData(formattedData);
      })
      .catch((error) => console.error("Error fetching bookings:", error));
  }, []);

  return (
    <Container className="mt-4">
      <h3 className="text-center mb-4">Earnings - Paid Bookings</h3>

      {/* Total Earnings */}
      <Alert variant="success" className="text-center fw-bold">
        Total Earnings: ${totalEarnings.toFixed(2)}
      </Alert>

      {/* Earnings Graph */}
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="earnings" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>

      {/* Earnings Table */}
      <Table striped bordered hover responsive className="mt-4">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Car ID</th>
            <th>Driver ID</th>
            <th>Location</th>
            <th>Time</th>
            <th>Travel Distance</th>
            <th>Total Fee ($)</th>
            <th>Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {bookings.length > 0 ? (
            bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.id}</td>
                <td>{booking.userid}</td>
                <td>{booking.carid}</td>
                <td>{booking.driverid !== "-1" ? booking.driverid : "Unassigned"}</td>
                <td>{booking.location}</td>
                <td>{booking.time}</td>
                <td>{booking.travelDistance > 0 ? `${booking.travelDistance} km` : "Not Complete"}</td>
                <td>${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"}</td>
                <td className="text-success fw-bold">Paid</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center">No paid bookings found.</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default Earnings;

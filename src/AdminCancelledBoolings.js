import React from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";

const BookingCard = ({ booking, cars, handleShowModal, handleConfirm, handleCancel, driverId, filteredBookings }) => {
  const car = cars[booking.carid];
  const completedBookings = filteredBookings.filter(booking => booking.bookstatus === 2);

  return (
    <Container>
      <h4 className="text-center mb-4">Your Driver ID: {driverId || "Not Available"}</h4>
      {completedBookings.length > 0 ? (
        completedBookings.map((booking) => (
          <Card key={booking.id} className="mb-4 shadow-lg border-0" style={{ background: "#f8f9fa" }}>
            <Card.Body className="p-4">
              <Row className="align-items-center">
                {/* Car Photo */}
                <Col md={4} className="text-center">
                  {cars[booking.carid]?.photo ? (
                    <img
                      src={cars[booking.carid].photo.startsWith("data:image") ? cars[booking.carid].photo : `data:image/jpeg;base64,${cars[booking.carid].photo}`}
                      alt={`Car ${cars[booking.carid]?.model}`}
                      className="img-fluid rounded shadow-sm"
                      style={{ maxWidth: "100%", height: "180px", objectFit: "cover" }}
                    />
                  ) : (
                    <p className="text-muted">No photo available</p>
                  )}
                </Col>

                {/* Booking Details */}
                <Col md={5}>
                  <Card.Title className="text-primary fw-bold mb-3">Booking ID: {booking.id}</Card.Title>
                  <Card.Text>
                    <strong className="text-secondary">User ID:</strong> {booking.userid} <br />
                    <strong className="text-secondary">Car ID:</strong> {booking.carid} <br />
                    <strong className="text-secondary">Location:</strong> {booking.location} <br />
                    <strong className="text-secondary">Time:</strong> {booking.time} <br />
                    <strong className="text-secondary">Status:</strong>{" "}
                    <span className="fw-bold" style={{ color: "green" }}>
                      Completed
                    </span>
                    <br />
                    <strong className="text-secondary">Total Fee:</strong>{" "}
                    <span className="fw-bold">${booking.totalfee ? booking.totalfee.toFixed(2) : "N/A"}</span> <br />
                    <strong className="text-secondary">Payment Status:</strong>{" "}
                    <span className={`fw-bold ${booking.paymentstatus === 0 ? "text-danger" : "text-success"}`}>
                      {booking.paymentstatus === 0 ? "Payment Pending" : "Paid"}
                    </span>
                  </Card.Text>
                </Col>

                {/* Buttons */}
                <Col md={3} className="text-center d-flex flex-column gap-2">
                  <Button variant="success" className="fw-bold px-4 py-2" onClick={() => handleConfirm(booking.id)}>
                    Confirm
                  </Button>
                  <Button
                    variant="danger"
                    className="fw-bold px-4 py-2"
                    onClick={() => handleCancel(booking.id)}
                  >
                    Cancel
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))
      ) : (
        <p className="text-center mt-4 text-muted">No completed bookings found</p>
      )}
    </Container>
  );
};

export default BookingCard;

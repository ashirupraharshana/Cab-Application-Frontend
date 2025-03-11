import React from "react";
import { Link } from "react-router-dom"; // Import Link
import aboutImage from "./Designs/about-us.jpg"; 
import teamImage from "./Designs/team.jpg"; 
import serviceImage from "./Designs/service.jpg";
import { Navbar, Nav, Container } from "react-bootstrap";

function AboutUs() {
  return (
    <>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand as={Link} to="/">Mega City Cab</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
  <Nav.Link as={Link} to="/BookACarImmediately">Book a Car</Nav.Link>
              <Nav.Link as={Link} to="/ViewBookingWithoutLogin">View Bookings</Nav.Link>
              <Nav.Link as={Link} to="/ViewBookingAllWithoutLogin">Pay for Bookings</Nav.Link>
              <Nav.Link as={Link} to="/AboutUsWithoutLogin">AboutUs</Nav.Link>
              <Nav.Link as={Link} to="/">Login</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <div className="container my-5">
        <h1 className="text-center mb-4">About Us</h1>

        {/* About Section */}
        <div className="row align-items-center mb-5">
          <div className="col-md-6">
            <img
              src={aboutImage}
              alt="About Us"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-6">
            <h3>Who We Are</h3>
            <p>
              Mega City Cab is a leading cab service in Colombo City, providing
              reliable and comfortable rides. We aim to make transportation easy
              and convenient for our customers.
            </p>
          </div>
        </div>

        {/* Our Team Section */}
        <div className="row align-items-center flex-md-row-reverse mb-5">
          <div className="col-md-6">
            <img
              src={teamImage}
              alt="Our Team"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-6">
            <h3>Our Team</h3>
            <p>
              Our professional drivers and customer support team work 24/7 to
              ensure the best experience for our passengers. Safety and comfort
              are our top priorities.
            </p>
          </div>
        </div>

        {/* Our Services Section */}
        <div className="row align-items-center mb-5">
          <div className="col-md-6">
            <img
              src={serviceImage}
              alt="Our Services"
              className="img-fluid rounded shadow"
            />
          </div>
          <div className="col-md-6">
            <h3>Our Services</h3>
            <p>
              We offer a range of services including city rides, airport
              transfers, and business travel solutions. Book a ride instantly
              through our online platform.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default AboutUs;

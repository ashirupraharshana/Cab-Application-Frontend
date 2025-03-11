import React from "react";
import aboutImage from "./Designs/about-us.jpg"; 
import teamImage from "./Designs/team.jpg";  // ✅ Ensure correct filename & extension
import serviceImage from "./Designs/service.jpg";  // ✅ Ensure correct filename & extension

function AboutUs() {
  return (
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
  );
}

export default AboutUs;

import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';
import AdminDash from './AdminDash';
import DriverDash from './DriverDash';
import UserDash from './UserDash';
import AdminManageDrivers from "./AdminManageDrivers";
import UserBookCar from './UserBookCar';
import AdminViewBookings from "./AdminViewBookings"; 
import ViewMyBookings from "./ViewMyBookings";
import BookingInProgress from "./BookingInProgress";
import DriverConformedBookings from "./DriverConformedBookings";
import UserBookingHistory from "./UserBookingHistory"; 
import AdminManageBookings from "./AdminManageBookings"; 
import AdminManageUsers from "./AdminManageUsers"; 
import BookACarImmediately from "./BookACarImmediately"; 
import ViewBookingWithoutLogin from "./ViewBookingWithoutLogin";
import UserViewNotPaidBookings from "./UserViewNotPaidBookings";
import Earnings from "./Earnings";



function LoginRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Handle Login
  const handleLogin = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/users/userlogin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      if (response.ok) {
        const data = await response.json();
        const userRole = data.userrole;
        const userId = data.userid;  // Assuming 'id' is returned from backend
  
        // Store user ID in localStorage
        localStorage.setItem("userId", userId);
  
        // Redirect based on user role
        if (userRole === 0) {
          navigate('/admin');
        } else if (userRole === 1) {
          navigate('/driver');
        } else if (userRole === 2) {
          navigate('/user');  // Navigate to UserDash
        } else {
          setMessage('Invalid user role.');
        }
      } else {
        setMessage('Invalid credentials.');
      }
    } catch (error) {
      setMessage('Error connecting to server.');
      console.error('Login Failed:', error);
    }
  };
  

  // Handle Registration
  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/users/userregister', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, phonenumber: phone, password }),
      });

      if (response.ok) {
        setMessage('Registration successful!');
        setTimeout(() => setShowRegister(false), 2000);
      } else {
        setMessage('Registration failed.');
      }
    } catch (error) {
      setMessage('Error connecting to server.');
      console.error('Registration Failed:', error);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Card style={{ width: '400px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
        <Card.Body>
          {message && <p className="text-center text-danger">{message}</p>}
          {!showRegister ? (
            <>
              <h2 className="text-center mb-4">Login</h2>
              <Form onSubmit={handleLogin}>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label>Email address</Form.Label>
                  <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="formBasicPassword" className="mt-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>
                <Button variant="link" className="w-100 mt-2" onClick={() => navigate('/BookACarImmediately')}>
                Book A Car immediately
                </Button>

                <Button variant="success" type="submit" className="w-100 mt-4">Login</Button>
                <Button variant="primary" className="w-100 mt-2" onClick={() => setShowRegister(true)}>Register</Button>
              </Form>
            </>
          ) : (
            <>
              <h2 className="text-center mb-4">Register</h2>
              <Form onSubmit={handleRegister}>
                <Form.Group controlId="formBasicName">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control type="text" placeholder="Enter full name" value={name} onChange={(e) => setName(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="formBasicEmail" className="mt-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="formBasicPhone" className="mt-3">
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control type="tel" placeholder="Enter phone number" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </Form.Group>
                <Form.Group controlId="formBasicPassword" className="mt-3">
                  <Form.Label>Password</Form.Label>
                  <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 mt-4">Register</Button>
                <Button variant="link" className="w-100 mt-2" onClick={() => setShowRegister(false)}>Back to Login</Button>
              </Form>
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginRegister />} />
        <Route path="/admin" element={<AdminDash />} />
        <Route path="/AdminManageDrivers" element={<AdminManageDrivers />} />
        <Route path="/driver" element={<DriverDash />} />
        <Route path="/user" element={<UserDash />} />
        <Route path="/UserBookCar" element={<UserBookCar />} />
        <Route path="/AdminViewBookings" element={<AdminViewBookings />} />
        <Route path="/ViewMyBookings" element={<ViewMyBookings />} />
        <Route path="/BookingInProgress" element={<BookingInProgress />} />
        <Route path="/DriverConformedBookings" element={<DriverConformedBookings />}/>
        <Route path="/UserBookingHistory" element={<UserBookingHistory />}/>
        <Route path="/UserBookingHistory" element={<UserBookingHistory />} />
        <Route path="/DriverDash" element={<DriverDash />} />
        <Route path="/AdminManageBookings" element={<AdminManageBookings />} />
        <Route path="/AdminManageUsers" element={<AdminManageUsers />} />
        <Route path="/AdminDash" element={<AdminDash />} />
        <Route path="/BookACarImmediately" element={<BookACarImmediately />} />
        <Route path="/ViewBookingWithoutLogin" element={<ViewBookingWithoutLogin />} />
        <Route path="/UserViewNotPaidBookings" element={<UserViewNotPaidBookings />} />
        <Route path="/Earnings" element={<Earnings />} />
        
      </Routes>
    </Router>
  );
}

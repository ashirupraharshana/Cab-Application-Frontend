import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Container from 'react-bootstrap/Container';
import Card from 'react-bootstrap/Card';

function LoginSignUp() {
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
            navigate('/UserBookCar');  // Navigate to UserDash
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
    
    const handleRegister = async (event) => {
      event.preventDefault();
    
      if (!name || !email || !phone || !password) {
        setMessage("Fill all the fields.");
        return;
      }
    
      try {
        const response = await fetch('http://localhost:8080/users/userregister', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: name, email, phonenumber: phone, password }),
        });
    
        const responseText = await response.text(); // Read response as text
    
        if (response.ok) {
          if (responseText === "Email already in use!") {
            setMessage("Email already exists. Try another email.");
          } else {
            setMessage("Registration successful!");
            setTimeout(() => setShowRegister(false), 2000);
          }
        } else {
          setMessage("Registration failed.");
        }
      } catch (error) {
        setMessage("Error connecting to server.");
        console.error("Registration Failed:", error);
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
  <Form.Control
    type="tel"
    placeholder="Enter phone number"
    value={phone}
    onChange={(e) => {
      const input = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
      if (input.length <= 10) setPhone(input); // Limit to 10 digits
    }}
    maxLength={10}
  />
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

export default LoginSignUp;

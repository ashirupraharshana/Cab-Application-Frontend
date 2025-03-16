import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginSignUp from "./LoginSignup"; 
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
import DriverEarning from "./DriverEarning";
import ViewEarningFromEachDriver from "./ViewEarningFromEachDriver";
import AboutUs from "./AboutUs";
import ViewBookingAllWithoutLogin from "./ViewBookingAllWithoutLogin";
import AboutUsWithoutLogin from "./AboutUsWithoutLogin";
import AdminCancelledBoolings from "./AdminCancelledBoolings";


export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignUp />} />
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
        <Route path="/DriverEarning" element={<DriverEarning />} />
        <Route path="/ViewEarningFromEachDriver" element={<ViewEarningFromEachDriver />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/ViewBookingAllWithoutLogin" element={<ViewBookingAllWithoutLogin />} />
        <Route path="/AboutUsWithoutLogin" element={<AboutUsWithoutLogin />} />
        <Route path="/AdminCancelledBoolings" element={<AdminCancelledBoolings />} />
        
      </Routes>
    </Router>
  );
}

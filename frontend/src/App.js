import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Roomdetails from "./Components/RoomDetails/RoomDetails";
import AddRooms from "./Components/AdRooms/AddRooms";
import UpdateRooms from "./Components/UpdateRooms/UpdateRooms";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import HomeView from "./Components/HomeView/HomeView";
import Booking from "./Components/Booking/Booking";
import Profile from "./Components/Profile/Profile";
import MyBookings from "./Components/MyBookings/MyBookings";

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    
    if (token && role) {
      setUserRole(role);
      // Redirect based on role if trying to access root
      if (window.location.pathname === "/") {
        navigate(role === "manager" ? "/RoomDetails" : "/HomeView");
      }
    } else {
      // Allow access to login and register without auth
      const publicPaths = ["/Login", "/Register"];
      if (!publicPaths.includes(window.location.pathname)) {
        navigate("/Login");
      }
    }
    setAuthChecked(true);
  }, [navigate]);

  if (!authChecked) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Routes>
        <Route path="/" element={<Navigate to="/Login" />} />
        <Route path="/Login" element={<Login />} />
        <Route path="/Register" element={<Register />} />

        {/* Manager Routes */}
        {userRole === "manager" && (
          <>
            <Route path="/Roomdetails" element={<Roomdetails />} />
            <Route path="/AddRooms" element={<AddRooms />} />
            <Route path="/UpdateRooms/:id" element={<UpdateRooms />} />
          </>
        )}
        
        {/* Guest Routes */}
        {userRole === "guest" && (
          <>
            <Route path="/HomeView" element={<HomeView />} />
            <Route path="/Booking/:roomId" element={<Booking />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/MyBookings" element={<MyBookings />} />
          </>
        )}
        
        {/* Fallback for authenticated users */}
        <Route path="*" element={
          userRole === "manager" 
            ? <Navigate to="/Roomdetails" /> 
            : userRole === "guest"
            ? <Navigate to="/HomeView" />
            : <Navigate to="/Login" />
        } />
      </Routes>
    </div>
  );
}

export default App;
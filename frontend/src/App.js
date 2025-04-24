import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useNavigate } from "react-router-dom";
import Roomdetails from "./Components/RoomDetails/RoomDetails";
import AddRooms from "./Components/AdRooms/AddRooms";
import UpdateRooms from "./Components/UpdateRooms/UpdateRooms";
import Login from "./Components/Login/Login";
import HomeView from "./Components/HomeView/HomeView";
import Booking from "./Components/Booking/Booking";

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
      navigate("/Login");
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
          </>
        )}
        
        {/* Fallback for authenticated users */}
        <Route path="*" element={
          userRole === "manager" 
            ? <Navigate to="/Roomdetails" /> 
            : <Navigate to="/HomeView" />
        } />
      </Routes>
    </div>
  );
}

export default App;
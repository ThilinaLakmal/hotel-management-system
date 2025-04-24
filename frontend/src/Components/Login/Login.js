import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import Nav from "../Nav/Nav";

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const USER_CREDENTIALS = {
    manager: {
      username: "manager",
      password: "manager123",
      role: "manager",
      redirect: "/RoomDetails"
    },
    guest: {
      username: "guest",
      password: "guest123",
      role: "guest",
      redirect: "/HomeView"
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check credentials
    let authenticatedUser = null;
    for (const user in USER_CREDENTIALS) {
      if (
        credentials.username === USER_CREDENTIALS[user].username &&
        credentials.password === USER_CREDENTIALS[user].password
      ) {
        authenticatedUser = USER_CREDENTIALS[user];
        break;
      }
    }

    if (authenticatedUser) {
      localStorage.setItem("token", `${authenticatedUser.role}-auth-token`);
      localStorage.setItem("role", authenticatedUser.role);
      // Force full page reload to ensure proper navigation
      window.location.href = authenticatedUser.redirect;
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="page-container">
      <Nav />
      <div className="login-container">
        <h1>Login</h1>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="login-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
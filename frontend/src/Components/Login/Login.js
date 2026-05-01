import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email: credentials.email,
        password: credentials.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("userName", response.data.user.name);
        localStorage.setItem("userEmail", response.data.user.email);
        localStorage.setItem("userId", response.data.user.id);

        if (response.data.user.role === "manager") {
          navigate("/RoomDetails", { replace: true });
        } else {
          navigate("/HomeView", { replace: true });
        }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="login-container">
        <div className="hotel-brand">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=240&q=80"
            alt="Nature's Lake View"
            className="hotel-logo"
          />
          <h1 className="brand-name">Nature's Lake View</h1>
          <p className="brand-tagline">Experience Luxury & Tranquility</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="email"
              value={credentials.email}
              onChange={handleChange}
              required
              placeholder="Enter your email or 'manager'"
              autoComplete="email"
            />
            <label>Email</label>
            <span className="input-icon">✉️</span>
          </div>

          <div className="form-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
              autoComplete="current-password"
            />
            <label>Password</label>
            <span
              className="input-icon"
              style={{ cursor: "pointer" }}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "👁️" : "🔒"}
            </span>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={isLoading}
          >
            <div className="button-content">
              {isLoading ? (
                <>
                  <span>Signing In</span>
                  <span className="loading-dots">...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <span>→</span>
                </>
              )}
            </div>
          </button>
        </form>

        <div className="additional-links">
          <span>Don't have an account?</span>
          <Link to="/Register">Create Account</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "./Register.css";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError("");
  };

  const validateForm = () => {
    const { name, email, password, confirmPassword } = formData;

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all required fields");
      return false;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return false;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/users/register", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("role", response.data.user.role);
        localStorage.setItem("userName", response.data.user.name);
        localStorage.setItem("userEmail", response.data.user.email);
        localStorage.setItem("userId", response.data.user.id);
        navigate("/HomeView", { replace: true });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page-container">
      <div className="register-container">
        <div className="hotel-brand">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=240&q=80"
            alt="Nature's Lake View"
            className="hotel-logo"
          />
          <h1 className="brand-name">Nature's Lake View</h1>
          <p className="brand-tagline">Create Your Account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="register-form-group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              autoComplete="name"
            />
            <label>Full Name *</label>
            <span className="input-icon">👤</span>
          </div>

          <div className="register-form-group">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email address"
              autoComplete="email"
            />
            <label>Email Address *</label>
            <span className="input-icon">✉️</span>
          </div>

          <div className="register-form-group">
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter your phone number"
              autoComplete="tel"
            />
            <label>Phone Number</label>
            <span className="input-icon">📱</span>
          </div>

          <div className="register-form-group">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Create a password (min 6 characters)"
              autoComplete="new-password"
            />
            <label>Password *</label>
            <span
              className="input-icon clickable"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️" : "🔒"}
            </span>
          </div>

          <div className="register-form-group">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            <label>Confirm Password *</label>
            <span
              className="input-icon clickable"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "👁️" : "🔒"}
            </span>
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={isLoading}
          >
            <div className="button-content">
              {isLoading ? (
                <>
                  <span>Creating Account</span>
                  <span className="loading-dots">...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <span>→</span>
                </>
              )}
            </div>
          </button>
        </form>

        <div className="additional-links">
          <span>Already have an account?</span>
          <Link to="/Login">Sign In</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;

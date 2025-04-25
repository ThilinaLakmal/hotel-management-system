import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    // Clear error when user starts typing
    if (error) setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
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
      navigate(authenticatedUser.redirect, { replace: true });
    } else {
      setError("Invalid username or password. Please try again.");
    }
    
    setIsLoading(false);
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
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
              autoComplete="username"
            />
            <label>Username</label>
            <span className="input-icon">👤</span>
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
              style={{ cursor: 'pointer' }}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? '👁️' : '🔒'}
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
          <a href="#forgot-password">Forgot Password?</a>
          <span>•</span>
          <a href="#register">Create Account</a>
        </div>
      </div>
    </div>
  );
}

export default Login;
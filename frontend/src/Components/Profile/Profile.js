import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Nav/Nav";
import Footer from "../Footer/Footer";
import "./Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/Login");
        return;
      }

      const response = await axios.get("http://localhost:5000/api/users/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data.user);
      setEditData({
        name: response.data.user.name,
        phone: response.data.user.phone || ""
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/Login");
        return;
      }
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    if (!editData.name.trim()) {
      setError("Name is required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "http://localhost:5000/api/users/profile",
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data.user);
      localStorage.setItem("userName", response.data.user.name);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: user.name,
      phone: user.phone || ""
    });
    setIsEditing(false);
    setError(null);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Nav />
        <div className="profile-loading">
          <div className="loading-spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Nav />
      <div className="profile-hero">
        <div className="profile-hero-overlay"></div>
        <div className="profile-hero-content">
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>
      </div>

      <div className="profile-content">
        {successMessage && (
          <div className="profile-success-message">
            <span>✓</span> {successMessage}
          </div>
        )}
        {error && (
          <div className="profile-error-message">
            <span>⚠️</span> {error}
          </div>
        )}

        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} />
              ) : (
                <div className="avatar-placeholder">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="profile-name-section">
              <h2>{user?.name}</h2>
              <span className="profile-role-badge">
                {user?.role === "manager" ? "🏨 Manager" : "👤 Guest"}
              </span>
            </div>
          </div>

          <div className="profile-details">
            <div className="profile-section-header">
              <h3>Personal Information</h3>
              {!isEditing && user?.role !== "manager" && (
                <button
                  className="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="profile-edit-form">
                <div className="profile-form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={editData.name}
                    onChange={handleEditChange}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="profile-form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="disabled-input"
                  />
                  <span className="field-note">Email cannot be changed</span>
                </div>

                <div className="profile-form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleEditChange}
                    placeholder="Enter your phone number"
                  />
                </div>

                <div className="profile-edit-actions">
                  <button
                    className="save-profile-btn"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    className="cancel-edit-btn"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <span className="info-label">Full Name</span>
                  <span className="info-value">{user?.name}</span>
                </div>
                <div className="profile-info-item">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user?.email}</span>
                </div>
                <div className="profile-info-item">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{user?.phone || "Not provided"}</span>
                </div>
                <div className="profile-info-item">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">{formatDate(user?.createdAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="profile-quick-actions">
          <div
            className="quick-action-card"
            onClick={() => navigate("/MyBookings")}
          >
            <div className="action-icon">📋</div>
            <h3>My Bookings</h3>
            <p>View and manage your reservations</p>
          </div>
          <div
            className="quick-action-card"
            onClick={() => navigate("/HomeView")}
          >
            <div className="action-icon">🏨</div>
            <h3>Browse Rooms</h3>
            <p>Explore available rooms and suites</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Profile;

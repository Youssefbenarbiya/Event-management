import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";
import UserProfileModel from "./UserProfileModel";

function Header() {
  const [userData, setUserData] = useState({});
  const [user, setUser] = useState(null);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Assuming token is stored in localStorage

  useEffect(() => {
    if (token) {
      fetchUserData(token);
    }
  }, [token]);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch("http://localhost:9090/user", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setUserData(data);
      } else {
        console.error("Error fetching user data");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const openUserProfileModal = () => {
    const userDataFromStorage = JSON.parse(localStorage.getItem("user"));
    setUser(userDataFromStorage);
    setShowUserProfileModal(true);
  };

  const closeUserProfileModal = () => {
    setShowUserProfileModal(false);
  };

  return (
    <header>
      {/* Navbar */}
      <nav className="navbar">
        {/* Left side */}
        <div className="left">
          <span>Event management</span>
        </div>
        {/* Right side */}
        <div className="right">
          <Link to={"/dashboard"}>
            <button className="dashboard-button">Dashboard</button>
          </Link>

          <Link to="/events">
            <button className="events-button">Events</button>
          </Link>
          <Link to="/create">
            <button className="events-button">Create Event</button>
          </Link>

          <button onClick={openUserProfileModal} className="profile-button">
            My Profile
          </button>

          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>

          {userData.name && <span>{userData.name}</span>}
        </div>
      </nav>
      {/* User Profile Modal (optional implementation) */}
      {showUserProfileModal && (
        <UserProfileModel user={user} onClose={closeUserProfileModal} />
      )}
    </header>
  );
}

export default Header;

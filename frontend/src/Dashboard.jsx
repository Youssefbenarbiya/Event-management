import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { Link } from "react-router-dom";
import UserProfileModel from "./UserProfileModel";

function Dashboard() {
  const [userData, setUserData] = useState({});
  const [userEvents, setUserEvents] = useState([]);
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [user, setUser] = useState();
  const token = localStorage.getItem("token");

  const [editingEvent, setEditingEvent] = useState(null);

  const [editedFields, setEditedFields] = useState({});

  const openUserProfileModal = () => {
    const userData = JSON.parse(localStorage.getItem("user"));
    setUser(userData);
    setShowUserProfileModal(true);
  };

  const closeUserProfileModal = () => {
    setShowUserProfileModal(false);
  };


  useEffect(() => {
    if (token) {
      fetchUserData(token);

      fetchUserEvents(token);

      fetchScheduledEvents(token);
    }
  }, [token]);

  function formatDate(dateString) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  const fetchUserEvents = async (token) => {
    try {
      const response = await fetch("http://localhost:9090/event", {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserEvents(data.userEvents);
      } else {
        console.error("Failed to fetch user events.");
      }
    } catch (error) {
      console.error("Error during fetchUserEvents:", error);
    }
  };

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

  const fetchScheduledEvents = async (token) => {
    try {
      const response = await fetch("http://localhost:9090/ticket/user", {
        headers: {
          Authorization: `${token}`,
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setScheduledEvents(data.userTickets);
        console.log(data);
      } else {
        console.error("Error fetching scheduled events");
      }
    } catch (error) {
      console.error("Error fetching scheduled events:", error);
    }
  };

  const handleEditClick = (event) => {
    setEditingEvent(event);

    setEditedFields({
      title: event.title,
      description: event.description,
      date: event.date,
      venue: event.venue,
    });
  };

  const handleFieldChange = (field, value) => {
    setEditedFields({
      ...editedFields,
      [field]: value,
    });
  };

  const handleSaveClick = async () => {
    try {
      const response = await fetch(
        `http://localhost:9090/event/${editingEvent._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editedFields),
        }
      );

      if (response.ok) {
        setUserEvents((prevUserEvents) =>
          prevUserEvents.map((event) =>
            event.id === editingEvent.id ? { ...event, ...editedFields } : event
          )
        );

        setEditingEvent(null);
        setEditedFields({});

        window.location.reload();
      } else {
        console.error("Failed to update event.");
      }
    } catch (error) {
      console.error("Error during event update:", error);
    }
  };

  const handleDeleteClick = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:9090/event/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `${token}`,
        },
      });

      if (response.ok) {
        setUserEvents((prevUserEvents) =>
          prevUserEvents.filter((event) => event.id !== eventId)
        );

        window.location.reload();
      } else {
        console.error("Failed to delete event.");
      }
    } catch (error) {
      console.error("Error during event deletion:", error);
    }
  };

  const handleCancelEventClick = async (eventId) => {
    try {
      const response = await fetch(`http://localhost:9090/ticket/${eventId}`, {
        method: "DELETE",
        headers: {
          Authorization: `${token}`,
        },
      });

      if (response.ok) {
        setScheduledEvents((prevScheduledEvents) =>
          prevScheduledEvents.filter((ticket) => ticket.event?.id !== eventId)
        );

        window.location.reload();
      } else {
        console.error("Failed to cancel event.");
      }
    } catch (error) {
      console.error("Error during event cancellation:", error);
    }
  };

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        {/* Left side */}
        <div className="left">
        <span>Event management</span>   
        </div>
        {/* Right side */}
        <div className="right">
        <Link to={"/dashboard"}><button className="dashboard-button">Dashboard</button></Link>

          <Link to="/events">
            <button className="events-button">
              Events
            </button>
          </Link>
          <Link to='/create'><button className="events-button">Create Event</button></Link>
        
            <button onClick={openUserProfileModal} className="profile-button">My Profile</button>

          <span>{userData.name}</span>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="left-div">
          <h1>My Events</h1>
          {userEvents.length === 0 ? (
            <p>No events available.</p>
          ) : (
            userEvents.map((event) => (
              <div key={event.id} className="event-item">
                {event === editingEvent ? (
                  <>
                    <input
                      type="text"
                      value={editedFields.title || ""}
                      onChange={(e) =>
                        handleFieldChange("title", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      value={editedFields.description || ""}
                      onChange={(e) =>
                        handleFieldChange("description", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      value={editedFields.date || ""}
                      onChange={(e) =>
                        handleFieldChange("date", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      value={editedFields.venue || ""}
                      onChange={(e) =>
                        handleFieldChange("venue", e.target.value)
                      }
                    />
                    <button onClick={handleSaveClick}>Save</button>
                  </>
                ) : (
                  <>
                    <h3>{event.title ? event.title : "No Title"}</h3>
                    <p className="first-p">
                      {event.description ? event.description : "No Description"}
                    </p>
                    <p className="second-p">
                      On {event.date ? formatDate(event.date) : "No Date"}
                    </p>
                    <p className="third-p">
                      Venue : {event.venue ? event.venue : "No Venue"}
                    </p>
                    <p className="third-p">
                      price : $ {event.price ? event.price : "No Price"}
                    </p>
                    <div className="but-div">
                      <button
                        className="Edit"
                        onClick={() => handleEditClick(event)}
                      >
                        Edit
                      </button>
                      <button
                        className="Delete"
                        onClick={() => handleDeleteClick(event._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="right-div">
          <h1>My Scheduled Events</h1>
          {scheduledEvents.length === 0 ? (
            <p>No scheduled events available.</p>
          ) : (
            scheduledEvents.map((ticket) => (
              <div key={ticket.event?.id} className="event-item">
                <p>ticket</p>
                <h3>{ticket.event?.title}</h3>
                <p className="first-p">{ticket.event?.description}</p>
                <p className="second-p">
                  {ticket.event?.date
                    ? formatDate(ticket.event.date)
                    : "No Date"}
                </p>
                <button
                  className="Cancel"
                  onClick={() => handleCancelEventClick(ticket._id)}
                >
                  Cancel Event
                </button>
              </div>
            ))
          )}

          {showUserProfileModal && (
        <UserProfileModel
          user={user}
          onClose={closeUserProfileModal}
        />
      )}
        </div>
      </div>
      
    </div>
  );
}

export default Dashboard;

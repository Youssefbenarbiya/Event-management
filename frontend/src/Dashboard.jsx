import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import Header from "./Navbar";

function Dashboard() {
  const [userEvents, setUserEvents] = useState([]);
  const [scheduledEvents, setScheduledEvents] = useState([]);
  const token = localStorage.getItem("token");

  const [editingEvent, setEditingEvent] = useState(null);
  const [editedFields, setEditedFields] = useState({});
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (token) {
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
      startDate: event.startDate,
      finishDate: event.finishDate,
      venue: event.venue,
      price: event.price,
    });
  };

  const handleFieldChange = (field, value) => {
    setEditedFields({
      ...editedFields,
      [field]: value,
    });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSaveClick = async () => {
    const formData = new FormData();
    formData.append("title", editedFields.title);
    formData.append("description", editedFields.description);
    formData.append("startDate", editedFields.startDate);
    formData.append("finishDate", editedFields.finishDate);
    formData.append("venue", editedFields.venue);
    formData.append("price", editedFields.price);
    if (image) {
      formData.append("image", image);
    }

    try {
      const response = await fetch(
        `http://localhost:9090/event/${editingEvent._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        setUserEvents((prevUserEvents) =>
          prevUserEvents.map((event) =>
            event._id === editingEvent._id
              ? { ...event, ...editedFields }
              : event
          )
        );

        setEditingEvent(null);
        setEditedFields({});
        setImage(null);

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
          prevUserEvents.filter((event) => event._id !== eventId)
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
          prevScheduledEvents.filter((ticket) => ticket.event?._id !== eventId)
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
      <Header />
      <div className="dashboard-content">
        <div className="left-div">
          <h1>My Events</h1>
          {userEvents.length === 0 ? (
            <p>No events available.</p>
          ) : (
            userEvents.map((event) => (
              <div key={event._id} className="event-item">
                {event === editingEvent ? (
                  <>
                    <input
                      type="text"
                      value={editedFields.title || ""}
                      onChange={(e) =>
                        handleFieldChange("title", e.target.value)
                      }
                    />
                    <textarea
                      value={editedFields.description || ""}
                      onChange={(e) =>
                        handleFieldChange("description", e.target.value)
                      }
                    />
                    <input
                      type="date"
                      value={editedFields.startDate || ""}
                      onChange={(e) =>
                        handleFieldChange("startDate", e.target.value)
                      }
                    />
                    <input
                      type="date"
                      value={editedFields.finishDate || ""}
                      onChange={(e) =>
                        handleFieldChange("finishDate", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      value={editedFields.venue || ""}
                      onChange={(e) =>
                        handleFieldChange("venue", e.target.value)
                      }
                    />
                    <input
                      type="number"
                      value={editedFields.price || ""}
                      onChange={(e) =>
                        handleFieldChange("price", e.target.value)
                      }
                    />
                    <input type="file" onChange={handleImageChange} />
                    <button onClick={handleSaveClick}>Save</button>
                  </>
                ) : (
                  <>
                    <h3>{event.title ? event.title : "No Title"}</h3>
                    <p className="first-p">
                      {event.description ? event.description : "No Description"}
                    </p>
                    <p className="second-p">
                      Start Date:{" "}
                      {event.startDate
                        ? formatDate(event.startDate)
                        : "No Date"}
                    </p>
                    <p className="second-p">
                      End Date:{" "}
                      {event.finishDate
                        ? formatDate(event.finishDate)
                        : "No Date"}
                    </p>
                    <p className="third-p">
                      Venue: {event.venue ? event.venue : "No Venue"}
                    </p>
                    <p className="third-p">
                      Price: ${event.price ? event.price : "No Price"}
                    </p>
                    <img
                      src={`http://localhost:9090/uploads/${event.image}`}
                      alt={event.title}
                      className="event-image"
                    />
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
              <div key={ticket.event?._id} className="event-item">
                <h3>{ticket.event?.title}</h3>
                <p className="first-p">{ticket.event?.description}</p>
                <p className="second-p">
                  Start Date:{" "}
                  {ticket.event?.startDate
                    ? formatDate(ticket.event.startDate)
                    : "No Date"}
                </p>
                <p className="second-p">
                  End Date:{" "}
                  {ticket.event?.finishDate
                    ? formatDate(ticket.event.finishDate)
                    : "No Date"}
                </p>
                <p className="third-p">
                  Venue: {ticket.event?.venue ? ticket.event.venue : "No Venue"}
                </p>
                <p className="third-p">
                  Price: $
                  {ticket.event?.price ? ticket.event.price : "No Price"}
                </p>
                <img
                  src={`http://localhost:9090/uploads/${ticket.event?.image}`}
                  alt={ticket.event?.title}
                  className="event-image"
                />
                <button
                  className="Cancel"
                  onClick={() => handleCancelEventClick(ticket._id)}
                >
                  Cancel Event
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

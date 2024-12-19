import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CreateEvent.css";
import Header from "./Navbar";

function CreateEvent() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [finishDate, setFinishDate] = useState("");
  const [venue, setVenue] = useState("");
  const [price, setPrice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

const handleCreateEvent = async (e) => {
  e.preventDefault();
  try {
    setIsLoading(true);

    const eventData = {
      title,
      description,
      startDate,
      finishDate,
      venue,
      price,
    };

    const response = await fetch(
      "https://event-management-zeta-neon.vercel.app/event/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${token}`,
        },
        body: JSON.stringify(eventData),
      }
    );

    if (response.ok) {
      alert("Event created successfully!");
      navigate("/dashboard");
    } else {
      const errorResponse = await response.json(); // Capture error response
      alert(
        `Failed to create event: ${errorResponse.error || "Unknown error"}`
      );
      console.error("Failed to create event:", errorResponse);
    }
  } catch (error) {
    alert("Error creating event.");
    console.error("Error creating event:", error);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <div className="create-event">
      <Header />
      <div className={`create-event-form ${isLoading ? "loading" : ""}`}>
        <h2>Create Event</h2>
        <form onSubmit={handleCreateEvent} encType="multipart/form-data">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
          <input
            type="date"
            placeholder="Start Date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <input
            type="date"
            placeholder="Finish Date"
            value={finishDate}
            onChange={(e) => setFinishDate(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Venue"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
          {isLoading ? (
            <div className="spinner"></div>
          ) : (
            <button type="submit">Create Event</button>
          )}
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;

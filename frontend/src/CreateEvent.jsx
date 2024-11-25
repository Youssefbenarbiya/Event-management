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
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Function to handle image file selection
  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // Prepare FormData for file upload
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("startDate", startDate);
      formData.append("finishDate", finishDate);
      formData.append("venue", venue);
      formData.append("price", price);
      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("http://localhost:9090/event/create", {
        method: "POST",
        headers: {
          Authorization: `${token}`,
        },
        body: formData,
      });

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
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
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

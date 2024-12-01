const express = require("express");
const eventRouter = express.Router();
const Event = require("../models/event");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Setup Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Store files in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add a unique timestamp to filenames
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only images are allowed."));
    }
  },
});

eventRouter.post(
  "/create",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    const { title, description, startDate, finishDate, venue, price } =
      req.body;
    const image = req.file ? req.file.filename : ""; // Store only the filename

    try {
      const newEvent = new Event({
        title,
        description,
        startDate,
        finishDate,
        venue,
        organizer: req.userId,
        price,
        image, // Store just the filename
      });
      await newEvent.save();
      res
        .status(201)
        .json({ message: "Event created successfully.", event: newEvent });
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ error: "Event creation failed. Please try again later." });
    }
  }
);

// Retrieve all events with pagination
eventRouter.get("/all", async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  try {
    const allEvents = await Event.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.status(200).send(allEvents);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "Failed to retrieve events." });
  }
});

// Retrieve events for a specific organizer
eventRouter.get("/", authMiddleware, async (req, res) => {
  try {
    const userEvents = await Event.find({ organizer: req.userId });
    res.status(200).json({ userEvents });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Event retrieval failed. Please try again later." });
  }
});

// Update an event by ID
eventRouter.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  async (req, res) => {
    const eventId = req.params.id;
    const { title, description, startDate, finishDate, venue, price } =
      req.body;
    const image = req.file ? req.file.filename : null;

    try {
      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).json({ error: "Event not found." });
      }

      if (event.organizer.toString() !== req.userId) {
        return res
          .status(403)
          .json({ error: "You do not have permission to update this event." });
      }

      event.title = title || event.title;
      event.description = description || event.description;
      event.startDate = startDate || event.startDate;
      event.finishDate = finishDate || event.finishDate;
      event.venue = venue || event.venue;
      event.price = price || event.price;

      if (image) {
        // Delete the old image file if a new one is uploaded
        if (event.image) {
          fs.unlinkSync(path.join(__dirname, "../uploads", event.image));
        }
        event.image = image;
      }

      await event.save();

      res.status(200).json({ message: "Event updated successfully.", event });
    } catch (err) {
      console.error(err.message);
      res
        .status(500)
        .json({ error: "Event update failed. Please try again later." });
    }
  }
);

// Delete an event by ID
eventRouter.delete("/:id", authMiddleware, async (req, res) => {
  const eventId = req.params.id;

  try {
    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    if (event.organizer.toString() !== req.userId) {
      return res.status(403).json({ error: "You cannot delete this event." });
    }

    // Delete the image file associated with the event
    if (event.image) {
      fs.unlinkSync(path.join(__dirname, "../uploads", event.image));
    }

    await Event.findByIdAndDelete(eventId);

    res.status(200).json({ message: "Event deleted successfully." });
  } catch (err) {
    console.error(err.message);
    res
      .status(500)
      .json({ error: "Event deletion failed. Please try again later." });
  }
});

const app = express();
// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
//app.use("/uploads", express.static(path.join(__dirname, "uploads")));
//app.use("/uploads", express.static(path.join(__dirname, "routes", "uploads")));



// Serve static files from the uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));



// Use event routes
app.use("/event", eventRouter);



module.exports = eventRouter;

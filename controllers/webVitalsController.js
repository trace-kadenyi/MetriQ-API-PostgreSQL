const WebVital = require("../models/WebVital");

// Create a new entry
const createEntry = async (req, res) => {
  try {
    const { pageName, url, metrics } = req.body;

    const newWebVital = new WebVital({
      pageName,
      url,
      metrics,
    });

    const savedWebVital = await newWebVital.save();
    res.status(201).json(savedWebVital);
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to save data", details: err.message });
  }
};

// get all entries
const getEntries = async (req, res) => {
  try {
    const webVitals = await WebVital.find();
    res.status(200).json(webVitals);
  } catch (err) {
    res.status(500).json({
      error: "Failed to fetch data",
      details: err.message,
    });
  }
};
// Get a specific entry by ID
const getEntry = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the document by its ID
    const webVital = await WebVital.findById(id);

    // If no document is found, return a 404
    if (!webVital) {
      return res.status(404).json({ error: "No data found for this ID" });
    }

    // Return the document
    res.status(200).json(webVital);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    res
      .status(500)
      .json({ error: "Failed to fetch data", details: err.message });
  }
};

// Update a specific entry by ID
const updateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const { metrics } = req.body; // assuming you're only updating the metrics field

    // Find the document by ID
    const webVital = await WebVital.findById(id);

    // If no document is found, return a 404
    if (!webVital) {
      return res.status(404).json({ error: "No data found for this ID" });
    }

    // Update only the metrics field
    webVital.metrics = metrics;

    // Save the updated document
    const updatedWebVital = await webVital.save();

    res.status(200).json(updatedWebVital);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(400).json({ error: "Invalid ID format" });
    }
    res
      .status(500)
      .json({ error: "Failed to update data", details: err.message });
  }
};

module.exports = {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
};

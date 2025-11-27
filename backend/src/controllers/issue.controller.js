import Issue from "../models/Issue.js";
import { classifyImage } from "../utils/aiClassifier.js";

export const createIssue = async (req, res) => {
  try {
    const { title, description, lat, lng, address } = req.body;

    // Uploaded Image
    const imageFile = req.files?.image;
    let imageUrl = "";
    if (imageFile) {
      imageUrl = `/uploads/${Date.now()}_${imageFile.name}`;
      imageFile.mv("." + imageUrl);
    }

    // AI Classification (Mocked or Real)
    // const category = await classifyImage("." + imageUrl);
    const category = "General"; // Fallback if AI fails or not implemented fully

    // Determine City from Coordinates (Mock Logic for Demo)
    // In a real app, use Google Maps Geocoding API or OpenStreetMap
    const city = getCityFromCoordinates(lat, lng);

    const issue = await Issue.create({
      userId: req.user.id,
      title,
      description,
      imageUrl,
      category,
      gps: { lat, lng, address },
      city: city
    });

    res.json({ message: "Issue reported", issue });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Mock Reverse Geocoding
const getCityFromCoordinates = (lat, lng) => {
  // Simple mock logic based on ranges or just random for demo
  // Ideally, the frontend sends the city, or we use a real API.
  // For this demo, let's assume if lat > 40 it's "New York", else "Los Angeles"
  // Or better, just default to "New York" for the demo flow unless specified.

  // If the user provided an address string containing a city, we could parse it.
  // But let's just default to "New York" for the primary demo case.
  return "New York";
};

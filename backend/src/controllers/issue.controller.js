import Issue from "../models/Issue.js";
import { classifyImage } from "../utils/aiClassifier.js";

export const createIssue = async (req, res) => {
  try {
    const { title, description, lat, lng, address } = req.body;

    // Uploaded Image
    const imageFile = req.files?.image;
    const imageUrl = `/uploads/${Date.now()}_${imageFile.name}`;
    imageFile.mv("." + imageUrl);

    // AI Classification
    const category = await classifyImage("." + imageUrl);

    const issue = await Issue.create({
      userId: req.user.id,
      title,
      description,
      imageUrl,
      category,
      gps: { lat, lng, address },
    });

    res.json({ message: "Issue reported", issue });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

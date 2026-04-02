import jwt from "jsonwebtoken";
import keys from "../config/keys.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token)
    return res.status(401).json({ message: "No token, unauthorized" });

  try {
    const decoded = jwt.verify(token, keys.jwtSecret);

    // Fetch full user to get city and other details
    // We need to dynamically import User to avoid circular dependencies if any, 
    // but standard import at top is better. 
    // Since this file doesn't import User yet, we need to add the import.
    // I will use a separate tool call to add the import first or just rewrite the file.
    // Actually, I'll just rewrite the whole file to be safe and clean.
    const user = await import("../models/User.js").then(m => m.default.findById(decoded.id).select("-password"));

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid Token" });
  }
};

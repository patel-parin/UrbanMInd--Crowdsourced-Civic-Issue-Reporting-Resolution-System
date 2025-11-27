// dummy AI — replace with real model later

export const classifyImage = async (imagePath) => {
  console.log("AI classifying:", imagePath);

  // Temporary categories
  const categories = ["garbage", "pothole", "water leakage", "streetlight"];
  return categories[Math.floor(Math.random() * categories.length)];
};

import User from "../models/User.js";

// Get gamification leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const { city } = req.query;
    
    let query = { role: 'citizen', impactPoints: { $gt: 0 } };
    if (city && city !== 'Unknown') {
      query.city = { $regex: new RegExp(city, 'i') };
    }

    const users = await User.find(query)
      .select('name city impactPoints citizenLevel')
      .sort({ impactPoints: -1 })
      .limit(50);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      city: user.city,
      points: user.impactPoints || 0,
      level: user.citizenLevel || 1,
    }));

    res.json(leaderboard);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get user's own gamification stats
export const getMyGamificationStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('name city impactPoints citizenLevel');
    if (!user) return res.status(404).json({ message: "User not found" });

    // Get user's rank
    const higherRanked = await User.countDocuments({
      role: 'citizen',
      impactPoints: { $gt: user.impactPoints || 0 }
    });

    res.json({
      name: user.name,
      city: user.city,
      points: user.impactPoints || 0,
      level: user.citizenLevel || 1,
      rank: higherRanked + 1,
      nextLevelPoints: ((user.citizenLevel || 1) * 100),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

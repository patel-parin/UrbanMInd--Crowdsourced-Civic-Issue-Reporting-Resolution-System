import Contractor from "../models/Contractor.js";
import Issue from "../models/Issue.js";
import User from "../models/User.js";
import Assignment from "../models/Assignment.js";

export const getAllContractors = async (req, res) => {
  try {
    // Self-healing: Ensure all users with role 'contractor' have a Contractor document
    const contractorUsers = await User.find({ role: "contractor" });
    for (const user of contractorUsers) {
      const exists = await Contractor.findOne({ userId: user._id });
      if (!exists) {
        await Contractor.create({
          companyName: user.name,
          userId: user._id,
          rating: 0,
          completedTasks: 0,
          efficiency: 0,
          costPerTask: 0
        });
      }
    }

    const { sortBy } = req.query;
    let sortOptions = {};

    if (sortBy === "rating") sortOptions = { rating: -1 };
    else if (sortBy === "efficiency") sortOptions = { efficiency: -1 };
    else if (sortBy === "cost") sortOptions = { costPerTask: 1 };
    else sortOptions = { createdAt: -1 };

    const contractors = await Contractor.find()
      .populate("userId", "name email")
      .sort(sortOptions);

    res.json(contractors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAssignedTasks = async (req, res) => {
  try {
    const contractor = await Contractor.findOne({ userId: req.user.id });
    if (!contractor) {
      return res.status(404).json({ message: "Contractor profile not found" });
    }

    const tasks = await Issue.find({ contractorId: contractor._id }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { assignmentId, status } = req.body;

    const updatedIssue = await Issue.findByIdAndUpdate(
      assignmentId,
      { status },
      { new: true }
    );

    if (status === 'resolved') {
      const contractor = await Contractor.findOne({ _id: updatedIssue.contractorId });

      if (contractor) {
        // Recalculate metrics
        const completedIssues = await Issue.find({
          contractorId: contractor._id,
          status: 'resolved'
        });

        const totalTasks = completedIssues.length;
        const totalEarnings = completedIssues.reduce((sum, issue) => sum + (issue.fundAmount || 0), 0);

        // Update stats
        contractor.completedTasks = totalTasks;
        contractor.costPerTask = totalTasks > 0 ? Math.round(totalEarnings / totalTasks) : 0;

        // Simulate Rating (4.0 - 5.0) and Efficiency (85% - 100%) for demo purposes
        // In a real app, these would come from user reviews and time tracking
        const newRating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
        const newEfficiency = Math.floor(Math.random() * (100 - 85) + 85);

        // Weighted average for smoother updates (optional, but let's just set it for now to show immediate change)
        contractor.rating = parseFloat(newRating);
        contractor.efficiency = newEfficiency;

        await contractor.save();
      }
    }

    res.json({ message: "Task updated", updated: updatedIssue });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const getContractorProfile = async (req, res) => {
  try {
    const contractor = await Contractor.findOne({ userId: req.user.id }).populate('userId', 'name email');
    if (!contractor) {
      return res.status(404).json({ message: "Contractor profile not found" });
    }
    res.json(contractor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

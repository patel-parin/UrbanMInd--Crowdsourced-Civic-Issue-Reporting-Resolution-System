import Issue from "../models/Issue.js";
import User from "../models/User.js";

export const getAllContractors = async (req, res) => {
  try {
    const { sortBy } = req.query;
    let sortOptions = {};

    if (sortBy === "rating") sortOptions = { rating: -1 };
    else if (sortBy === "efficiency") sortOptions = { efficiency: -1 };
    else if (sortBy === "cost") sortOptions = { costPerTask: 1 };
    else sortOptions = { createdAt: -1 };

    const contractors = await User.find({ role: "contractor" })
      .select("-password") // Exclude password
      .sort(sortOptions);

    res.json(contractors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getAssignedTasks = async (req, res) => {
  try {
    const contractor = await User.findById(req.user.id);
    if (!contractor || contractor.role !== 'contractor') {
      return res.status(404).json({ message: "Contractor profile not found" });
    }

    // Return tasks specifically assigned to this contractor
    const query = { contractorId: contractor._id };

    const tasks = await Issue.find(query).sort({ createdAt: -1 });
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
      const contractor = await User.findById(updatedIssue.contractorId);

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

        // Simulate Rating (4.0 - 5.0) and Efficiency (85% - 100%) for demo
        const newRating = (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1);
        const newEfficiency = Math.floor(Math.random() * (100 - 85) + 85);

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
    const contractor = await User.findById(req.user.id).select("-password");
    if (!contractor) {
      return res.status(404).json({ message: "Contractor profile not found" });
    }
    res.json(contractor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

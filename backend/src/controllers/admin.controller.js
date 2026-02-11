import Issue from "../models/Issue.js";
import Contractor from "../models/Contractor.js";
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";


export const getAdminStats = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'superadmin';
    const adminCity = req.user.city;

    let query = {};

    if (!isSuperAdmin) {
      if (adminCity && adminCity !== 'Unknown') {
        query.city = adminCity;
      } else {
        // If not superadmin and no valid city, return zero stats
        return res.json({
          totalIssues: 0,
          openIssues: 0,
          resolvedIssues: 0,
          activeContractors: 0
        });
      }
    }

    const totalIssues = await Issue.countDocuments(query);

    // Open issues = anything not resolved or closed
    const openIssues = await Issue.countDocuments({
      ...query,
      status: { $nin: ["resolved", "closed"] }
    });

    const resolvedIssues = await Issue.countDocuments({
      ...query,
      status: "resolved"
    });

    const contractorQuery = { role: "contractor" };
    if (!isSuperAdmin && adminCity) contractorQuery.city = adminCity;

    const activeContractors = await User.countDocuments(contractorQuery);

    res.json({
      totalIssues,
      openIssues,
      resolvedIssues,
      activeContractors,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getContractors = async (req, res) => {
  try {
    const isSuperAdmin = req.user.role === 'superadmin';
    const adminCity = req.user.city;

    // Build query for Contractors based on their linked User's city
    // This is slightly complex because city is on the User model.
    // Simpler approach: Fetch all contractors, populate user, then filter.

    let contractors = await Contractor.find().populate('userId', 'name email city role');

    if (!isSuperAdmin) {
      if (adminCity && adminCity !== 'Unknown') {
        contractors = contractors.filter(c => c.userId && c.userId.city === adminCity);
      } else {
        return res.json([]);
      }
    }

    // Calculate metrics for each contractor
    const contractorsWithMetrics = await Promise.all(contractors.map(async (contractor) => {
      const issues = await Issue.find({ contractorId: contractor._id });

      const totalAssigned = issues.length;
      const completedTasks = issues.filter(i => i.status === 'resolved' || i.status === 'closed').length;

      // Calculate Efficiency
      let efficiency = 0;
      if (totalAssigned > 0) {
        efficiency = Math.round((completedTasks / totalAssigned) * 100);
      }

      // Calculate Avg Cost
      let totalCost = 0;
      issues.forEach(i => {
        if (i.status === 'resolved' || i.status === 'closed') {
          totalCost += (i.fundAmount || 0);
        }
      });
      const costPerTask = completedTasks > 0 ? Math.round(totalCost / completedTasks) : 0;

      // Calculate Rating (Mock formula: Base 4.0 + efficiency bonus)
      // Cap at 5.0
      let rating = 0;
      if (totalAssigned > 0) {
        rating = 4.0 + (efficiency / 100);
        if (rating > 5.0) rating = 5.0;
      }

      const isActive = issues.some(i => i.status === 'in_progress');

      return {
        _id: contractor._id,
        companyName: contractor.companyName,
        email: contractor.userId?.email,
        name: contractor.userId?.name,
        efficiency,
        rating,
        completedTasks,
        costPerTask,
        isActive
      };
    }));

    res.json(contractorsWithMetrics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const assignToContractor = async (req, res) => {
  try {
    const { issueId, contractorId } = req.body;

    await Issue.findByIdAndUpdate(issueId, { status: "assigned", contractorId });

    const assign = await Assignment.create({
      issueId,
      contractorId,
      status: "assigned",
    });

    res.json({ message: "Contractor Assigned", assign });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


export const resetUserPassword = async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ message: "User ID and new password are required" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Password reset successfully" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
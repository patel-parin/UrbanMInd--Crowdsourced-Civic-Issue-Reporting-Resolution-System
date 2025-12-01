import Issue from "../models/Issue.js";
import Assignment from "../models/Assignment.js";
import User from "../models/User.js";


export const getAdminStats = async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    // Open issues = anything not resolved or closed
    const openIssues = await Issue.countDocuments({
      status: { $nin: ["resolved", "closed"] }
    });
    const resolvedIssues = await Issue.countDocuments({ status: "resolved" });
    const activeContractors = await User.countDocuments({ role: "contractor" });

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
    const adminCity = req.user.city;
    let query = { role: 'contractor' };

    // If admin has a city (City Admin), only show contractors in that city
    // If Super Admin (no city or special flag), might see all? 
    // Assuming City Admin logic here.
    if (adminCity) {
      query.city = adminCity;
    }

    const contractors = await User.find(query).select('-password');
    res.json(contractors);
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

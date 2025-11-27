import Issue from "../models/Issue.js";
import Assignment from "../models/Assignment.js";

export const assignToContractor = async (req, res) => {
  try {
    const { issueId, contractorId } = req.body;

    await Issue.findByIdAndUpdate(issueId, { status: "assigned" });

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

import Assignment from "../models/Assignment.js";

export const updateTaskStatus = async (req, res) => {
  try {
    const { assignmentId, status } = req.body;

    const updated = await Assignment.findByIdAndUpdate(
      assignmentId,
      { status },
      { new: true }
    );

    res.json({ message: "Task updated", updated });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

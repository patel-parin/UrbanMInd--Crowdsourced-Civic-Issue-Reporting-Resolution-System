export const superAdminOnly = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    return res.status(403).json({
      message: "Access denied. Only Super Admin can do this.",
    });
  }

  next();
};

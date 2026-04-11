function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

module.exports = (...allowedRoles) => {
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  return (req, res, next) => {
    try {
      const userRole = normalizeRole(req.user?.role);

      if (!userRole) {
        return res.status(401).json({ msg: "User role not found in token" });
      }

      if (!normalizedAllowedRoles.includes(userRole)) {
        return res.status(403).json({ msg: "Access denied: insufficient permissions" });
      }

      next();
    } catch (err) {
      return res.status(500).json({ msg: "Server error" });
    }
  };
};

const jwt = require("jsonwebtoken");

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ msg: "Authorization token is required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      ...decoded,
      role: normalizeRole(decoded.role)
    };

    next();
  } catch (error) {
    return res.status(401).json({ msg: "Invalid or expired token" });
  }
};

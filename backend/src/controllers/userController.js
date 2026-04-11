const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.createStaffUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedRole = String(role || "").trim().toLowerCase();

    if (!normalizedEmail || !password || !normalizedRole) {
      return res.status(400).json({ msg: "Email, password and role are required" });
    }

    if (!["waiter", "kitchen"].includes(normalizedRole)) {
      return res.status(400).json({ msg: "Role must be waiter or kitchen" });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const derivedName = normalizedEmail.split("@")[0];

    const user = await User.create({
      name: derivedName,
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole
    });

    return res.status(201).json({
      msg: "Staff user created successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("CREATE STAFF USER ERROR:", error.message);
    return res.status(500).json({ msg: "Error creating staff user" });
  }
};

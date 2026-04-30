const User = require("../models/UserSchema");

// get theme
const getTheme = async (req, res) => {
  if (!req.user || !req.isAuthenticated()) {
    return res.json({ theme: null }); // anonymous
  }
  return res.json({ theme: req.user.theme || "light" });
};

// patch theme
const patchTheme = async (req, res) => {
  if (!req.user || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  const { theme } = req.body;
  if (!["light", "dark"].includes(theme))
    return res.status(400).json({ message: "Invalid theme" });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { theme },
    { new: true }
  );
  res.json({ success: true, theme: user.theme });
};

module.exports = { getTheme, patchTheme };

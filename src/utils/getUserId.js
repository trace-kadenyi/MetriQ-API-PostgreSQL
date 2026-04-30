const getUserId = (req) => {
  if (req.user && req.isAuthenticated()) {
    return req.user._id || req.user.id; // whichever is present
  }
  return req.header("x-anon-id") || null; // fallback to anon user
};

module.exports = { getUserId };

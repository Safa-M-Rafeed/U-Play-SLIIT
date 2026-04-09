const jwt = require("jsonwebtoken");

const sessionMiddleware = (req, res, next) => {
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ success: false, message: "No session found" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.clearCookie("token");
    return res.status(401).json({ success: false, message: "Session expired" });
  }
};

module.exports = sessionMiddleware;

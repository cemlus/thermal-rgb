const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
dotenv.config()


function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
    // attach payload to request
    req.user = payload;
    next();
  });
}

module.exports = authMiddleware
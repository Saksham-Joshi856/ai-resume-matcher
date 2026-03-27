const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const jwtSecret = process.env.JWT_SECRET || "secretkey";
        const decoded = jwt.verify(token, jwtSecret);

        req.userId = decoded.id;

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
};

module.exports = authMiddleware;

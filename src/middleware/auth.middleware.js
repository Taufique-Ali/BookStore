

import {verifyAccessToken} from "../utils/jwt.util.js";

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1]; // Assuming the format is "Bearer <token>"
    if (!token) {
        return res.status(401).json({ message: 'Token missing' });
    }

    try {
        const decoded = verifyAccessToken(token);
        req.user = decoded; // Attach the decoded user info to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default authMiddleware;
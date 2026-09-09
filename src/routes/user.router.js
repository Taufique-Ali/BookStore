
import express from "express";
import {
    registerUser,
    getUserByEmail,
    loginUser,
    refreshToken,
    logoutUser,
} from "../controllers/user.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";


const router = express.Router();


router.post("/register", registerUser);
router.get("/:email", authMiddleware, getUserByEmail);

router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logoutUser);

export default router;
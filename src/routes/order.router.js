import express from "express";
import { createOrder, getOrderById} from "../controllers/order.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/createOrder", authMiddleware, createOrder);
router.get("/getOrderById/:orderId", authMiddleware, getOrderById);


export default router;

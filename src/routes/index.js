import express from "express";

import userRouter from "./user.router.js";
import bookRouter from "./book.router.js";
import orderRouter from "./order.router.js";

const router = express.Router();

router.use("/user", userRouter);
router.use("/book", bookRouter);
router.use("/order", orderRouter);

export default router;

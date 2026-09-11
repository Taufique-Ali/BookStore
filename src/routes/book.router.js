import express from "express";

const router = express.Router();

import {
    createBook,
    getAllBooks,
    getBookById,
    getBookListPdf,
    updateBook,
    deleteBook
} from "../controllers/book.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

router.post("/",authMiddleware, createBook);
router.get("/",authMiddleware, getAllBooks);
router.get("/pdf/list", authMiddleware, getBookListPdf);
router.get("/:id", authMiddleware, getBookById);
router.put("/:id", authMiddleware, updateBook);
router.delete("/:id", authMiddleware, deleteBook);

export default router;
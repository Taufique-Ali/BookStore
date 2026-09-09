import { BookService } from "../services/index.js";

const createBook = async (req, res) => {
    try {
        const { title, author, genre, published_year, summary, isbn, available_copies, mrp, price, discount, language } = req.body;
        const shop_id = req.user.userId; // Assuming the user ID is available in req.user after authentication

        if (!title || !author || !genre || !published_year || !summary || !isbn ||
            available_copies == null || available_copies < 0 ||
            mrp <= 0 || price <= 0 ||
            discount == null || !language) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        if (price > mrp) {
            return res.status(400).json({ message: 'Price cannot be greater than MRP' });
        }
        if (discount > 100 || discount < 0) {
            return res.status(400).json({ message: 'Discount must be between 0 and 100' });
        }
        if (!['English', 'Spanish', 'French', 'German', 'Hindi', 'Other'].includes(language)) {
            return res.status(400).json({ message: 'Invalid language' });
        }

        const bookId = await BookService.createBook({ title, author, genre, published_year, summary, isbn, available_copies, mrp, price, discount, language, shop_id });
        res.status(201).json({ message: 'Book created successfully', bookId });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

const getBookById = async (req, res) => {
    try {
        const { bookId } = req.params;
        if (!bookId) {
            return res.status(400).json({ message: 'Book ID is required' });
        }

        const book = await BookService.getBookById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({ book });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

const getAllBooks = async (req, res) => {
    try {
        const userId = req.user.userId; // Assuming the user ID is available in req.user after authentication
        const books = await BookService.getAllBooks(userId);
        res.status(200).json({ books });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

const updateBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const updatedFields = req.body;

        if (!bookId) {
            return res.status(400).json({ message: 'Book ID is required' });
        }

        const updated = await BookService.updateBook(bookId, updatedFields);
        if (!updated) {
            return res.status(404).json({ message: 'Book not found or no changes made' });
        }

        res.status(200).json({ message: 'Book updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

const deleteBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        if (!bookId) {
            return res.status(400).json({ message: 'Book ID is required' });
        }

        const deleted = await BookService.deleteBook(bookId);
        if (!deleted) {
            return res.status(404).json({ message: 'Book not found' });
        }

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

export {
    createBook,
    getBookById,
    getAllBooks,
    updateBook,
    deleteBook
};
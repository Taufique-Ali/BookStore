import { BookModel } from "../models/index.js";

class BookService{

    static async getAllBooks(shop_id = null) {
        const books = await BookModel.getAllBooks(shop_id);
        return books;
    }

    static async getBookById(bookId) {
        const book = await BookModel.getBookById(bookId);
        return book;
    }
    
    static async createBook(bookData) {
        const { title, author, genre, published_year, summary, isbn, available_copies, mrp, price, discount, language, shop_id } = bookData;
        const bookId = await BookModel.createBook(title, author, genre, published_year, summary, isbn, available_copies, mrp, price, discount, language, shop_id);
        return bookId;
    }

    static async updateBook(bookId, updatedFields) {
        const updated = await BookModel.updateBook(bookId, updatedFields);
        return updated;
    }

    static async deleteBook(bookId) {
        const deleted = await BookModel.deleteBook(bookId);
        return deleted;
    }
}

export { BookService };
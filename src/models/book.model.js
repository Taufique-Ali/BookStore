import pool from "../config/dbConfig.js";

class BookModel {

    static async createBook(title, author, genre, published_year, summary, isbn, available_copies, mrp, price, discount, language, shop_id) {
        // Implementation for creating a book
        const [result] = await pool.query(
            'INSERT INTO books (title, author, genre, published_year, summary, isbn, available_copies, mrp, price, discount, language, shop_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [title, author, genre, published_year, summary, isbn, available_copies, mrp, price, discount, language, shop_id]
        );
        return result.insertId; // Return the ID of the newly created book
    }

    static async getBookById(bookId) {
        const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [bookId]);
        return rows[0]; // Return the book object or null if not found
    }

    static async getAllBooks(shop_id = null) {
        let query = 'SELECT * FROM books';
        let values = [];

        if (shop_id !== null) {
            query += ' WHERE shop_id = ?';
            values.push(shop_id);
        }

        const [rows] = await pool.query(query, values);
        return rows; // Return an array of all books
    }

    static async updateBook(bookId, updatedFields) {
        const setClause = Object.keys(updatedFields).map(field => `${field} = ?`).join(', ');
        const values = Object.values(updatedFields);
        values.push(bookId); // Add bookId to the end of the values array

        const [result] = await pool.query(
            `UPDATE books SET ${setClause} WHERE id = ?`,
            values
        );
        return result.affectedRows > 0; // Return true if the book was updated, false otherwise
    }

    static async deleteBook(bookId) {
        const [result] = await pool.query('DELETE FROM books WHERE id = ?', [bookId]);
        return result.affectedRows > 0; // Return true if the book was deleted, false otherwise
    }

    static async decrementStock(conn, bookId, quantity) {
        const [result] = await conn.query(
            'UPDATE books SET available_copies = available_copies - ? WHERE id = ? AND available_copies >= ?',
            [quantity, bookId, quantity]
        );
        return result.affectedRows > 0; // false means insufficient stock
    }

}

export default BookModel;
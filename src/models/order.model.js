import pool from "../config/dbConfig.js";

class OrderModel {
    static async createOrder(conn, { userId, totalAmount, totalDiscount, finalAmount, paymentMethod, shippingAddress, billingAddress, deliveryCharge }) {
        const [result] = await conn.query(
            'INSERT INTO orders (userId, totalAmount, totalDiscount, finalAmount, paymentMethod, shippingAddress, billingAddress, deliveryCharge) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, totalAmount, totalDiscount, finalAmount, paymentMethod, shippingAddress, billingAddress, deliveryCharge]
        );
        return result.insertId;
    }

    static async createOrderItems(conn, orderId, items) {
        const values = items.map(item => [orderId, item.bookId, item.quantity, item.priceAtPurchase, item.discountAtPurchase]);
        await conn.query(
            'INSERT INTO order_items (orderId, bookId, quantity, priceAtPurchase, discountAtPurchase) VALUES ?',
            [values]
        );
    }

    static async getOrderById(orderId) {
        const [rows] = await pool.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        return rows[0];
    }

    // order and order_items tables are related, so we can fetch order items for a given orderId
    static async getOrderItemsByOrderId(orderId) {
        const [rows] = await pool.query('SELECT * FROM order_items WHERE orderId = ?', [orderId]);
        return rows;
    }
    static async getAllOrdersByUserId(userId) {
        const [rows] = await pool.query('SELECT * FROM orders WHERE userId = ?', [userId]);
        return rows;
    }
}

export default OrderModel;

import pool from "../config/dbConfig.js";
import { BookModel, OrderModel } from "../models/index.js";
import receiptQueue from "../queues/receipt.queue.js";

class OrderService {
    static async createOrder(userId, items, paymentMethod, shippingAddress, billingAddress, deliveryCharge = 0) {
        if (!userId || !Array.isArray(items) || items.length === 0) {
            throw new Error('Invalid input');
        }
        if (deliveryCharge < 0) {
            throw new Error('Invalid deliveryCharge');
        }

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();

            let totalAmount = 0;
            let totalDiscount = 0;
            let finalAmount = 0;
            const orderItems = [];
            const bookDetailsMap = new Map();

            for (const { bookId, quantity } of items) {
                if (!bookId || !quantity || quantity <= 0) {
                    throw new Error(`Invalid item: bookId=${bookId}, quantity=${quantity}`);
                }
                const book = await BookModel.getBookById(bookId);
                if (!book) throw new Error(`Book not found: ${bookId}`);

                const priceAtPurchase = book.price;
                const discountAtPurchase = book.mrp - book.price;

                totalAmount += book.mrp * quantity;
                totalDiscount += discountAtPurchase * quantity;
                finalAmount += priceAtPurchase * quantity;

                orderItems.push({ bookId, quantity, priceAtPurchase, discountAtPurchase });
                bookDetailsMap.set(bookId, book);
                const stockOk = await BookModel.decrementStock(conn, bookId, quantity);
                if (!stockOk) {
                    throw new Error(`Insufficient stock for book: ${bookId}`);
                }
            }

            finalAmount += Number(deliveryCharge);

            const orderId = await OrderModel.createOrder(conn, {
                userId,
                totalAmount,
                totalDiscount,
                finalAmount,
                paymentMethod,
                shippingAddress,
                billingAddress,
                deliveryCharge,
            });

            await OrderModel.createOrderItems(conn, orderId, orderItems);

            await conn.commit();
            await receiptQueue.add('generateReceipt', { orderId });
            return {
                orderId,
                userId,
                // status: 'pending',
                totalAmount,
                totalDiscount,
                deliveryCharge,
                finalAmount,
                // paymentStatus: 'unpaid',
                paymentMethod,
                shippingAddress,
                billingAddress,
                items: orderItems.map(item => ({
                    bookId: item.bookId,
                    bookDetails: bookDetailsMap.get(item.bookId),
                    quantity: item.quantity,
                    priceAtPurchase: item.priceAtPurchase,
                    discountAtPurchase: item.discountAtPurchase,
                })),
            };
        } catch (error) {
            await conn.rollback();
            throw error;
        } finally {
            conn.release();
        }
    }

    static async getOrderById(userId, orderId) {
        if (!userId || !orderId) {
            throw new Error('Invalid input');
        }

        const order = await OrderModel.getOrderById(orderId);
        if (!order || order.userId !== userId) {
            return null;
        }

        const orderItems = await OrderModel.getOrderItemsByOrderId(orderId);
        return { ...order, items: orderItems };
    }
}

export { OrderService };

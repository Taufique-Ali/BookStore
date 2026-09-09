import { OrderService } from '../services/index.js';

const createOrder = async (req, res) => {
    try {
        const { items, paymentMethod, shippingAddress, billingAddress, deliveryCharge } = req.body;
        const userId = req.user.userId; // from auth middleware

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'items is required and must be a non-empty array' });
        }
        if (!paymentMethod || !shippingAddress || !billingAddress) {
            return res.status(400).json({ message: 'paymentMethod, shippingAddress and billingAddress are required' });
        }
        if (deliveryCharge != null && (isNaN(deliveryCharge) || deliveryCharge < 0)) {
            return res.status(400).json({ message: 'deliveryCharge must be a non-negative number' });
        }

        const order = await OrderService.createOrder(userId, items, paymentMethod, shippingAddress, billingAddress, deliveryCharge || 0);
        res.status(201).json(order);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(400).json({ message: error.message || 'Internal server error' });
    }
};

const getOrderById = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId; // from auth middleware

        if (!orderId) {
            return res.status(400).json({ message: 'orderId is required' });
        }

        const order = await OrderService.getOrderById(userId, orderId);
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.status(200).json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(400).json({ message: error.message || 'Internal server error' });
    }
}

export { createOrder, getOrderById };

CREATE TABLE IF NOT EXISTS orders (
    id INT NOT NULL AUTO_INCREMENT,
    userId INT NOT NULL,
    orderDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
    totalAmount DECIMAL(10, 2) NOT NULL,
    totalDiscount DECIMAL(10, 2) NOT NULL,
    finalAmount DECIMAL(10, 2) NOT NULL,
    paymentStatus ENUM('paid', 'unpaid') NOT NULL DEFAULT 'unpaid',
    paymentMethod ENUM('credit card', 'paypal', 'cash on delivery') NOT NULL,
    shippingAddress TEXT NOT NULL,
    billingAddress TEXT NOT NULL,
    deliveryCharge DECIMAL(10, 2) NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES users(id)
);

-- Run this if the `orders` table already exists without the column:
-- ALTER TABLE orders ADD COLUMN deliveryCharge DECIMAL(10, 2) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS order_items (
    id INT NOT NULL AUTO_INCREMENT,
    orderId INT NOT NULL,
    bookId INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    priceAtPurchase DECIMAL(10, 2) NOT NULL,
    discountAtPurchase DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (bookId) REFERENCES books(id)
);

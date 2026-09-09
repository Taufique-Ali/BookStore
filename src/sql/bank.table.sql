CREATE TABLE IF NOT EXISTS shop_bank_details (
    id INT NOT NULL AUTO_INCREMENT,
    shop_id INT NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    account_no VARCHAR(50) NOT NULL,
    ifsc_code VARCHAR(20) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (shop_id) REFERENCES users(id) ON DELETE CASCADE
);
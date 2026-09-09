CREATE TABLE IF NOT EXISTS books(
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(255) NOT NULL,
    published_year INT NOT NULL,
    summary TEXT NOT NULL,
    isbn VARCHAR(255) UNIQUE NOT NULL,
    available_copies INT NOT NULL,
    mrp DECIMAL(10, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    discount DECIMAL(10, 2) NOT NULL,
    shop_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (shop_id) REFERENCES user(id) ON DELETE CASCADE,
    language ENUM('English', 'Spanish', 'French', 'German', 'Hindi', 'Other') NOT NULL DEFAULT 'English'
);
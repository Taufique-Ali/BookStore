import pool from "../config/dbConfig.js";
import bcrypt from "bcrypt";

class UserModel {
    static async findByEmail(email){
        const [row] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        return row[0];
    }

    // Create a new user
    static async createUser(userData) {
        const { name, email, password } = userData;
        // password should be hashed before storing in the 'database' for security reasons. 
        
        const [result] = await pool.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password]);
        return result.insertId; // Return the ID of the newly created user
    }

    static async getUserById(id) {
        const [rows] = await pool.query('SELECT id, name, email FROM users WHERE id = ?', [id]);
        return rows[0];
    }

    static async getUserByEmail(email, id=null) {
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ? OR id = ?', [email, id]);
        return rows[0];
    }

    // login usr with token using jwt

    static async loginUser(email, password) {
        const [row] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = row[0];
        if (!user) {
            throw new Error('User not found');
        }
        // Compare the provided password with the hashed password in the 'database'
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }
        return user;
    }

};

export default UserModel;
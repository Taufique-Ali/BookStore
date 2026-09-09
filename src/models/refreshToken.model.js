import pool from '../config/dbConfig.js';

class RefreshTokenModel {
    static async create({ user_id, token_hash, expires_at }) {
        const [result] = await pool.query(
            'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
            [user_id, token_hash, expires_at]
        );
        return result.insertId;
    }

    static async findByTokenHash(token_hash) {
        const [rows] = await pool.query(
            'SELECT * FROM refresh_tokens WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW()',
            [token_hash]
        );
        return rows[0];
    }

    static async revoke(token_hash) {
        const [result] = await pool.query(
            'UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?',
            [token_hash]
        );
        return result.affectedRows > 0;
    }

    static async deleteExpiredTokens() {
        const [result] = await pool.query(
            'DELETE FROM refresh_tokens WHERE expires_at <= NOW()'
        );
        return result.affectedRows;
    }
}
   
export default RefreshTokenModel;
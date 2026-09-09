import pool from "../config/dbConfig.js";

class BankDetailsModel {
    static async getByShopId(shopId) {
        if (!shopId) return null;
        const [rows] = await pool.query('SELECT * FROM shop_bank_details WHERE shop_id = ?', [shopId]);
        return rows[0] || null;
    }
}

export default BankDetailsModel;
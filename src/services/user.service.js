import { UserModel } from "../models/index.js";
import bcrypt from "bcrypt";

import {
    signAccessToken,
    signRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    hashToken,
} from "../utils/jwt.util.js";
import RefreshTokenModel from "../models/refreshToken.model.js";

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days, keep in sync with .env REFRESH_TOKEN_TTL

class UserService {

    static async registerUser(userData) {
        const { name, email } = userData;
        let { password } = userData;

        // Check if the user already exists
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists');
        }
        // password hash
        password = await bcrypt.hash(password, 10); // Hash the password before storing it
        // Create a new user
        const userId = await UserModel.createUser({ name, email, password });
        return userId;
    }

    static async getUserByEmail(email, id = null) {
        const user = await UserModel.getUserByEmail(email, id);
        return user;
    }

    static async loginUser(email, password) {
        const user = await UserModel.loginUser(email, password);
        // Generate access and refresh tokens
        const payload = { userId: user.id, email: user.email };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken(payload);

        await RefreshTokenModel.create({
            user_id: user.id,
            token_hash: await hashToken(refreshToken),
            expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        });
        return {
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            },
            tokens: {
                accessToken,
                refreshToken,
            }
        }
    }

    static async refreshAccessToken(refreshToken) {
        let decoded;
        try {
            decoded = verifyRefreshToken(refreshToken);
        } catch (err) {
            throw new Error('Invalid refresh token');
        }

        const hashedToken = await hashToken(refreshToken);
        const storedToken = await RefreshTokenModel.findByTokenHash(hashedToken);
        if (!storedToken) {
            throw new Error('Refresh token not found or revoked');
        }

        await RefreshTokenModel.revoke(hashedToken); // Revoke the old refresh token

        // Generate a new access token
        const payload = { userId: decoded.userId, email: decoded.email };
        const newAccessToken = signAccessToken(payload);
        const newRefreshToken = signRefreshToken(payload);

        await RefreshTokenModel.create({
            user_id: decoded.userId,
            token_hash: await hashToken(newRefreshToken),
            expires_at: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
        });

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    static async logoutUser(refreshToken) {
        await RefreshTokenModel.revoke(await hashToken(refreshToken));
    }
}

export { UserService };
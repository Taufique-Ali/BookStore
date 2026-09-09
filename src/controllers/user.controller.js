import { UserService } from "../services/index.js";

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Call the service to register the user
        const userId = await UserService.registerUser({ name, email, password });

        res.status(201).json({ message: 'User registered successfully', userId });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const id = req.query.id; // Optional query parameter for user ID

        // Validate input
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // Call the service to get the user by email
        const user = await UserService.getUserByEmail(email, id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        const result = await UserService.loginUser(email, password);
        res.status(200).json({
            data:result,
            status:200,
            success: true
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
}

const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        const newAccessToken = await UserService.refreshAccessToken(refreshToken);
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.error('Error refreshing token:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
}

const logoutUser = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        await UserService.logoutUser(refreshToken);
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error logging out user:', error);
        res.status(500).json({ message: error.message || 'Internal Server Error' });
    }
}

export {
    registerUser,
    getUserByEmail,
    loginUser,
    refreshToken,
    logoutUser
};
// src/controllers/admin.controller.js
import User from '../models/user.model.js';
import Investment from '../models/investment.model.js';
import AnonymousTracking from '../models/tracking.model.js';

// Get system statistics
export const getSystemStats = async (req, res) => {
    try {
        const stats = await Promise.all([
            User.countDocuments(),
            User.countDocuments({ role: 'subscriber' }),
            Investment.countDocuments(),
            Investment.aggregate([
                {
                    $group: {
                        _id: null,
                        totalValue: { $sum: { $multiply: ["$amount", "$currentPrice"] } },
                        averageROI: { $avg: "$ROI" }
                    }
                }
            ])
        ]);

        const [totalUsers, totalSubscribers, totalInvestments, investmentStats] = stats;

        res.json({
            success: true,
            data: {
                users: {
                    total: totalUsers,
                    subscribers: totalSubscribers
                },
                investments: {
                    total: totalInvestments,
                    totalValue: investmentStats[0]?.totalValue || 0,
                    averageROI: investmentStats[0]?.averageROI || 0
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Manage users
export const getUsers = async (req, res) => {
    try {
        const { role, status, sort = 'createdAt', page = 1, limit = 10 } = req.query;
        
        const query = {};
        if (role) query.role = role;
        if (status) query.isActive = status === 'active';

        const users = await User.find(query)
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-password');

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page: page * 1,
                    limit: limit * 1
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update user
export const updateUser = async (req, res) => {
    try {
        const { isActive, role } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive, role },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get audit logs
export const getAuditLogs = async (req, res) => {
    try {
        const { startDate, endDate, userId, action } = req.query;
        
        // Implement audit logging based on your requirements
        const logs = []; // Replace with actual audit log implementation

        res.json({
            success: true,
            data: logs
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
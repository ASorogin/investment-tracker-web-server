// src/controllers/investment.controller.js
import Investment from '../models/investment.model.js';

// Create new investment
export const createInvestment = async (req, res) => {
    try {
        const investment = new Investment({
            ...req.body,
            userId: req.user._id
        });

        await investment.save();

        res.status(201).json({
            success: true,
            data: investment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all investments for logged-in user
export const getInvestments = async (req, res) => {
    try {
        const { role, _id: userId } = req.user;
        const { assetType, status } = req.query;

        // Build base query
        const query = role === 'admin' ? {} : { userId };
        if (assetType) query.assetType = assetType;
        if (status) query.status = status;

        // Aggregate pipeline for grouped investments
        const aggregatedInvestments = await Investment.aggregate([
            { $match: query },
            {
                $group: {
                    _id: {
                        assetType: "$assetType",
                        symbol: "$symbol" // Add symbol field to Investment model
                    },
                    totalAmount: { $sum: "$amount" },
                    avgPurchasePrice: {
                        $avg: "$purchasePrice"
                    },
                    currentPrice: { $last: "$currentPrice" },
                    positions: { $push: "$$ROOT" },
                    totalValue: {
                        $sum: { $multiply: ["$amount", "$currentPrice"] }
                    },
                    totalCost: {
                        $sum: { $multiply: ["$amount", "$purchasePrice"] }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    assetType: "$_id.assetType",
                    symbol: "$_id.symbol",
                    totalAmount: 1,
                    avgPurchasePrice: { $round: ["$avgPurchasePrice", 2] },
                    currentPrice: 1,
                    totalValue: { $round: ["$totalValue", 2] },
                    totalCost: { $round: ["$totalCost", 2] },
                    profitLoss: {
                        $round: [{ $subtract: ["$totalValue", "$totalCost"] }, 2]
                    },
                    ROI: {
                        $round: [{
                            $multiply: [
                                {
                                    $divide: [
                                        { $subtract: ["$totalValue", "$totalCost"] },
                                        "$totalCost"
                                    ]
                                },
                                100
                            ]
                        }, 2]
                    },
                    positions: 1
                }
            },
            { $sort: { assetType: 1, symbol: 1 } }
        ]);

        // Calculate portfolio summary
        const summary = {
            totalInvestments: aggregatedInvestments.length,
            totalValue: aggregatedInvestments.reduce((sum, inv) => sum + inv.totalValue, 0),
            totalProfit: aggregatedInvestments.reduce((sum, inv) => sum + inv.profitLoss, 0),
            averageROI: aggregatedInvestments.length > 0 
                ? aggregatedInvestments.reduce((sum, inv) => sum + inv.ROI, 0) / aggregatedInvestments.length 
                : 0
        };

        res.json({
            success: true,
            data: {
                investments: aggregatedInvestments,
                summary
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get single investment
export const getInvestment = async (req, res) => {
    try {
        const investment = await Investment.findOne({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!investment) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        res.json({
            success: true,
            data: investment
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

// Update investment
export const updateInvestment = async (req, res) => {
    try {
        const investment = await Investment.findOneAndUpdate(
            {
                _id: req.params.id,
                userId: req.user._id
            },
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!investment) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        res.json({
            success: true,
            data: investment
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete investment
export const deleteInvestment = async (req, res) => {
    try {
        const investment = await Investment.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!investment) {
            return res.status(404).json({
                success: false,
                message: 'Investment not found'
            });
        }

        res.json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
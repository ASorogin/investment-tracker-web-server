// src/controllers/subscriber.controller.js
import Investment from '../models/investment.model.js';
import AnonymousTracking from '../models/tracking.model.js';

// Setup tracking preferences
export const setupTracking = async (req, res) => {
    try {
        const tracking = new AnonymousTracking({
            subscriberId: req.user._id,
            filters: req.body.filters
        });

        await tracking.save();

        res.status(201).json({
            success: true,
            data: tracking
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get aggregated anonymous data
export const getAggregatedData = async (req, res) => {
    try {
        const { assetType, dateRange } = req.query;
        
        // Build match query
        const matchQuery = {};
        if (assetType) matchQuery.assetType = assetType;
        if (dateRange && dateRange.start && dateRange.end) {
            matchQuery.purchaseDate = {
                $gte: new Date(dateRange.start),
                $lte: new Date(dateRange.end)
            };
        }

        console.log('Match Query:', matchQuery);

        const investments = await Investment.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalInvestments: { $sum: 1 },
                    totalValue: { 
                        $sum: { 
                            $multiply: ["$amount", { $ifNull: ["$currentPrice", "$purchasePrice"] }] 
                        }
                    },
                    averageAmount: { $avg: "$amount" },
                    averageROI: { $avg: "$ROI" },
                    assetTypes: {
                        $addToSet: "$assetType"
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalInvestments: 1,
                    totalValue: { $round: ["$totalValue", 2] },
                    averageAmount: { $round: ["$averageAmount", 2] },
                    averageROI: { $round: ["$averageROI", 2] },
                    assetTypeDistribution: {
                        $arrayToObject: {
                            $map: {
                                input: "$assetTypes",
                                as: "type",
                                in: {
                                    k: "$$type",
                                    v: {
                                        $size: {
                                            $filter: {
                                                input: "$assetTypes",
                                                cond: { $eq: ["$$this", "$$type"] }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        console.log('Aggregation result:', JSON.stringify(investments, null, 2));

        res.json({
            success: true,
            data: investments[0] || {
                totalInvestments: 0,
                totalValue: 0,
                averageAmount: 0,
                averageROI: 0,
                assetTypeDistribution: {}
            }
        });
    } catch (error) {
        console.error('Aggregation error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get tracking insights
export const getInsights = async (req, res) => {
    try {
        const trackingId = req.params.id;
        const tracking = await AnonymousTracking.findOne({
            _id: trackingId,
            subscriberId: req.user._id
        });

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message: 'Tracking not found'
            });
        }

        // Get matching investments based on tracking filters
        const matchQuery = { ...tracking.filters };
        if (matchQuery.dateRange) {
            matchQuery.purchaseDate = {
                $gte: new Date(matchQuery.dateRange.start),
                $lte: new Date(matchQuery.dateRange.end)
            };
            delete matchQuery.dateRange;
        }

        const insights = await Investment.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalInvestments: { $sum: 1 },
                    totalValue: { 
                        $sum: { 
                            $multiply: ["$amount", { $ifNull: ["$currentPrice", "$purchasePrice"] }] 
                        }
                    },
                    averageROI: { $avg: "$ROI" },
                    performance: {
                        $push: {
                            date: "$purchaseDate",
                            value: { 
                                $multiply: ["$amount", { $ifNull: ["$currentPrice", "$purchasePrice"] }] 
                            },
                            roi: "$ROI"
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalInvestments: 1,
                    totalValue: { $round: ["$totalValue", 2] },
                    averageROI: { $round: ["$averageROI", 2] },
                    performance: {
                        $sortArray: {
                            input: "$performance",
                            sortBy: { date: 1 }
                        }
                    }
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                tracking,
                insights: insights[0] || {
                    totalInvestments: 0,
                    totalValue: 0,
                    averageROI: 0,
                    performance: []
                }
            }
        });
    } catch (error) {
        console.error('Insights error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

export default {
    setupTracking,
    getAggregatedData,
    getInsights
};
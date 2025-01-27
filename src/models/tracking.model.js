// src/models/tracking.model.js
import mongoose from 'mongoose';

const trackingSchema = new mongoose.Schema({
    subscriberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    filters: {
        assetType: {
            type: String,
            enum: ['stocks', 'bonds', 'crypto', 'real_estate', 'commodities', 'other']
        },
        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high']
        },
        minAmount: Number,
        maxAmount: Number,
        dateRange: {
            start: Date,
            end: Date
        }
    },
    trackingData: [{
        date: Date,
        aggregatedData: {
            totalInvestments: Number,
            averageAmount: Number,
            totalValue: Number,
            averageROI: Number,
            assetTypeDistribution: Map,
            riskLevelDistribution: Map
        }
    }]
}, {
    timestamps: true
});

const AnonymousTracking = mongoose.model('AnonymousTracking', trackingSchema);

export default AnonymousTracking;
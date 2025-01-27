// src/models/investment.model.js
import mongoose from 'mongoose';

const investmentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    symbol: {
        type: String,
        required: [true, 'Stock symbol is required'],
        uppercase: true,
        trim: true
    },
    assetType: {
        type: String,
        required: [true, 'Asset type is required'],
        enum: ['stocks', 'bonds', 'crypto', 'real_estate', 'commodities', 'other'],
        trim: true
    },
    amount: {
        type: Number,
        required: [true, 'Investment amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    purchasePrice: {
        type: Number,
        required: [true, 'Purchase price is required'],
        min: [0, 'Purchase price cannot be negative']
    },
    currentPrice: {
        type: Number,
        min: [0, 'Current price cannot be negative']
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot be longer than 500 characters']
    },
    status: {
        type: String,
        enum: ['active', 'sold', 'pending'],
        default: 'active'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for calculating current value
investmentSchema.virtual('currentValue').get(function() {
    return this.amount * (this.currentPrice || this.purchasePrice);
});

// Virtual for calculating profit/loss
investmentSchema.virtual('profitLoss').get(function() {
    const currentValue = this.currentValue;
    const investedValue = this.amount * this.purchasePrice;
    return currentValue - investedValue;
});

// Virtual for calculating ROI
investmentSchema.virtual('ROI').get(function() {
    const profitLoss = this.profitLoss;
    const investedValue = this.amount * this.purchasePrice;
    return ((profitLoss / investedValue) * 100).toFixed(2);
});

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;
// src/routes/investment.routes.js
import express from 'express';
import { 
    createInvestment,
    getInvestments,
    getInvestment,
    updateInvestment,
    deleteInvestment
} from '../controllers/investment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protect all routes
router.use(protect);

router.route('/')
    .post(createInvestment)
    .get(getInvestments);

router.route('/:id')
    .get(getInvestment)
    .put(updateInvestment)
    .delete(deleteInvestment);

export default router;
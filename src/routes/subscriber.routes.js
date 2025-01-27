// src/routes/subscriber.routes.js
import express from 'express';
import { 
    setupTracking,
    getAggregatedData,
    getInsights
} from '../controllers/subscriber.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('subscriber', 'admin'));

router.route('/tracking')
    .post(setupTracking)
    .get(getAggregatedData);

router.get('/tracking/:id/insights', getInsights);

export default router;
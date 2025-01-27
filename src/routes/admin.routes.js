// src/routes/admin.routes.js
import express from 'express';
import {
    getSystemStats,
    getUsers,
    updateUser,
    getAuditLogs
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getSystemStats);
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.get('/audit-logs', getAuditLogs);

export default router;
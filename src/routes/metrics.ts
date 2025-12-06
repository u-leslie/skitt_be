import { Router, Request, Response } from "express";
import { MetricsService } from "../services/metricsService";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();
const metricsService = new MetricsService();

/**
 * @swagger
 * /api/metrics/events:
 *   post:
 *     summary: Track a flag event
 *     tags: [Metrics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flag_id
 *               - event_type
 *             properties:
 *               flag_id:
 *                 type: string
 *                 format: uuid
 *               user_id:
 *                 type: string
 *                 format: uuid
 *               event_type:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Event tracked successfully
 */
router.post(
  "/events",
  asyncHandler(async (req: Request, res: Response) => {
    const event = await metricsService.trackEvent(req.body);
    res.status(201).json(event);
  })
);

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get metrics for all flags
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Metrics data
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const metrics = await metricsService.getMetrics();
    res.json(metrics);
  })
);

/**
 * @swagger
 * /api/metrics/flags/{flagId}:
 *   get:
 *     summary: Get metrics for a specific flag
 *     tags: [Metrics]
 *     parameters:
 *       - in: path
 *         name: flagId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Feature flag UUID
 *     responses:
 *       200:
 *         description: Metrics for the flag
 */
router.get(
  "/flags/:flagId",
  asyncHandler(async (req: Request, res: Response) => {
    const flagId = req.params.flagId;
    const metrics = await metricsService.getMetrics(flagId);
    res.json(metrics);
  })
);

/**
 * @swagger
 * /api/metrics/dashboard:
 *   get:
 *     summary: Get dashboard summary with key metrics
 *     tags: [Metrics]
 *     responses:
 *       200:
 *         description: Dashboard summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalFlags:
 *                       type: integer
 *                     enabledFlags:
 *                       type: integer
 *                     totalUsers:
 *                       type: integer
 *                     totalAssignments:
 *                       type: integer
 *                     totalExperiments:
 *                       type: integer
 *                     eventsLast7Days:
 *                       type: integer
 *                 topFlags:
 *                   type: array
 *                   items:
 *                     type: object
 */
router.get(
  "/dashboard",
  asyncHandler(async (req: Request, res: Response) => {
    const summary = await metricsService.getDashboardSummary();
    res.json(summary);
  })
);

export default router;

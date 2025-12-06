import { Router, Request, Response } from "express";
import { FeatureFlagService } from "../services/featureFlagService";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();
const featureFlagService = new FeatureFlagService();

/**
 * @swagger
 * /api/flags:
 *   get:
 *     summary: Get all feature flags
 *     tags: [Feature Flags]
 *     responses:
 *       200:
 *         description: List of all feature flags
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FeatureFlag'
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const flags = await featureFlagService.getAllFlags();
    res.json(flags);
  })
);

/**
 * @swagger
 * /api/flags/{id}:
 *   get:
 *     summary: Get feature flag by ID
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Feature flag UUID
 *     responses:
 *       200:
 *         description: Feature flag details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Feature flag not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const flag = await featureFlagService.getFlagById(id);
    res.json(flag);
  })
);

/**
 * @swagger
 * /api/flags:
 *   post:
 *     summary: Create a new feature flag
 *     tags: [Feature Flags]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFeatureFlag'
 *     responses:
 *       201:
 *         description: Feature flag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       400:
 *         description: Validation error
 *       409:
 *         description: Feature flag with this key already exists
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const flag = await featureFlagService.createFlag(req.body);
    res.status(201).json(flag);
  })
);

/**
 * @swagger
 * /api/flags/{id}:
 *   put:
 *     summary: Update a feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Feature flag UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFeatureFlag'
 *     responses:
 *       200:
 *         description: Feature flag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeatureFlag'
 *       404:
 *         description: Feature flag not found
 */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const flag = await featureFlagService.updateFlag(id, req.body);
    res.json(flag);
  })
);

/**
 * @swagger
 * /api/flags/{id}:
 *   delete:
 *     summary: Delete a feature flag
 *     tags: [Feature Flags]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Feature flag UUID
 *     responses:
 *       204:
 *         description: Feature flag deleted successfully
 *       404:
 *         description: Feature flag not found
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    await featureFlagService.deleteFlag(id);
    res.status(204).send();
  })
);

export default router;

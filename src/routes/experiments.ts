import { Router, Request, Response } from "express";
import { ExperimentService } from "../services/experimentService";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();
const experimentService = new ExperimentService();

/**
 * @swagger
 * /api/experiments:
 *   get:
 *     summary: Get all experiments
 *     tags: [Experiments]
 *     responses:
 *       200:
 *         description: List of all experiments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Experiment'
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const experiments = await experimentService.getAllExperiments();
    res.json(experiments);
  })
);

/**
 * @swagger
 * /api/experiments/{id}:
 *   get:
 *     summary: Get experiment by ID
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Experiment UUID
 *     responses:
 *       200:
 *         description: Experiment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Experiment'
 *       404:
 *         description: Experiment not found
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const experiment = await experimentService.getExperimentById(id);
    res.json(experiment);
  })
);

/**
 * @swagger
 * /api/experiments/flag/{flagId}:
 *   get:
 *     summary: Get experiments by feature flag ID
 *     tags: [Experiments]
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
 *         description: List of experiments for the flag
 */
router.get(
  "/flag/:flagId",
  asyncHandler(async (req: Request, res: Response) => {
    const flagId = req.params.flagId;
    const experiments = await experimentService.getExperimentsByFlagId(flagId);
    res.json(experiments);
  })
);

/**
 * @swagger
 * /api/experiments:
 *   post:
 *     summary: Create a new experiment
 *     tags: [Experiments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - flag_id
 *               - name
 *             properties:
 *               flag_id:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               variant_a_percentage:
 *                 type: integer
 *               variant_b_percentage:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [draft, running, paused, completed]
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Experiment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Experiment'
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const experiment = await experimentService.createExperiment(req.body);
    res.status(201).json(experiment);
  })
);

/**
 * @swagger
 * /api/experiments/{id}:
 *   put:
 *     summary: Update an experiment
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Experiment UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               variant_a_percentage:
 *                 type: integer
 *               variant_b_percentage:
 *                 type: integer
 *               status:
 *                 type: string
 *                 enum: [draft, running, paused, completed]
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Experiment updated successfully
 *       404:
 *         description: Experiment not found
 */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const experiment = await experimentService.updateExperiment(id, req.body);
    res.json(experiment);
  })
);

/**
 * @swagger
 * /api/experiments/{id}:
 *   delete:
 *     summary: Delete an experiment
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Experiment UUID
 *     responses:
 *       204:
 *         description: Experiment deleted successfully
 *       404:
 *         description: Experiment not found
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    await experimentService.deleteExperiment(id);
    res.status(204).send();
  })
);

/**
 * @swagger
 * /api/experiments/{id}/assignments:
 *   get:
 *     summary: Get all user assignments for an experiment
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Experiment UUID
 *     responses:
 *       200:
 *         description: List of user assignments
 */
router.get(
  "/:id/assignments",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const assignments = await experimentService.getExperimentAssignments(id);
    res.json(assignments);
  })
);

/**
 * @swagger
 * /api/experiments/{id}/assign/{userId}:
 *   post:
 *     summary: Assign a user to a variant in an experiment
 *     tags: [Experiments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Experiment UUID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User assigned to variant
 */
router.post(
  "/:id/assign/:userId",
  asyncHandler(async (req: Request, res: Response) => {
    const experimentId = req.params.id;
    const userId = req.params.userId;
    const result = await experimentService.assignUserToVariant(
      experimentId,
      userId
    );
    res.json(result);
  })
);

export default router;

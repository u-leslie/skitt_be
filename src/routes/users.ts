import { Router, Request, Response } from "express";
import { UserService } from "../services/userService";
import { asyncHandler } from "../middleware/asyncHandler";

const router = Router();
const userService = new UserService();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
router.get(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const users = await userService.getAllUsers();
    res.json(users);
  })
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = await userService.getUserById(id);
    res.json(user);
  })
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: Optional UUID, will be auto-generated if not provided
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               attributes:
 *                 type: object
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       409:
 *         description: User with this user_id already exists
 */
router.post(
  "/",
  asyncHandler(async (req: Request, res: Response) => {
    const user = await userService.createUser(req.body);
    res.status(201).json(user);
  })
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               name:
 *                 type: string
 *               attributes:
 *                 type: object
 *     responses:
 *       200:
 *         description: User updated successfully
 *       404:
 *         description: User not found
 */
router.put(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = await userService.updateUser(id, req.body);
    res.json(user);
  })
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     responses:
 *       204:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 */
router.delete(
  "/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id;
    await userService.deleteUser(id);
    res.status(204).send();
  })
);

/**
 * @swagger
 * /api/users/{userId}/flags/{flagId}:
 *   post:
 *     summary: Assign a feature flag to a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *       - in: path
 *         name: flagId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Feature flag UUID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Flag assigned to user successfully
 */
router.post(
  "/:userId/flags/:flagId",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const flagId = req.params.flagId;
    const enabled = req.body.enabled !== undefined ? req.body.enabled : true;
    const assignment = await userService.assignFlagToUser(
      userId,
      flagId,
      enabled
    );
    res.status(201).json(assignment);
  })
);

/**
 * @swagger
 * /api/users/{userId}/flags/{flagId}:
 *   delete:
 *     summary: Remove a feature flag from a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *       - in: path
 *         name: flagId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Feature flag UUID
 *     responses:
 *       204:
 *         description: Flag removed from user successfully
 */
router.delete(
  "/:userId/flags/:flagId",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const flagId = req.params.flagId;
    await userService.removeFlagFromUser(userId, flagId);
    res.status(204).send();
  })
);

/**
 * @swagger
 * /api/users/{userId}/flags:
 *   get:
 *     summary: Get all flags assigned to a user
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User UUID
 *     responses:
 *       200:
 *         description: List of flags assigned to the user
 */
router.get(
  "/:userId/flags",
  asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const assignments = await userService.getUserFlags(userId);
    res.json(assignments);
  })
);

export default router;

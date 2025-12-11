import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { initializeDatabase } from "./database/db";
import { swaggerSpec } from "./config/swagger";
import featureFlagsRouter from "./routes/featureFlags";
import usersRouter from "./routes/users";
import experimentsRouter from "./routes/experiments";
import metricsRouter from "./routes/metrics";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: "*", // Allow all origins (for production, specify your frontend domain)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// Swagger documentation with dynamic server URL
const swaggerSetup = swaggerUi.setup(swaggerSpec, {
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "Skitt API Documentation",
  swaggerOptions: {
    url: "/api-docs.json", // Use custom endpoint
    persistAuthorization: true,
  },
});

app.use("/api-docs", swaggerUi.serve, swaggerSetup);

// Custom endpoint to serve Swagger JSON with correct server URL
app.get("/api-docs.json", (req, res) => {
  const protocol = req.protocol;
  const host = req.get("host");
  const baseUrl = process.env.API_BASE_URL || `${protocol}://${host}`;

  const swaggerJson = {
    ...swaggerSpec,
    servers: [
      {
        url: baseUrl,
        description: "API Server",
      },
    ],
  };

  res.json(swaggerJson);
});

// Routes
app.use("/api/flags", featureFlagsRouter);
app.use("/api/users", usersRouter);
app.use("/api/experiments", experimentsRouter);
app.use("/api/metrics", metricsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log("Database initialized successfully");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(
        `Swagger docs available at http://localhost:${PORT}/api-docs`
      );
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

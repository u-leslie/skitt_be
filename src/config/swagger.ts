import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Skitt Feature Flags & Experiment Platform API",
      version: "1.0.0",
      description:
        "API documentation for Skitt - A feature flags and experiment management platform",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url:
          process.env.API_BASE_URL ||
          `http://localhost:${process.env.PORT || 3001}`,
        description: "API Server",
      },
    ],
    components: {
      schemas: {
        FeatureFlag: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Feature flag UUID",
            },
            key: {
              type: "string",
              description: "Unique key identifier for the flag",
            },
            name: {
              type: "string",
              description: "Display name of the feature flag",
            },
            description: {
              type: "string",
              nullable: true,
              description: "Description of the feature flag",
            },
            enabled: {
              type: "boolean",
              description: "Whether the flag is enabled",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        CreateFeatureFlag: {
          type: "object",
          required: ["key", "name"],
          properties: {
            key: {
              type: "string",
              minLength: 1,
              maxLength: 255,
            },
            name: {
              type: "string",
              minLength: 1,
              maxLength: 255,
            },
            description: {
              type: "string",
            },
            enabled: {
              type: "boolean",
            },
          },
        },
        UpdateFeatureFlag: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 255,
            },
            description: {
              type: "string",
            },
            enabled: {
              type: "boolean",
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            user_id: {
              type: "string",
              format: "uuid",
            },
            email: {
              type: "string",
              nullable: true,
            },
            name: {
              type: "string",
              nullable: true,
            },
            attributes: {
              type: "object",
              nullable: true,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Experiment: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
            },
            flag_id: {
              type: "string",
              format: "uuid",
            },
            name: {
              type: "string",
            },
            description: {
              type: "string",
              nullable: true,
            },
            variant_a_percentage: {
              type: "integer",
            },
            variant_b_percentage: {
              type: "integer",
            },
            status: {
              type: "string",
              enum: ["draft", "running", "paused", "completed"],
            },
            start_date: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            end_date: {
              type: "string",
              format: "date-time",
              nullable: true,
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            updated_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
            },
          },
        },
      },
    },
  },
  apis: ["./dist/routes/*.js", "./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);

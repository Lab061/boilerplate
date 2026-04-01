import { Entity } from "electrodb";

export const UserProfileEntity = new Entity({
  model: {
    entity: "userProfile",
    version: "1",
    service: "myapp",
  },
  attributes: {
    userId: { type: "string", required: true },
    email: { type: "string", required: true },
    name: { type: "string", required: true },
    createdAt: { type: "string", required: true },
  },
  indexes: {
    primary: {
      pk: { field: "PK", composite: ["userId"], casing: "none" },
      sk: { field: "SK", composite: [], casing: "none" },
    },
  },
});

// Add your domain entities below. Follow the single-table pattern:
// - All entities share the same DynamoDB table
// - Use composite keys for relationships
// - Add GSIs for additional access patterns

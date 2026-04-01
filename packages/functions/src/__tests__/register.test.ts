import { describe, it, expect, vi, beforeEach } from "vitest";
import { makeApiEvent } from "./helpers.js";

const mockSend = vi.fn();
vi.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: vi.fn().mockImplementation(() => ({
    send: mockSend,
  })),
  SignUpCommand: vi.fn().mockImplementation((input) => input),
}));

const mockCreateGo = vi.fn().mockResolvedValue({});
const mockCreate = vi.fn().mockReturnValue({ go: mockCreateGo });

vi.mock("@my-app/core", () => ({
  UserProfile: { create: mockCreate },
  registerRequestSchema: {
    safeParse: vi.fn().mockImplementation((data) => {
      if (!data.email || !data.name || !data.password) {
        return {
          success: false,
          error: { issues: [{ message: "Invalid input" }] },
        };
      }
      return { success: true, data };
    }),
  },
}));

vi.mock("sst", () => ({
  Resource: { WebClient: { id: "test-client-id" } },
}));

const { handler } = await import("../register.js");

describe("POST /auth/register", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register a user successfully", async () => {
    mockSend.mockResolvedValueOnce({ UserSub: "user-123" });

    const event = makeApiEvent("POST", "/auth/register", {
      email: "test@example.com",
      name: "Test User",
      password: "password123",
    });

    const result = (await handler(event as any, {} as any, {} as any)) as any;

    expect(result.statusCode).toBe(201);
    const body = JSON.parse(result.body);
    expect(body.userId).toBe("user-123");
    expect(body.email).toBe("test@example.com");
    expect(body.verificationRequired).toBe(true);
  });

  it("should return 400 for invalid input", async () => {
    const event = makeApiEvent("POST", "/auth/register", {
      email: "",
      name: "",
      password: "",
    });

    const result = (await handler(event as any, {} as any, {} as any)) as any;
    expect(result.statusCode).toBe(400);
  });

  it("should return 409 for existing user", async () => {
    const error = new Error("User already exists");
    error.name = "UsernameExistsException";
    mockSend.mockRejectedValueOnce(error);

    const event = makeApiEvent("POST", "/auth/register", {
      email: "existing@example.com",
      name: "Test",
      password: "password123",
    });

    const result = (await handler(event as any, {} as any, {} as any)) as any;
    expect(result.statusCode).toBe(409);
  });
});

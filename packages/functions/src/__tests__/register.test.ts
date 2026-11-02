import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { makeApiEvent } from "./helpers.js";

const mockSend = vi.fn();
vi.mock("@aws-sdk/client-cognito-identity-provider", () => ({
  CognitoIdentityProviderClient: vi.fn(function () {
    return { send: mockSend };
  }),
  SignUpCommand: vi.fn(function (input) {
    return input;
  }),
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

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  const validInput = {
    email: "test@example.com",
    name: "Test User",
    password: "password123",
  };

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

  it("should return 403 when the email domain is not allowed", async () => {
    vi.stubEnv("ALLOWED_SIGNUP_DOMAINS", "allowed.com, other.com");

    const event = makeApiEvent("POST", "/auth/register", validInput);

    const result = (await handler(event as any, {} as any, {} as any)) as any;
    expect(result.statusCode).toBe(403);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("should register when the email domain is allowed", async () => {
    vi.stubEnv("ALLOWED_SIGNUP_DOMAINS", "other.com, example.com");
    mockSend.mockResolvedValueOnce({ UserSub: "user-456" });

    const event = makeApiEvent("POST", "/auth/register", validInput);

    const result = (await handler(event as any, {} as any, {} as any)) as any;
    expect(result.statusCode).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ userId: "user-456", email: validInput.email })
    );
  });

  it("should return 400 with Cognito's message for an invalid password", async () => {
    const error = new Error("Password did not conform with policy");
    error.name = "InvalidPasswordException";
    mockSend.mockRejectedValueOnce(error);

    const event = makeApiEvent("POST", "/auth/register", validInput);

    const result = (await handler(event as any, {} as any, {} as any)) as any;
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body).error).toBe(
      "Password did not conform with policy"
    );
  });

  it("should return 500 without leaking details on an unexpected error", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockSend.mockRejectedValueOnce(new Error("boom"));

    const event = makeApiEvent("POST", "/auth/register", validInput);

    const result = (await handler(event as any, {} as any, {} as any)) as any;
    expect(result.statusCode).toBe(500);
    expect(JSON.parse(result.body).error).toBe("Internal server error");
  });
});

import {
  CognitoIdentityProviderClient,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { Resource } from "sst";
import { UserProfile, registerRequestSchema } from "@my-app/core";
import type { APIGatewayProxyHandlerV2 } from "aws-lambda";

const cognito = new CognitoIdentityProviderClient();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  const parsed = registerRequestSchema.safeParse(
    JSON.parse(event.body || "{}")
  );

  if (!parsed.success) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: parsed.error.issues[0].message }),
    };
  }

  const { email, name, password } = parsed.data;

  const allowedDomains = process.env.ALLOWED_SIGNUP_DOMAINS;
  if (allowedDomains) {
    const domains = allowedDomains.split(",").map((d) => d.trim());
    const emailDomain = email.split("@")[1];
    if (!domains.includes(emailDomain)) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "Registration is not available at this time",
        }),
      };
    }
  }

  try {
    const signUpResult = await cognito.send(
      new SignUpCommand({
        ClientId: (Resource as any).WebClient.id,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "name", Value: name },
        ],
      })
    );

    const userId = signUpResult.UserSub!;

    await UserProfile.create({
      userId,
      email,
      name,
      createdAt: new Date().toISOString(),
    }).go();

    return {
      statusCode: 201,
      body: JSON.stringify({
        userId,
        email,
        name,
        verificationRequired: true,
      }),
    };
  } catch (err: any) {
    if (err.name === "UsernameExistsException") {
      return {
        statusCode: 409,
        body: JSON.stringify({
          error: "An account with this email already exists",
        }),
      };
    }
    if (err.name === "InvalidPasswordException") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: err.message }),
      };
    }
    console.error("Registration error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};

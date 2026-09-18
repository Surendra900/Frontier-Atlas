import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";

import {
  ACCESS_TOKEN_COOKIE,
  verifyAccessToken,
} from "../utils/jwt.js";

type AuthVariables = {
  prisma: any;
  userId?: string;
};

export const authMiddleware: MiddlewareHandler<{
  Variables: AuthVariables;
}> = async (c, next) => {

  let accessToken = getCookie(
    c,
    ACCESS_TOKEN_COOKIE
  );

  if (!accessToken) {

    const authHeader =
      c.req.header("Authorization");

    if (
      authHeader &&
      authHeader.startsWith("Bearer ")
    ) {
      accessToken =
        authHeader.substring(7);
    }
  }

  if (!accessToken) {
    return c.json(
      {
        success: false,
        message: "Unauthorized",
      },
      401
    );
  }

  try {

    const payload =
      await verifyAccessToken(accessToken);

    c.set("userId", payload.userId);

    await next();

  } catch {

    return c.json(
      {
        success: false,
        message: "Invalid token",
      },
      401
    );

  }

};

export const optionalAuthMiddleware: MiddlewareHandler<{
  Variables: AuthVariables;
}> = async (c, next) => {
  let accessToken = getCookie(c, ACCESS_TOKEN_COOKIE);

  if (!accessToken) {
    const authHeader = c.req.header("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.substring(7);
    }
  }

  if (accessToken) {
    try {
      const payload = await verifyAccessToken(accessToken);
      c.set("userId", payload.userId);
    } catch {
      // Guest access or expired token: gracefully proceed without setting userId
    }
  }

  await next();
};
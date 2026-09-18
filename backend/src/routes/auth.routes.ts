import { Hono } from "hono";

import {
  signup,
  login,
  googleLogin,
  googleCallback,
  githubLogin,
  githubCallback,
  logout,
  refresh,
  me,
  updateProfile,
} from "../controllers/auth.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

type AuthVariables = {
  prisma: any;
  userId: string;
};

const auth = new Hono<{
  Variables: AuthVariables;
}>();

auth.post("/signup", signup);

auth.post("/login", login);

auth.get("/google", googleLogin);
auth.get("/google/callback", googleCallback);

auth.get("/github", githubLogin);
auth.get("/github/callback", githubCallback);

auth.post("/logout", logout);

auth.post("/refresh", refresh);

auth.get(
  "/me",
  authMiddleware,
  me
);

auth.put(
  "/profile",
  authMiddleware,
  updateProfile
);

export default auth;
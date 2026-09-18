
import type { PrismaClient } from "../generated/prisma/client";

import { comparePassword, hashPassword } from "../utils/hash.js";
import { hashRefreshToken } from "../utils/token-hash.js";

import {
  generateAccessToken,
  generateRefreshToken,
  REFRESH_TOKEN_MAX_AGE_SECONDS,
  verifyRefreshToken,
} from "../utils/jwt.js";

import type {
  LoginInput,
  RefreshInput,
  SignupInput,
} from "../validators/auth.validator.js";

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400
  ) {
    super(message);
    this.name = "AuthError";
  }
}

const userSelect = {
  id: true,
  username: true,
  email: true,
  displayName: true,
  avatar: true,
  bio: true,
  github: true,
  linkedin: true,
  twitter: true,
  website: true,
  reputationScore: true,
  createdAt: true,
} as const;

const getRefreshTokenExpiry = () =>
  new Date(
    Date.now() +
    REFRESH_TOKEN_MAX_AGE_SECONDS * 1000
  );

const createTokenPair = async (
  prisma: PrismaClient,
  userId: string,
  rememberMe = true
) => {
  const accessToken =
    await generateAccessToken(userId);

  const refreshToken =
    await generateRefreshToken(userId, rememberMe);

  await prisma.refreshToken.create({
    data: {
      // The database field is retained for backwards-compatible schema/deploys,
      // but only a SHA-256 digest is persisted. The raw JWT stays in the cookie.
      token: await hashRefreshToken(refreshToken),
      userId,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    accessToken,
    refreshToken,
  };
};

const findUserProfile = async (
  prisma: PrismaClient,
  userId: string
) => {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: userSelect,
  });
};

export const signupUser = async (
  prisma: PrismaClient,
  input: SignupInput
) => {

  const [
    existingUsername,
    existingEmail,
  ] = await Promise.all([

    prisma.user.findUnique({
      where: {
        username: input.username,
      },
    }),

    prisma.user.findUnique({
      where: {
        email: input.email,
      },
    }),

  ]);

  if (existingUsername) {
    throw new AuthError(
      "Username is already taken",
      409
    );
  }

  if (existingEmail) {
    throw new AuthError(
      "Email is already registered",
      409
    );
  }

  const hashedPassword =
    await hashPassword(input.password);

  const user = await prisma.user.create({

    data: {
      username: input.username,
      email: input.email,
      password: hashedPassword,
      displayName: input.displayName,
      github: input.github,
      linkedin: input.linkedin,
    },

    select: userSelect,

  });

  const tokens =
    await createTokenPair(
      prisma,
      user.id
    );

  return {
    user,
    ...tokens,
  };
};

export const upsertGithubUser = async (
  prisma: PrismaClient,
  githubProfile: any
) => {
  const email = githubProfile.email.toLowerCase();

  let user = await prisma.user.findUnique({
    where: { email },
    select: userSelect,
  });

  if (!user) {
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(randomPassword);

    user = await prisma.user.create({
      data: {
        username: email,
        email: email,
        password: hashedPassword,
        displayName: githubProfile.name || githubProfile.login || email.split("@")[0],
      },
      select: userSelect,
    });
  }

  const tokens = await createTokenPair(prisma, user.id);

  return { user, ...tokens };
};

export const upsertGoogleUser = async (
  prisma: PrismaClient,
  googleProfile: any
) => {
  const email = googleProfile.email.toLowerCase();

  let user = await prisma.user.findUnique({
    where: { email },
    select: userSelect,
  });

  if (!user) {
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await hashPassword(randomPassword);

    user = await prisma.user.create({
      data: {
        username: email,
        email: email,
        password: hashedPassword,
        displayName: googleProfile.name || email.split("@")[0],
      },
      select: userSelect,
    });
  }

  const tokens = await createTokenPair(prisma, user.id);

  return {
    user,
    ...tokens,
  };
};

export const loginUser = async (
  prisma: PrismaClient,
  input: LoginInput
) => {

  const user =
    await prisma.user.findUnique({

      where: {
        email: input.email,
      },

    });

  if (!user) {
    throw new AuthError(
      "Invalid email or password",
      401
    );
  }

  const validPassword =
    await comparePassword(
      input.password,
      user.password
    );

  if (!validPassword) {
    throw new AuthError(
      "Invalid email or password",
      401
    );
  }

  const profile =
    await findUserProfile(
      prisma,
      user.id
    );

  if (!profile) {
    throw new AuthError(
      "User not found",
      404
    );
  }

  const tokens =
    await createTokenPair(
      prisma,
      user.id,
      input.rememberMe
    );

  return {
    user: profile,
    ...tokens,
  };
};
export const logoutUser = async (
  prisma: PrismaClient,
  refreshToken?: string
) => {
  if (!refreshToken) {
    return;
  }

  await prisma.refreshToken.deleteMany({
    where: {
      token: await hashRefreshToken(refreshToken),
    },
  });
};

export const refreshUserToken = async (
  prisma: PrismaClient,
  input: RefreshInput
) => {

  const refreshToken = input.refreshToken;

  if (!refreshToken) {
    throw new AuthError(
      "Refresh token is required",
      401
    );
  }

  const refreshTokenHash = await hashRefreshToken(refreshToken);

  let payload: { userId: string; rememberMe?: boolean };

  try {

    payload =
      await verifyRefreshToken(refreshToken);

  } catch {

    await prisma.refreshToken.deleteMany({
      where: {
        token: refreshTokenHash,
      },
    });

    throw new AuthError(
      "Invalid refresh token",
      401
    );
  }

  const storedToken =
    await prisma.refreshToken.findUnique({

      where: {
        token: refreshTokenHash,
      },

    });

  if (!storedToken) {
    throw new AuthError(
      "Invalid refresh token",
      401
    );
  }

  if (
    storedToken.userId !== payload.userId
  ) {
    throw new AuthError(
      "Invalid refresh token",
      401
    );
  }

  if (
    storedToken.expiresAt.getTime() <=
    Date.now()
  ) {

    await prisma.refreshToken.delete({

      where: {
        id: storedToken.id,
      },

    });

    throw new AuthError(
      "Refresh token expired",
      401
    );
  }

  const user =
    await findUserProfile(
      prisma,
      payload.userId
    );

  if (!user) {

    await prisma.refreshToken.delete({

      where: {
        id: storedToken.id,
      },

    });

    throw new AuthError(
      "User not found",
      404
    );
  }

  const accessToken =
    await generateAccessToken(user.id);

  const rememberMe = payload.rememberMe ?? true;
  const newRefreshToken =
    await generateRefreshToken(user.id, rememberMe);

  await prisma.$transaction([

    prisma.refreshToken.delete({
      where: {
        id: storedToken.id,
      },
    }),

    prisma.refreshToken.create({
      data: {
        token: await hashRefreshToken(newRefreshToken),
        userId: user.id,
        expiresAt: getRefreshTokenExpiry(),
      },
    }),

  ]);

  return {
    user,
    accessToken,
    refreshToken: newRefreshToken,
    rememberMe,
  };
};
export const getCurrentUser = async (
  prisma: PrismaClient,
  userId: string
) => {
  const user = await findUserProfile(
    prisma,
    userId
  );

  if (!user) {
    throw new AuthError(
      "User not found",
      404
    );
  }

  return user;
};

export const updateUserProfile = async (
  prisma: PrismaClient,
  userId: string,
  data: {
    displayName?: string;
    avatar?: string | null;
    bio?: string | null;
    github?: string | null;
    twitter?: string | null;
    website?: string | null;
    linkedin?: string | null;
  }
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AuthError("User not found", 404);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.displayName ? { displayName: data.displayName.trim() } : {}),
      ...(data.avatar !== undefined ? { avatar: data.avatar } : {}),
      ...(data.bio !== undefined ? { bio: data.bio } : {}),
      ...(data.github !== undefined ? { github: data.github } : {}),
      ...(data.twitter !== undefined ? { twitter: data.twitter } : {}),
      ...(data.website !== undefined ? { website: data.website } : {}),
      ...(data.linkedin !== undefined ? { linkedin: data.linkedin } : {}),
    },
    select: userSelect,
  });

  return updated;
};


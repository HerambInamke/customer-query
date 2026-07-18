import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const signToken = (payload) => {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, env.jwtSecret);
};

const buildCookieOptions = (overrides = {}) => {
  const isSecure = env.isProduction || env.clientUrl.startsWith('https://');
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? 'none' : 'lax',
    expires: new Date(Date.now() + env.jwtCookieExpiresIn * 24 * 60 * 60 * 1000),
    path: '/',
    ...overrides,
  };
};

export const createTokenCookie = (res, token) => {
  res.cookie('token', token, buildCookieOptions());
};

export const clearTokenCookie = (res) => {
  res.cookie('token', '', buildCookieOptions({ expires: new Date(0), maxAge: 0 }));
};

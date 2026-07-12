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

const buildCookieOptions = (overrides = {}) => ({
  httpOnly: true,                                         // JS can never read this cookie
  secure: env.isProduction,                               // HTTPS only in production
  sameSite: env.isProduction ? 'none' : 'lax',           // 'none' needed for cross-origin in prod, 'lax' fine in dev
  expires: new Date(Date.now() + env.jwtCookieExpiresIn * 24 * 60 * 60 * 1000),
  path: '/',                                              // available on all routes
  ...overrides,
});

export const createTokenCookie = (res, token) => {
  res.cookie('token', token, buildCookieOptions());
};

export const clearTokenCookie = (res) => {
  res.cookie('token', '', buildCookieOptions({
    expires: new Date(0),                                 // expire immediately
    maxAge: 0,
  }));
};

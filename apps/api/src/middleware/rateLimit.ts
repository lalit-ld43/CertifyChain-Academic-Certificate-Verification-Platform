import rateLimit from 'express-rate-limit';
import { ErrorCode } from '@certifychain/shared';

function limiterResponse(code: string, message: string) {
  return (req: any, res: any) => {
    res.status(429).json({
      success: false,
      error: { code, message, requestId: req.requestId },
    });
  };
}

/** Strict limiter for auth endpoints — highest abuse surface (credential stuffing). */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse(ErrorCode.RATE_LIMITED, 'Rate limit exceeded. Please wait 15 minutes before trying again.'),
});

/** Public verification endpoints — generous but bounded, since recruiters have no account. */
export const verifyRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse(ErrorCode.RATE_LIMITED, 'Too many verification requests. Slow down.'),
});

/** File upload endpoints — expensive operations (hashing, Cloudinary). */
export const uploadRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: limiterResponse(ErrorCode.RATE_LIMITED, 'Too many uploads. Try again shortly.'),
});

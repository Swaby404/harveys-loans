import { RateLimiterMemory } from "rate-limiter-flexible";

const authLimiter = new RateLimiterMemory({
  keyPrefix: "auth_fail",
  points: 5,
  duration: 900, // 15 minutes
  blockDuration: 900,
});

const registerLimiter = new RateLimiterMemory({
  keyPrefix: "register",
  points: 10,
  duration: 3600,
  blockDuration: 3600,
});

const passwordResetLimiter = new RateLimiterMemory({
  keyPrefix: "pwd_reset",
  points: 3,
  duration: 3600,
  blockDuration: 3600,
});

const generalApiLimiter = new RateLimiterMemory({
  keyPrefix: "api_general",
  points: 30,
  duration: 60,
  blockDuration: 60,
});

export async function checkAuthRateLimit(ip: string): Promise<boolean> {
  try {
    await authLimiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}

export async function checkRegisterRateLimit(ip: string): Promise<boolean> {
  try {
    await registerLimiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}

export async function checkPasswordResetRateLimit(ip: string): Promise<boolean> {
  try {
    await passwordResetLimiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}

export async function checkGeneralRateLimit(ip: string): Promise<boolean> {
  try {
    await generalApiLimiter.consume(ip);
    return true;
  } catch {
    return false;
  }
}

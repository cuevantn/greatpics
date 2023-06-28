import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = new Redis({
  url: String(process.env.UPSTASH_REDIS_REST_URL),
  token: String(process.env.UPSTASH_REDIS_REST_TOKEN),
});

export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.fixedWindow(18, "6 h"),
  analytics: true,
});


export const runtime = "edge";
export const maxDuration = 10;

import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

const redis = Redis.fromEnv();

export async function GET() {
  try {
    await redis.set("taurus_test", "working");
    const value = await redis.get("taurus_test");

    return NextResponse.json({
      success: true,
      redis: value,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: String(error),
    });
  }
}
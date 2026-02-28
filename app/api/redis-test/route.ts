import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export const runtime = "edge";

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
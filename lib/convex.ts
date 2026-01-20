import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;

if (!convexUrl) {
  throw new Error("Missing VITE_CONVEX_URL (set it in .env.local)");
}

export const convex = new ConvexReactClient(convexUrl);

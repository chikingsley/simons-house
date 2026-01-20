import {
  api as generatedConvexApi,
  internal as generatedInternalApi,
} from "../convex/_generated/api";

// Convex codegen is permissive in this repo (api types are `{}`), so we cast.
export const convexApi = generatedConvexApi as any;
export const convexInternalApi = generatedInternalApi as any;

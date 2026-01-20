import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { getViewer } from "./lib/auth";

export const createReference = mutation({
  args: {
    userId: v.string(),
    type: v.union(
      v.literal("Host"),
      v.literal("Surfer"),
      v.literal("Personal")
    ),
    text: v.string(),
    isPositive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const target = await ctx.db.get(args.userId as any);
    if (!target) {
      throw new Error("User not found");
    }

    const id = await ctx.db.insert("references", {
      userId: target._id,
      authorId: viewer._id,
      type: args.type,
      text: args.text,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      isPositive: args.isPositive,
    });

    await ctx.db.patch(target._id, {
      referencesCount: target.referencesCount + 1,
    });

    return {
      id,
      authorId: viewer._id,
      authorName: viewer.name,
      authorAvatar: viewer.avatarUrl,
      authorLocation: viewer.location,
      type: args.type,
      text: args.text,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      isPositive: args.isPositive,
    };
  },
});

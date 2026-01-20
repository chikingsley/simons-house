import { v } from "convex/values";
import { query } from "./_generated/server";
import { getViewer } from "./lib/auth";

export const hasInteractionHistory = query({
  args: { otherUserId: v.string() },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const other = await ctx.db.get(args.otherUserId as any);
    if (!other) {
      return false;
    }

    const asSender = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", viewer._id))
      .collect();
    const asRecipient = await ctx.db
      .query("conversations")
      .withIndex("by_otherUserId", (q) => q.eq("otherUserId", viewer._id))
      .collect();

    const all = [...asSender, ...asRecipient];
    return all.some(
      (c) =>
        (c.userId === viewer._id && c.otherUserId === other._id) ||
        (c.userId === other._id && c.otherUserId === viewer._id)
    );
  },
});

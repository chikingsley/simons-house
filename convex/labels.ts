import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getViewer } from "./lib/auth";

export const getLabels = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    const labels = await ctx.db
      .query("labels")
      .withIndex("by_userId", (q) => q.eq("userId", viewer._id))
      .collect();

    return labels.map((l) => ({ id: l._id, name: l.name, color: l.color }));
  },
});

export const createLabel = mutation({
  args: {
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const id = await ctx.db.insert("labels", {
      userId: viewer._id,
      name: args.name,
      color: args.color,
    });
    return { id, name: args.name, color: args.color };
  },
});

export const deleteLabel = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const label = await ctx.db.get(args.id as any);
    if (!label) {
      return true;
    }
    if (label.userId !== viewer._id) {
      throw new Error("Forbidden");
    }
    await ctx.db.delete(label._id);
    return true;
  },
});

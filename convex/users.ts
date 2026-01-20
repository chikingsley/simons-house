import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { getViewer } from "./lib/auth";

function toUserShape(doc: any) {
  // Keep `id` as the Convex document id string to match the frontend types.
  return {
    id: doc._id,
    name: doc.name,
    location: doc.location,
    avatarUrl: doc.avatarUrl,
    coverUrl: doc.coverUrl,
    verification: doc.verification,
    referencesCount: doc.referencesCount,
    friendsCount: doc.friendsCount,
    languages: doc.languages,
    occupation: doc.occupation,
    education: doc.education,
    interests: doc.interests,
    age: doc.age,
    gender: doc.gender,
    joinedDate: doc.joinedDate,
    responseRate: doc.responseRate,
    responseTime: doc.responseTime,
    lastLogin: doc.lastLogin,
    status: doc.status,
  };
}

function toProfileExtendedShape(doc: any, references: any[]) {
  return {
    ...toUserShape(doc),
    aboutMe: doc.aboutMe,
    oneAmazingThing: doc.oneAmazingThing,
    teachLearnShare: doc.teachLearnShare,
    whyImOnCouchsurfing: doc.whyImOnCouchsurfing,
    musicMoviesBooks: doc.musicMoviesBooks,
    countriesVisited: doc.countriesVisited,
    countriesLived: doc.countriesLived,
    homeDetails: doc.homeDetails,
    photos: doc.photos,
    references,
  };
}

export const getUsers = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);

    const limit = args.limit ?? 12;
    const offset = args.offset ?? 0;

    // NOTE: Convex is cursor-based for scalable pagination. This is a simple
    // offset implementation to preserve the existing component contracts.
    const all = await ctx.db.query("users").collect();
    const others = all.filter((u) => u._id !== viewer._id);
    const total = others.length;
    const page = others.slice(offset, offset + limit);

    return {
      users: page.map(toUserShape),
      total,
      hasMore: offset + page.length < total,
    };
  },
});

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    const refs = await ctx.db
      .query("references")
      .withIndex("by_userId", (q) => q.eq("userId", viewer._id))
      .collect();

    const references = await Promise.all(
      refs.map(async (r) => {
        const author = await ctx.db.get(r.authorId);
        return {
          id: r._id,
          authorId: author?._id ?? r.authorId,
          authorName: author?.name ?? "Unknown",
          authorAvatar: author?.avatarUrl ?? "",
          authorLocation: author?.location ?? "",
          type: r.type,
          text: r.text,
          date: r.date,
          isPositive: r.isPositive,
          response: r.response,
          responseDate: r.responseDate,
        };
      })
    );

    return toProfileExtendedShape(viewer, references);
  },
});

export const getUser = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    await getViewer(ctx);
    const user = await ctx.db.get(args.id as any);
    if (!user) {
      return null;
    }

    const refs = await ctx.db
      .query("references")
      .withIndex("by_userId", (q) => q.eq("userId", user._id))
      .collect();

    const references = await Promise.all(
      refs.map(async (r) => {
        const author = await ctx.db.get(r.authorId);
        return {
          id: r._id,
          authorId: author?._id ?? r.authorId,
          authorName: author?.name ?? "Unknown",
          authorAvatar: author?.avatarUrl ?? "",
          authorLocation: author?.location ?? "",
          type: r.type,
          text: r.text,
          date: r.date,
          isPositive: r.isPositive,
          response: r.response,
          responseDate: r.responseDate,
        };
      })
    );

    return toProfileExtendedShape(user, references);
  },
});

export const updateUser = mutation({
  args: {
    id: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    if (viewer._id !== (args.id as any)) {
      throw new Error("Forbidden");
    }

    // Patch only known fields.
    const allowed: Record<string, unknown> = {};
    const data = args.data as Record<string, unknown>;

    const keys = [
      "name",
      "location",
      "avatarUrl",
      "coverUrl",
      "status",
      "aboutMe",
      "occupation",
      "education",
      "interests",
      "languages",
      "whyImOnCouchsurfing",
      "oneAmazingThing",
      "teachLearnShare",
      "musicMoviesBooks",
      "homeDetails",
      "photos",
      "countriesVisited",
      "countriesLived",
    ];

    for (const k of keys) {
      if (k in data) {
        allowed[k] = data[k];
      }
    }

    await ctx.db.patch(viewer._id, allowed);
    return true;
  },
});

export const ensureViewer = internalMutation({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);
    return { id: viewer._id };
  },
});

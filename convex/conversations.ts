import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getViewer } from "./lib/auth";

function isParticipant(conv: any, userId: any): boolean {
  return conv.userId === userId || conv.otherUserId === userId;
}

export const getConversations = query({
  args: {},
  handler: async (ctx) => {
    const viewer = await getViewer(ctx);

    const asSender = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", viewer._id))
      .collect();
    const asRecipient = await ctx.db
      .query("conversations")
      .withIndex("by_otherUserId", (q) => q.eq("otherUserId", viewer._id))
      .collect();

    const all = [...asSender, ...asRecipient];

    const hydrated = await Promise.all(
      all.map(async (conv) => {
        const isRecipient = conv.userId !== viewer._id;
        const otherUserId = isRecipient ? conv.userId : conv.otherUserId;
        const otherUser = await ctx.db.get(otherUserId);
        if (!otherUser) {
          throw new Error("Conversation user not found");
        }
        const msgs = await ctx.db
          .query("messages")
          .withIndex("by_conversationId", (q) =>
            q.eq("conversationId", conv._id)
          )
          .collect();

        const sortedMsgs = msgs.sort((a, b) =>
          a.timestamp.localeCompare(b.timestamp)
        );
        const lastMessageAt =
          conv.lastMessageAt ?? sortedMsgs.at(-1)?.timestamp ?? null;

        return {
          id: conv._id,
          otherUser: {
            id: otherUser._id,
            name: otherUser.name,
            location: otherUser.location,
            avatarUrl: otherUser.avatarUrl,
            coverUrl: otherUser.coverUrl,
            verification: otherUser.verification,
            referencesCount: otherUser.referencesCount,
            friendsCount: otherUser.friendsCount,
            languages: otherUser.languages,
            occupation: otherUser.occupation,
            education: otherUser.education,
            interests: otherUser.interests,
            age: otherUser.age,
            gender: otherUser.gender,
            joinedDate: otherUser.joinedDate,
            responseRate: otherUser.responseRate,
            responseTime: otherUser.responseTime,
            lastLogin: otherUser.lastLogin,
            status: otherUser.status,
          },
          lastMessage: conv.lastMessage,
          lastMessageDate: conv.lastMessageDate,
          lastMessageAt: lastMessageAt ?? undefined,
          status: conv.status,
          requestType: conv.requestType,
          isRequest: conv.isRequest,
          requestStatus: conv.requestStatus,
          isBlocked: conv.isBlocked,
          labels: conv.labels,
          notes: conv.notes,
          isIncoming: isRecipient,
          messages: sortedMsgs.map((m) => ({
            id: m._id,
            senderId: m.senderId,
            text: m.text,
            timestamp: m.timestamp,
            isRead: m.isRead,
          })),
        };
      })
    );

    // Sort newest-first by ISO timestamp when present.
    return hydrated.sort((a, b) => {
      const aT = a.lastMessageAt ? Date.parse(a.lastMessageAt) : 0;
      const bT = b.lastMessageAt ? Date.parse(b.lastMessageAt) : 0;
      return bT - aT;
    });
  },
});

export const createConversation = mutation({
  args: {
    otherUserId: v.string(),
    requestType: v.union(v.literal("host"), v.literal("meetup")),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const other = await ctx.db.get(args.otherUserId as any);
    if (!other) {
      throw new Error("User not found");
    }

    const nowIso = new Date().toISOString();

    // Best-effort dedupe: if a conversation already exists between these two users, reuse it.
    const existingAsSender = await ctx.db
      .query("conversations")
      .withIndex("by_userId", (q) => q.eq("userId", viewer._id))
      .filter((q) => q.eq(q.field("otherUserId"), other._id))
      .first();
    const existingAsRecipient = await ctx.db
      .query("conversations")
      .withIndex("by_otherUserId", (q) => q.eq("otherUserId", viewer._id))
      .filter((q) => q.eq(q.field("userId"), other._id))
      .first();
    const existing = existingAsSender ?? existingAsRecipient ?? null;

    if (existing) {
      // Treat as "send message" into existing thread.
      const msgId = await ctx.db.insert("messages", {
        conversationId: existing._id,
        senderId: viewer._id,
        text: args.message,
        timestamp: nowIso,
        isRead: false,
      });
      await ctx.db.patch(existing._id, {
        lastMessage: args.message,
        lastMessageDate: "Just now",
        lastMessageAt: nowIso,
      });
      return {
        id: existing._id,
        otherUser: {
          id: other._id,
          name: other.name,
          location: other.location,
          avatarUrl: other.avatarUrl,
          coverUrl: other.coverUrl,
          verification: other.verification,
          referencesCount: other.referencesCount,
          friendsCount: other.friendsCount,
          languages: other.languages,
          occupation: other.occupation,
          education: other.education,
          interests: other.interests,
          age: other.age,
          gender: other.gender,
          joinedDate: other.joinedDate,
          responseRate: other.responseRate,
          responseTime: other.responseTime,
          lastLogin: other.lastLogin,
          status: other.status,
        },
        lastMessage: args.message,
        lastMessageDate: "Just now",
        lastMessageAt: nowIso,
        status: existing.status,
        requestType: existing.requestType,
        isRequest: existing.isRequest,
        requestStatus: existing.requestStatus,
        isBlocked: existing.isBlocked,
        labels: existing.labels,
        notes: existing.notes,
        messages: [
          {
            id: msgId,
            senderId: viewer._id,
            text: args.message,
            timestamp: nowIso,
            isRead: false,
          },
        ],
      };
    }

    const convId = await ctx.db.insert("conversations", {
      userId: viewer._id,
      otherUserId: other._id,
      lastMessage: args.message,
      lastMessageDate: "Just now",
      lastMessageAt: nowIso,
      status: "active",
      requestType: args.requestType,
      isRequest: true,
      requestStatus: "pending",
      isBlocked: false,
      labels: [],
    });

    const msgId = await ctx.db.insert("messages", {
      conversationId: convId,
      senderId: viewer._id,
      text: args.message,
      timestamp: nowIso,
      isRead: false,
    });

    return {
      id: convId,
      otherUser: {
        id: other._id,
        name: other.name,
        location: other.location,
        avatarUrl: other.avatarUrl,
        coverUrl: other.coverUrl,
        verification: other.verification,
        referencesCount: other.referencesCount,
        friendsCount: other.friendsCount,
        languages: other.languages,
        occupation: other.occupation,
        education: other.education,
        interests: other.interests,
        age: other.age,
        gender: other.gender,
        joinedDate: other.joinedDate,
        responseRate: other.responseRate,
        responseTime: other.responseTime,
        lastLogin: other.lastLogin,
        status: other.status,
      },
      lastMessage: args.message,
      lastMessageDate: "Just now",
      lastMessageAt: nowIso,
      status: "active",
      requestType: args.requestType,
      isRequest: true,
      requestStatus: "pending",
      isBlocked: false,
      labels: [],
      messages: [
        {
          id: msgId,
          senderId: viewer._id,
          text: args.message,
          timestamp: nowIso,
          isRead: false,
        },
      ],
    };
  },
});

export const sendMessage = mutation({
  args: {
    conversationId: v.string(),
    text: v.string(),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const conv = await ctx.db.get(args.conversationId as any);
    if (!conv) {
      throw new Error("Conversation not found");
    }
    if (conv.userId !== viewer._id && conv.otherUserId !== viewer._id) {
      throw new Error("Forbidden");
    }
    if (conv.isBlocked) {
      throw new Error("Conversation is blocked");
    }
    if (conv.status === "archived") {
      throw new Error("Conversation is archived");
    }

    const nowIso = new Date().toISOString();
    const id = await ctx.db.insert("messages", {
      conversationId: conv._id,
      senderId: viewer._id,
      text: args.text,
      timestamp: nowIso,
      isRead: false,
    });

    await ctx.db.patch(conv._id, {
      lastMessage: args.text,
      lastMessageDate: "Just now",
      lastMessageAt: nowIso,
    });

    return {
      id,
      senderId: viewer._id,
      text: args.text,
      timestamp: nowIso,
      isRead: false,
    };
  },
});

export const updateConversationLabels = mutation({
  args: {
    conversationId: v.string(),
    labels: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const conv = await ctx.db.get(args.conversationId as any);
    if (!conv) {
      throw new Error("Conversation not found");
    }
    if (conv.userId !== viewer._id && conv.otherUserId !== viewer._id) {
      throw new Error("Forbidden");
    }
    await ctx.db.patch(conv._id, { labels: args.labels });
    return true;
  },
});

export const setConversationStatus = mutation({
  args: {
    conversationId: v.string(),
    status: v.union(v.literal("active"), v.literal("archived")),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const conv = await ctx.db.get(args.conversationId as any);
    if (!conv) {
      throw new Error("Conversation not found");
    }
    if (!isParticipant(conv, viewer._id)) {
      throw new Error("Forbidden");
    }
    await ctx.db.patch(conv._id, { status: args.status });
    return true;
  },
});

export const setConversationBlocked = mutation({
  args: { conversationId: v.string(), isBlocked: v.boolean() },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const conv = await ctx.db.get(args.conversationId as any);
    if (!conv) {
      throw new Error("Conversation not found");
    }
    if (!isParticipant(conv, viewer._id)) {
      throw new Error("Forbidden");
    }
    await ctx.db.patch(conv._id, { isBlocked: args.isBlocked });
    return true;
  },
});

export const setConversationNotes = mutation({
  args: { conversationId: v.string(), notes: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const conv = await ctx.db.get(args.conversationId as any);
    if (!conv) {
      throw new Error("Conversation not found");
    }
    if (!isParticipant(conv, viewer._id)) {
      throw new Error("Forbidden");
    }
    const nextNotes = (args.notes ?? "").trim();
    await ctx.db.patch(conv._id, { notes: nextNotes ? nextNotes : undefined });
    return true;
  },
});

export const markConversationRead = mutation({
  args: { conversationId: v.string() },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const conv = await ctx.db.get(args.conversationId as any);
    if (!conv) {
      throw new Error("Conversation not found");
    }
    if (!isParticipant(conv, viewer._id)) {
      throw new Error("Forbidden");
    }

    const msgs = await ctx.db
      .query("messages")
      .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
      .collect();

    const unreadIncoming = msgs.filter(
      (m) => m.senderId !== viewer._id && m.isRead === false
    );

    await Promise.all(
      unreadIncoming.map((m) => ctx.db.patch(m._id, { isRead: true }))
    );
    return { updated: unreadIncoming.length };
  },
});

export const respondToRequest = mutation({
  args: {
    conversationId: v.string(),
    action: v.union(v.literal("accept"), v.literal("decline")),
  },
  handler: async (ctx, args) => {
    const viewer = await getViewer(ctx);
    const conv = await ctx.db.get(args.conversationId as any);
    if (!conv) {
      throw new Error("Conversation not found");
    }
    if (!isParticipant(conv, viewer._id)) {
      throw new Error("Forbidden");
    }
    if (!conv.isRequest) {
      return { ok: true, alreadyHandled: true };
    }

    const nowIso = new Date().toISOString();
    const requestStatus = args.action === "accept" ? "accepted" : "declined";
    const systemText =
      args.action === "accept"
        ? "Accepted the request."
        : "Declined the request.";

    const msgId = await ctx.db.insert("messages", {
      conversationId: conv._id,
      senderId: viewer._id,
      text: systemText,
      timestamp: nowIso,
      isRead: false,
    });

    await ctx.db.patch(conv._id, {
      isRequest: false,
      requestStatus,
      status: args.action === "decline" ? "archived" : conv.status,
      lastMessage: systemText,
      lastMessageDate: "Just now",
      lastMessageAt: nowIso,
    });

    return {
      ok: true,
      requestStatus,
      status: args.action === "decline" ? "archived" : conv.status,
      isRequest: false,
      message: {
        id: msgId,
        senderId: viewer._id,
        text: systemText,
        timestamp: nowIso,
        isRead: false,
      },
      lastMessage: systemText,
      lastMessageDate: "Just now",
      lastMessageAt: nowIso,
    };
  },
});

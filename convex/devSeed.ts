import { v } from "convex/values";
import { mutation } from "./_generated/server";

const DEFAULT_USER = {
  name: "New Member",
  location: "Unknown",
  avatarUrl: "https://picsum.photos/seed/simonshouse-avatar/200/200",
  coverUrl: "https://picsum.photos/seed/simonshouse-cover/1200/400",
  status: "wants_to_meet_up" as const,
  referencesCount: 0,
  friendsCount: 0,
  languages: ["English"],
  occupation: "",
  education: "",
  interests: [],
  age: 0,
  gender: "",
  joinedDate: new Date().getFullYear().toString(),
  responseRate: 100,
  responseTime: "Replies within a day",
  lastLogin: "Today",
  verification: {
    payment: false,
    phone: false,
    governmentId: false,
    address: "unverified" as const,
  },
  aboutMe: "",
  oneAmazingThing: "",
  teachLearnShare: "",
  whyImOnCouchsurfing: "",
  musicMoviesBooks: "",
  countriesVisited: [],
  countriesLived: [],
  photos: [],
  homeDetails: {
    maxGuests: 1,
    lastMinute: false,
    preferredGender: "Any",
    kidFriendly: false,
    petFriendly: false,
    smokingAllowed: false,
    hasPets: false,
    hasChildren: false,
    sleepingArrangements: "",
    roommateSituation: "",
    publicTransport: "",
    wheelchairAccessible: false,
  },
};

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const seed = mutation({
  args: {
    users: v.optional(v.number()),
    conversations: v.optional(v.number()),
    messagesPerConversation: v.optional(v.number()),
    reset: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Explicit opt-in: set `DEV_SEED_ENABLED=true` in your Convex env.
    if (process.env.DEV_SEED_ENABLED !== "true") {
      throw new Error(
        "Dev seeding disabled. Set DEV_SEED_ENABLED=true in Convex env vars to enable."
      );
    }

    const usersTarget = Math.max(0, Math.floor(args.users ?? 100));
    const convTarget = Math.max(0, Math.floor(args.conversations ?? 150));
    const msgsPerConv = Math.max(
      1,
      Math.floor(args.messagesPerConversation ?? 8)
    );
    const reset = args.reset === true;

    if (reset) {
      const msgs = await ctx.db.query("messages").collect();
      await Promise.all(msgs.map((m) => ctx.db.delete(m._id)));
      const convs = await ctx.db.query("conversations").collect();
      await Promise.all(convs.map((c) => ctx.db.delete(c._id)));
      const labels = await ctx.db.query("labels").collect();
      await Promise.all(labels.map((l) => ctx.db.delete(l._id)));
      const refs = await ctx.db.query("references").collect();
      await Promise.all(refs.map((r) => ctx.db.delete(r._id)));
      const settings = await ctx.db.query("settings").collect();
      await Promise.all(settings.map((s) => ctx.db.delete(s._id)));
      const users = await ctx.db.query("users").collect();
      await Promise.all(users.map((u) => ctx.db.delete(u._id)));
    }

    const existingUsers = await ctx.db.query("users").collect();
    const names = [
      "Alex",
      "Sam",
      "Jordan",
      "Taylor",
      "Casey",
      "Riley",
      "Morgan",
      "Jamie",
      "Avery",
      "Skyler",
    ];
    const cities = [
      "Lagos, NG",
      "Nairobi, KE",
      "Accra, GH",
      "Cape Town, ZA",
      "Berlin, DE",
      "Lisbon, PT",
      "Paris, FR",
      "New York, USA",
      "São Paulo, BR",
      "Tokyo, JP",
    ];
    const interests = [
      "Hiking",
      "Cooking",
      "Photography",
      "Music",
      "Art",
      "Cycling",
      "History",
      "Tech",
      "Coffee",
      "Languages",
    ];
    const statuses = [
      "accepting_guests",
      "maybe_accepting_guests",
      "not_accepting_guests",
      "wants_to_meet_up",
    ] as const;

    const userIds: any[] = existingUsers.map((u) => u._id);
    const toCreate = Math.max(0, usersTarget - userIds.length);
    for (let i = 0; i < toCreate; i++) {
      const n = pick(names);
      const id = await ctx.db.insert("users", {
        ...DEFAULT_USER,
        clerkUserId: `dev_fake_${Date.now()}_${i}_${Math.random().toString(16).slice(2)}`,
        name: `${n} ${i + 1}`,
        location: pick(cities),
        avatarUrl: `https://picsum.photos/seed/simons-house-${i}/200/200`,
        coverUrl: `https://picsum.photos/seed/simons-house-cover-${i}/1200/400`,
        status: pick([...statuses]),
        interests: Array.from({ length: 3 }, () => pick(interests)),
        age: 18 + Math.floor(Math.random() * 35),
        joinedDate: String(2018 + Math.floor(Math.random() * 7)),
        lastLogin: "Today",
      });
      userIds.push(id);
    }

    // Create conversations + messages.
    const existingConvs = await ctx.db.query("conversations").collect();
    const convToCreate = Math.max(0, convTarget - existingConvs.length);

    for (let i = 0; i < convToCreate; i++) {
      const a = pick(userIds);
      let b = pick(userIds);
      while (b === a) b = pick(userIds);

      const now = Date.now();
      const startedAt = new Date(
        now - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 14)
      ); // last 14 days
      const convId = await ctx.db.insert("conversations", {
        userId: a,
        otherUserId: b,
        lastMessage: "",
        lastMessageDate: "",
        lastMessageAt: startedAt.toISOString(),
        status: "active",
        requestType: undefined,
        isRequest: false,
        requestStatus: undefined,
        isBlocked: false,
        labels: [],
        notes: "",
      });

      let lastText = "Hello!";
      let lastAt = startedAt;
      for (let m = 0; m < msgsPerConv; m++) {
        const sender = m % 2 === 0 ? a : b;
        const ts = new Date(
          startedAt.getTime() +
            m * 1000 * 60 * (5 + Math.floor(Math.random() * 25))
        );
        lastAt = ts;
        lastText = `Message ${m + 1} in thread ${i + 1}`;
        await ctx.db.insert("messages", {
          conversationId: convId,
          senderId: sender,
          text: lastText,
          timestamp: ts.toISOString(),
          isRead: Math.random() > 0.35,
        });
      }

      await ctx.db.patch(convId, {
        lastMessage: lastText,
        lastMessageDate: "Just now",
        lastMessageAt: lastAt.toISOString(),
      });
    }

    return {
      ok: true,
      users: userIds.length,
      conversations: (await ctx.db.query("conversations").collect()).length,
      messages: (await ctx.db.query("messages").collect()).length,
    };
  },
});

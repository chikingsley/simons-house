import type { MutationCtx, QueryCtx } from "../_generated/server";

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

export async function getViewer(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const clerkUserId = identity.subject;
  const existing = await ctx.db
    .query("users")
    .withIndex("by_clerkUserId", (q) => q.eq("clerkUserId", clerkUserId))
    .unique();

  if (existing) {
    return existing;
  }

  // First login: create a minimal user record.
  const name = identity.name ?? identity.nickname ?? DEFAULT_USER.name;
  const avatarUrl = identity.pictureUrl ?? DEFAULT_USER.avatarUrl;

  const id = await ctx.db.insert("users", {
    ...DEFAULT_USER,
    clerkUserId,
    name,
    avatarUrl,
  });

  const created = await ctx.db.get(id);
  if (!created) {
    throw new Error("Failed to create user");
  }
  return created;
}

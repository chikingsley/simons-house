import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const verificationStatus = v.object({
  payment: v.boolean(),
  phone: v.boolean(),
  governmentId: v.boolean(),
  address: v.union(
    v.literal("verified"),
    v.literal("pending"),
    v.literal("unverified")
  ),
});

const homeDetails = v.object({
  maxGuests: v.number(),
  lastMinute: v.boolean(),
  preferredGender: v.string(),
  kidFriendly: v.boolean(),
  petFriendly: v.boolean(),
  smokingAllowed: v.boolean(),
  hasPets: v.boolean(),
  hasChildren: v.boolean(),
  sleepingArrangements: v.string(),
  roommateSituation: v.string(),
  publicTransport: v.string(),
  wheelchairAccessible: v.boolean(),
});

export default defineSchema({
  users: defineTable({
    clerkUserId: v.string(),
    name: v.string(),
    location: v.string(),
    avatarUrl: v.string(),
    coverUrl: v.optional(v.string()),
    status: v.union(
      v.literal("accepting_guests"),
      v.literal("maybe_accepting_guests"),
      v.literal("not_accepting_guests"),
      v.literal("wants_to_meet_up")
    ),
    referencesCount: v.number(),
    friendsCount: v.number(),
    languages: v.array(v.string()),
    occupation: v.string(),
    education: v.string(),
    interests: v.array(v.string()),
    age: v.number(),
    gender: v.string(),
    joinedDate: v.string(),
    responseRate: v.number(),
    responseTime: v.string(),
    lastLogin: v.string(),
    verification: verificationStatus,

    aboutMe: v.string(),
    oneAmazingThing: v.string(),
    teachLearnShare: v.string(),
    whyImOnCouchsurfing: v.string(),
    musicMoviesBooks: v.string(),
    countriesVisited: v.array(v.string()),
    countriesLived: v.array(v.string()),
    photos: v.array(v.string()),
    homeDetails,
  }).index("by_clerkUserId", ["clerkUserId"]),

  references: defineTable({
    userId: v.id("users"),
    authorId: v.id("users"),
    type: v.union(
      v.literal("Surfer"),
      v.literal("Host"),
      v.literal("Personal")
    ),
    text: v.string(),
    date: v.string(),
    isPositive: v.boolean(),
    response: v.optional(v.string()),
    responseDate: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_authorId", ["authorId"]),

  conversations: defineTable({
    userId: v.id("users"),
    otherUserId: v.id("users"),
    lastMessage: v.string(),
    lastMessageDate: v.string(),
    // ISO timestamp for reliable sorting & relative-time rendering.
    // Optional to avoid breaking existing documents created before this field existed.
    lastMessageAt: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("archived")),
    requestType: v.optional(v.union(v.literal("host"), v.literal("meetup"))),
    isRequest: v.boolean(),
    // Optional to avoid breaking existing documents created before this field existed.
    requestStatus: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("declined")
      )
    ),
    isBlocked: v.boolean(),
    labels: v.array(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_otherUserId", ["otherUserId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    text: v.string(),
    timestamp: v.string(),
    isRead: v.boolean(),
  }).index("by_conversationId", ["conversationId"]),

  labels: defineTable({
    userId: v.id("users"),
    name: v.string(),
    color: v.string(),
  }).index("by_userId", ["userId"]),

  settings: defineTable({
    userId: v.id("users"),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    emergencyContactName: v.optional(v.string()),
    emergencyContactPhone: v.optional(v.string()),
    emergencyContactEmail: v.optional(v.string()),
    emergencyContactNotes: v.optional(v.string()),
  }).index("by_userId", ["userId"]),
});

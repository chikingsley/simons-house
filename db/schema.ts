import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  coverUrl: text("cover_url"),
  status: text("status", {
    enum: [
      "accepting_guests",
      "maybe_accepting_guests",
      "not_accepting_guests",
      "wants_to_meet_up",
    ],
  }).notNull(),
  referencesCount: integer("references_count").notNull().default(0),
  friendsCount: integer("friends_count").notNull().default(0),
  languages: text("languages").notNull(), // JSON array
  occupation: text("occupation").notNull(),
  education: text("education").notNull(),
  interests: text("interests").notNull(), // JSON array
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  joinedDate: text("joined_date").notNull(),
  responseRate: integer("response_rate").notNull().default(100),
  responseTime: text("response_time").notNull(),
  lastLogin: text("last_login").notNull(),

  // Verification
  verificationPayment: integer("verification_payment", { mode: "boolean" })
    .notNull()
    .default(false),
  verificationPhone: integer("verification_phone", { mode: "boolean" })
    .notNull()
    .default(false),
  verificationGovernmentId: integer("verification_government_id", {
    mode: "boolean",
  })
    .notNull()
    .default(false),
  verificationAddress: text("verification_address", {
    enum: ["verified", "pending", "unverified"],
  })
    .notNull()
    .default("unverified"),

  // Extended profile info (for ProfileExtended)
  aboutMe: text("about_me"),
  oneAmazingThing: text("one_amazing_thing"),
  teachLearnShare: text("teach_learn_share"),
  whyImOnCouchsurfing: text("why_im_on_couchsurfing"),
  musicMoviesBooks: text("music_movies_books"),
  countriesVisited: text("countries_visited"), // JSON array
  countriesLived: text("countries_lived"), // JSON array
  photos: text("photos"), // JSON array

  // Home details (JSON)
  homeDetails: text("home_details"),
});

// References table
export const references = sqliteTable("references", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  authorId: text("author_id")
    .notNull()
    .references(() => users.id),
  authorName: text("author_name").notNull(),
  authorAvatar: text("author_avatar").notNull(),
  authorLocation: text("author_location").notNull(),
  type: text("type", { enum: ["Surfer", "Host", "Personal"] }).notNull(),
  text: text("text").notNull(),
  date: text("date").notNull(),
  isPositive: integer("is_positive", { mode: "boolean" }).notNull(),
  response: text("response"),
  responseDate: text("response_date"),
});

// Conversations table
export const conversations = sqliteTable("conversations", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  otherUserId: text("other_user_id")
    .notNull()
    .references(() => users.id),
  lastMessage: text("last_message").notNull(),
  lastMessageDate: text("last_message_date").notNull(),
  status: text("status", { enum: ["active", "archived"] })
    .notNull()
    .default("active"),
  requestType: text("request_type", { enum: ["host", "meetup"] }),
  isRequest: integer("is_request", { mode: "boolean" }).default(false),
  isBlocked: integer("is_blocked", { mode: "boolean" }).default(false),
  labels: text("labels"), // JSON array
  notes: text("notes"),
});

// Messages table
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => conversations.id),
  senderId: text("sender_id").notNull(),
  text: text("text").notNull(),
  timestamp: text("timestamp").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
});

// Settings table
export const settings = sqliteTable("settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  email: text("email"),
  phone: text("phone"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  emergencyContactEmail: text("emergency_contact_email"),
  emergencyContactNotes: text("emergency_contact_notes"),
});

// Labels table for reusable conversation labels
export const labels = sqliteTable("labels", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6b7280"),
});

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Reference = typeof references.$inferSelect;
export type NewReference = typeof references.$inferInsert;
export type Conversation = typeof conversations.$inferSelect;
export type NewConversation = typeof conversations.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;

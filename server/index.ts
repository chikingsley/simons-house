import { Database } from "bun:sqlite";
import type {
  Conversation,
  Label,
  Message,
  ProfileExtended,
  Reference,
  User,
} from "../types";

const db = new Database("couchsurfing.db");

// Helper to transform DB row to User type
function dbRowToUser(row: Record<string, unknown>): User {
  return {
    id: row.id as string,
    name: row.name as string,
    location: row.location as string,
    avatarUrl: row.avatar_url as string,
    coverUrl: row.cover_url as string | undefined,
    status: row.status as User["status"],
    referencesCount: row.references_count as number,
    friendsCount: row.friends_count as number,
    languages: JSON.parse((row.languages as string) || "[]"),
    occupation: row.occupation as string,
    education: row.education as string,
    interests: JSON.parse((row.interests as string) || "[]"),
    age: row.age as number,
    gender: row.gender as string,
    joinedDate: row.joined_date as string,
    responseRate: row.response_rate as number,
    responseTime: row.response_time as string,
    lastLogin: row.last_login as string,
    verification: {
      payment: Boolean(row.verification_payment),
      phone: Boolean(row.verification_phone),
      governmentId: Boolean(row.verification_government_id),
      address: row.verification_address as
        | "verified"
        | "pending"
        | "unverified",
    },
  };
}

function dbRowToProfileExtended(row: Record<string, unknown>): ProfileExtended {
  const user = dbRowToUser(row);
  return {
    ...user,
    aboutMe: (row.about_me as string) || "",
    oneAmazingThing: (row.one_amazing_thing as string) || "",
    teachLearnShare: (row.teach_learn_share as string) || "",
    whyImOnCouchsurfing: (row.why_im_on_couchsurfing as string) || "",
    musicMoviesBooks: (row.music_movies_books as string) || "",
    countriesVisited: JSON.parse((row.countries_visited as string) || "[]"),
    countriesLived: JSON.parse((row.countries_lived as string) || "[]"),
    photos: JSON.parse((row.photos as string) || "[]"),
    homeDetails: JSON.parse(
      (row.home_details as string) ||
        JSON.stringify({
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
        })
    ),
    references: [],
  };
}

// API Handlers
const handlers = {
  // Get all users (for dashboard)
  getUsers: (): User[] => {
    const rows = db.query("SELECT * FROM users WHERE id != 'me'").all();
    return rows.map((row) => dbRowToUser(row as Record<string, unknown>));
  },

  // Get current user
  getCurrentUser: (): ProfileExtended | null => {
    const row = db.query("SELECT * FROM users WHERE id = 'me'").get();
    if (!row) {
      return null;
    }
    const profile = dbRowToProfileExtended(row as Record<string, unknown>);

    // Get references
    const refs = db
      .query('SELECT * FROM "references" WHERE user_id = ?')
      .all("me");
    profile.references = refs.map((r) => {
      const ref = r as Record<string, unknown>;
      return {
        id: ref.id as string,
        authorId: ref.author_id as string,
        authorName: ref.author_name as string,
        authorAvatar: ref.author_avatar as string,
        authorLocation: ref.author_location as string,
        type: ref.type as Reference["type"],
        text: ref.text as string,
        date: ref.date as string,
        isPositive: Boolean(ref.is_positive),
        response: ref.response as string | undefined,
        responseDate: ref.response_date as string | undefined,
      };
    });

    return profile;
  },

  // Get user by ID
  getUser: (id: string): ProfileExtended | null => {
    const row = db.query("SELECT * FROM users WHERE id = ?").get(id);
    if (!row) {
      return null;
    }
    const profile = dbRowToProfileExtended(row as Record<string, unknown>);

    // Get references
    const refs = db
      .query('SELECT * FROM "references" WHERE user_id = ?')
      .all(id);
    profile.references = refs.map((r) => {
      const ref = r as Record<string, unknown>;
      return {
        id: ref.id as string,
        authorId: ref.author_id as string,
        authorName: ref.author_name as string,
        authorAvatar: ref.author_avatar as string,
        authorLocation: ref.author_location as string,
        type: ref.type as Reference["type"],
        text: ref.text as string,
        date: ref.date as string,
        isPositive: Boolean(ref.is_positive),
        response: ref.response as string | undefined,
        responseDate: ref.response_date as string | undefined,
      };
    });

    return profile;
  },

  // Get conversations for current user
  getConversations: (userId: string): Conversation[] => {
    const rows = db
      .query("SELECT * FROM conversations WHERE user_id = ?")
      .all(userId);

    return rows.map((row) => {
      const conv = row as Record<string, unknown>;
      const otherUserRow = db
        .query("SELECT * FROM users WHERE id = ?")
        .get(conv.other_user_id as string);
      const otherUser = otherUserRow
        ? dbRowToUser(otherUserRow as Record<string, unknown>)
        : null;

      // Get messages
      const msgs = db
        .query(
          "SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC"
        )
        .all(conv.id as string);

      if (!otherUser) {
        throw new Error(`User ${conv.other_user_id} not found`);
      }

      return {
        id: conv.id as string,
        otherUser,
        lastMessage: conv.last_message as string,
        lastMessageDate: conv.last_message_date as string,
        status: conv.status as "active" | "archived",
        requestType: conv.request_type as "host" | "meetup" | undefined,
        isRequest: Boolean(conv.is_request),
        isBlocked: Boolean(conv.is_blocked),
        labels: JSON.parse((conv.labels as string) || "[]"),
        notes: conv.notes as string | undefined,
        messages: msgs.map((m) => {
          const msg = m as Record<string, unknown>;
          return {
            id: msg.id as string,
            senderId: msg.sender_id as string,
            text: msg.text as string,
            timestamp: msg.timestamp as string,
            isRead: Boolean(msg.is_read),
          };
        }),
      };
    });
  },

  // Update user profile
  updateUser: (id: string, data: Partial<ProfileExtended>): boolean => {
    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];

    if (data.name !== undefined) {
      updates.push("name = ?");
      values.push(data.name);
    }
    if (data.location !== undefined) {
      updates.push("location = ?");
      values.push(data.location);
    }
    if (data.aboutMe !== undefined) {
      updates.push("about_me = ?");
      values.push(data.aboutMe);
    }
    if (data.occupation !== undefined) {
      updates.push("occupation = ?");
      values.push(data.occupation);
    }
    if (data.education !== undefined) {
      updates.push("education = ?");
      values.push(data.education);
    }
    if (data.interests !== undefined) {
      updates.push("interests = ?");
      values.push(JSON.stringify(data.interests));
    }
    if (data.languages !== undefined) {
      updates.push("languages = ?");
      values.push(JSON.stringify(data.languages));
    }
    if (data.status !== undefined) {
      updates.push("status = ?");
      values.push(data.status);
    }
    if (data.whyImOnCouchsurfing !== undefined) {
      updates.push("why_im_on_couchsurfing = ?");
      values.push(data.whyImOnCouchsurfing);
    }
    if (data.oneAmazingThing !== undefined) {
      updates.push("one_amazing_thing = ?");
      values.push(data.oneAmazingThing);
    }
    if (data.teachLearnShare !== undefined) {
      updates.push("teach_learn_share = ?");
      values.push(data.teachLearnShare);
    }
    if (data.musicMoviesBooks !== undefined) {
      updates.push("music_movies_books = ?");
      values.push(data.musicMoviesBooks);
    }
    if (data.homeDetails !== undefined) {
      updates.push("home_details = ?");
      values.push(JSON.stringify(data.homeDetails));
    }
    if (data.photos !== undefined) {
      updates.push("photos = ?");
      values.push(JSON.stringify(data.photos));
    }
    if (data.countriesVisited !== undefined) {
      updates.push("countries_visited = ?");
      values.push(JSON.stringify(data.countriesVisited));
    }
    if (data.countriesLived !== undefined) {
      updates.push("countries_lived = ?");
      values.push(JSON.stringify(data.countriesLived));
    }

    if (updates.length === 0) {
      return false;
    }

    values.push(id);
    db.query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values
    );
    return true;
  },

  // Send message
  sendMessage: (
    conversationId: string,
    senderId: string,
    text: string
  ): Message => {
    const id = `msg-${Date.now()}`;
    const timestamp = new Date().toISOString();

    db.query(
      "INSERT INTO messages (id, conversation_id, sender_id, text, timestamp, is_read) VALUES (?, ?, ?, ?, ?, 0)"
    ).run(id, conversationId, senderId, text, timestamp);

    // Update conversation last message
    db.query(
      "UPDATE conversations SET last_message = ?, last_message_date = ? WHERE id = ?"
    ).run(text, "Just now", conversationId);

    return {
      id,
      senderId,
      text,
      timestamp,
      isRead: false,
    };
  },

  // Get labels for a user
  getLabels: (userId: string): Label[] => {
    const rows = db.query("SELECT * FROM labels WHERE user_id = ?").all(userId);
    return rows.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        id: r.id as string,
        name: r.name as string,
        color: r.color as string,
      };
    });
  },

  // Create a new label
  createLabel: (userId: string, name: string, color: string): Label => {
    const id = `label-${Date.now()}`;
    db.query(
      "INSERT INTO labels (id, user_id, name, color) VALUES (?, ?, ?, ?)"
    ).run(id, userId, name, color);
    return { id, name, color };
  },

  // Delete a label
  deleteLabel: (id: string): boolean => {
    db.query("DELETE FROM labels WHERE id = ?").run(id);
    return true;
  },

  // Update conversation labels
  updateConversationLabels: (
    conversationId: string,
    labels: string[]
  ): boolean => {
    db.query("UPDATE conversations SET labels = ? WHERE id = ?").run(
      JSON.stringify(labels),
      conversationId
    );
    return true;
  },

  // Create new conversation
  createConversation: (
    userId: string,
    otherUserId: string,
    requestType: "host" | "meetup",
    initialMessage: string
  ): Conversation => {
    const convId = `conv-${Date.now()}`;
    const msgId = `msg-${Date.now()}`;
    const timestamp = new Date().toISOString();

    db.query(
      "INSERT INTO conversations (id, user_id, other_user_id, last_message, last_message_date, status, request_type, is_request, is_blocked, labels) VALUES (?, ?, ?, ?, ?, 'active', ?, 1, 0, '[]')"
    ).run(convId, userId, otherUserId, initialMessage, "Just now", requestType);

    db.query(
      "INSERT INTO messages (id, conversation_id, sender_id, text, timestamp, is_read) VALUES (?, ?, ?, ?, ?, 1)"
    ).run(msgId, convId, userId, initialMessage, timestamp);

    const otherUserRow = db
      .query("SELECT * FROM users WHERE id = ?")
      .get(otherUserId);
    const otherUser = dbRowToUser(otherUserRow as Record<string, unknown>);

    return {
      id: convId,
      otherUser,
      lastMessage: initialMessage,
      lastMessageDate: "Just now",
      status: "active",
      requestType,
      isRequest: true,
      isBlocked: false,
      labels: [],
      messages: [
        {
          id: msgId,
          senderId: userId,
          text: initialMessage,
          timestamp,
          isRead: true,
        },
      ],
    };
  },
};

// Start server
const server = Bun.serve({
  port: 5174,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname;

    // CORS headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // Routes
      if (path === "/api/users" && req.method === "GET") {
        const users = handlers.getUsers();
        return Response.json(users, { headers: corsHeaders });
      }

      if (path === "/api/me" && req.method === "GET") {
        const user = handlers.getCurrentUser();
        return Response.json(user, { headers: corsHeaders });
      }

      if (path.startsWith("/api/users/") && req.method === "GET") {
        const id = path.split("/")[3];
        const user = handlers.getUser(id);
        return Response.json(user, { headers: corsHeaders });
      }

      if (path.startsWith("/api/users/") && req.method === "PUT") {
        const id = path.split("/")[3];
        const data = await req.json();
        handlers.updateUser(id, data);
        const updated = handlers.getUser(id);
        return Response.json(updated, { headers: corsHeaders });
      }

      if (path === "/api/conversations" && req.method === "GET") {
        const userId = url.searchParams.get("userId") || "me";
        const conversations = handlers.getConversations(userId);
        return Response.json(conversations, { headers: corsHeaders });
      }

      if (path === "/api/conversations" && req.method === "POST") {
        const { userId, otherUserId, requestType, message } = await req.json();
        const conv = handlers.createConversation(
          userId,
          otherUserId,
          requestType,
          message
        );
        return Response.json(conv, { headers: corsHeaders });
      }

      if (
        path.startsWith("/api/conversations/") &&
        path.endsWith("/messages") &&
        req.method === "POST"
      ) {
        const convId = path.split("/")[3];
        const { senderId, text } = await req.json();
        const msg = handlers.sendMessage(convId, senderId, text);
        return Response.json(msg, { headers: corsHeaders });
      }

      // Labels routes
      if (path === "/api/labels" && req.method === "GET") {
        const userId = url.searchParams.get("userId") || "me";
        const labels = handlers.getLabels(userId);
        return Response.json(labels, { headers: corsHeaders });
      }

      if (path === "/api/labels" && req.method === "POST") {
        const { userId, name, color } = await req.json();
        const label = handlers.createLabel(userId, name, color);
        return Response.json(label, { headers: corsHeaders });
      }

      if (path.startsWith("/api/labels/") && req.method === "DELETE") {
        const id = path.split("/")[3];
        handlers.deleteLabel(id);
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      // Update conversation labels
      if (
        path.startsWith("/api/conversations/") &&
        path.endsWith("/labels") &&
        req.method === "PUT"
      ) {
        const convId = path.split("/")[3];
        const { labels } = await req.json();
        handlers.updateConversationLabels(convId, labels);
        return Response.json({ success: true }, { headers: corsHeaders });
      }

      return Response.json(
        { error: "Not found" },
        { status: 404, headers: corsHeaders }
      );
    } catch (error) {
      console.error("API Error:", error);
      return Response.json(
        { error: "Internal server error" },
        { status: 500, headers: corsHeaders }
      );
    }
  },
});

console.log(`API server running at http://localhost:${server.port}`);

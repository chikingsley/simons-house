import type {
  Conversation,
  Label,
  Message,
  ProfileExtended,
  Reference,
  User,
} from "../types";

const API_BASE = "http://localhost:5174/api";

export const api = {
  // Get all users (for dashboard)
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },

  // Get current user profile
  async getCurrentUser(): Promise<ProfileExtended | null> {
    const res = await fetch(`${API_BASE}/me`);
    return res.json();
  },

  // Get user by ID
  async getUser(id: string): Promise<ProfileExtended | null> {
    const res = await fetch(`${API_BASE}/users/${id}`);
    return res.json();
  },

  // Update user profile
  async updateUser(
    id: string,
    data: Partial<ProfileExtended>
  ): Promise<ProfileExtended | null> {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // Get conversations
  async getConversations(userId = "me"): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/conversations?userId=${userId}`);
    return res.json();
  },

  // Create new conversation
  async createConversation(
    userId: string,
    otherUserId: string,
    requestType: "host" | "meetup",
    message: string
  ): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, otherUserId, requestType, message }),
    });
    return res.json();
  },

  // Send message
  async sendMessage(
    conversationId: string,
    senderId: string,
    text: string
  ): Promise<Message> {
    const res = await fetch(
      `${API_BASE}/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, text }),
      }
    );
    return res.json();
  },

  // Get labels
  async getLabels(userId = "me"): Promise<Label[]> {
    const res = await fetch(`${API_BASE}/labels?userId=${userId}`);
    return res.json();
  },

  // Create label
  async createLabel(
    userId: string,
    name: string,
    color: string
  ): Promise<Label> {
    const res = await fetch(`${API_BASE}/labels`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, name, color }),
    });
    return res.json();
  },

  // Delete label
  async deleteLabel(id: string): Promise<void> {
    await fetch(`${API_BASE}/labels/${id}`, { method: "DELETE" });
  },

  // Update conversation labels
  async updateConversationLabels(
    conversationId: string,
    labels: string[]
  ): Promise<void> {
    await fetch(`${API_BASE}/conversations/${conversationId}/labels`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ labels }),
    });
  },

  // Create reference
  async createReference(options: {
    userId: string;
    authorId: string;
    type: "Host" | "Surfer" | "Personal";
    text: string;
    isPositive: boolean;
  }): Promise<Reference> {
    const res = await fetch(`${API_BASE}/references`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options),
    });
    return res.json();
  },
};

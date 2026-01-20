import type {
  Conversation,
  Label,
  Message,
  ProfileExtended,
  Reference,
  User,
} from "../types";
import { convex } from "./convex";
import { convexApi } from "./convex-api";

export type PaginatedUsers = {
  users: User[];
  total: number;
  hasMore: boolean;
};

export const api = {
  async getUsers(options?: {
    limit?: number;
    offset?: number;
  }): Promise<PaginatedUsers> {
    return await convex.query(convexApi.users.getUsers, {
      limit: options?.limit,
      offset: options?.offset,
    });
  },

  async getCurrentUser(): Promise<ProfileExtended | null> {
    return await convex.query(convexApi.users.getCurrentUser, {});
  },

  async getUser(id: string): Promise<ProfileExtended | null> {
    return await convex.query(convexApi.users.getUser, { id });
  },

  async updateUser(
    id: string,
    data: Partial<ProfileExtended>
  ): Promise<ProfileExtended | null> {
    await convex.mutation(convexApi.users.updateUser, { id, data });
    return await convex.query(convexApi.users.getUser, { id });
  },

  async getConversations(_userId?: string): Promise<Conversation[]> {
    return await convex.query(convexApi.conversations.getConversations, {});
  },

  async createConversation(
    _userId: string,
    otherUserId: string,
    requestType: "host" | "meetup",
    message: string
  ): Promise<Conversation> {
    return await convex.mutation(convexApi.conversations.createConversation, {
      otherUserId,
      requestType,
      message,
    });
  },

  async sendMessage(
    conversationId: string,
    _senderId: string,
    text: string
  ): Promise<Message> {
    return await convex.mutation(convexApi.conversations.sendMessage, {
      conversationId,
      text,
    });
  },

  async setConversationStatus(options: {
    conversationId: string;
    status: "active" | "archived";
  }): Promise<void> {
    await convex.mutation(convexApi.conversations.setConversationStatus, {
      conversationId: options.conversationId,
      status: options.status,
    });
  },

  async setConversationBlocked(options: {
    conversationId: string;
    isBlocked: boolean;
  }): Promise<void> {
    await convex.mutation(convexApi.conversations.setConversationBlocked, {
      conversationId: options.conversationId,
      isBlocked: options.isBlocked,
    });
  },

  async setConversationNotes(options: {
    conversationId: string;
    notes?: string;
  }): Promise<void> {
    await convex.mutation(convexApi.conversations.setConversationNotes, {
      conversationId: options.conversationId,
      notes: options.notes,
    });
  },

  async markConversationRead(options: {
    conversationId: string;
  }): Promise<{ updated: number }> {
    return await convex.mutation(convexApi.conversations.markConversationRead, {
      conversationId: options.conversationId,
    });
  },

  async respondToRequest(options: {
    conversationId: string;
    action: "accept" | "decline";
  }): Promise<{
    ok: boolean;
    alreadyHandled?: boolean;
    requestStatus?: "accepted" | "declined";
    status?: "active" | "archived";
    isRequest?: boolean;
    message?: Message;
    lastMessage?: string;
    lastMessageDate?: string;
    lastMessageAt?: string;
  }> {
    return await convex.mutation(convexApi.conversations.respondToRequest, {
      conversationId: options.conversationId,
      action: options.action,
    });
  },

  async getLabels(_userId?: string): Promise<Label[]> {
    return await convex.query(convexApi.labels.getLabels, {});
  },

  async createLabel(
    _userId: string,
    name: string,
    color: string
  ): Promise<Label> {
    return await convex.mutation(convexApi.labels.createLabel, { name, color });
  },

  async deleteLabel(id: string): Promise<void> {
    await convex.mutation(convexApi.labels.deleteLabel, { id });
  },

  async updateConversationLabels(
    conversationId: string,
    labels: string[]
  ): Promise<void> {
    await convex.mutation(convexApi.conversations.updateConversationLabels, {
      conversationId,
      labels,
    });
  },

  async createReference(options: {
    userId: string;
    authorId: string;
    type: "Host" | "Surfer" | "Personal";
    text: string;
    isPositive: boolean;
  }): Promise<Reference> {
    return await convex.mutation(convexApi.references.createReference, {
      userId: options.userId,
      type: options.type,
      text: options.text,
      isPositive: options.isPositive,
    });
  },

  async hasInteractionHistory(
    _userId: string,
    otherUserId: string
  ): Promise<boolean> {
    return await convex.query(convexApi.interactions.hasInteractionHistory, {
      otherUserId,
    });
  },

  async uploadImageToR2(options: {
    kind: "avatar" | "cover" | "photo";
    file: File;
  }): Promise<{ publicUrl: string }> {
    const { uploadUrl, publicUrl } = await convex.action(
      convexApi.files.generateUploadUrl,
      {
        kind: options.kind,
        fileName: options.file.name,
        contentType: options.file.type || "application/octet-stream",
      }
    );

    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": options.file.type || "application/octet-stream",
      },
      body: options.file,
    });

    if (!res.ok) {
      throw new Error(`Upload failed (${res.status})`);
    }

    return { publicUrl };
  },
};

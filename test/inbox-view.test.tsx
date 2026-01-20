import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InboxView from "../components/inbox-view";
import type { Conversation } from "../types";

vi.mock("../lib/user-context", () => ({
  useUser: () => ({ currentUserId: "me" }),
}));

const apiMock = vi.hoisted(() => ({
  getLabels: vi.fn(),
  createLabel: vi.fn(),
  updateConversationLabels: vi.fn(),
  sendMessage: vi.fn(),
  markConversationRead: vi.fn(),
  setConversationStatus: vi.fn(),
  setConversationBlocked: vi.fn(),
  setConversationNotes: vi.fn(),
  respondToRequest: vi.fn(),
}));

vi.mock("../lib/api", () => ({
  api: apiMock,
}));

beforeEach(() => {
  vi.clearAllMocks();
});

function makeConversation(overrides?: Partial<Conversation>): Conversation {
  return {
    id: "c1",
    otherUser: {
      id: "u2",
      name: "Alex",
      location: "NYC",
      avatarUrl: "https://example.com/a.png",
      coverUrl: undefined,
      verification: {
        payment: false,
        phone: false,
        governmentId: false,
        address: "unverified",
      },
      referencesCount: 0,
      friendsCount: 0,
      languages: ["English"],
      occupation: "",
      education: "",
      interests: ["Hiking"],
      age: 30,
      gender: "Other",
      joinedDate: "2025",
      responseRate: 100,
      responseTime: "Replies within a day",
      lastLogin: "Today",
      status: "wants_to_meet_up",
    },
    lastMessage: "Hello",
    lastMessageDate: "Just now",
    lastMessageAt: new Date().toISOString(),
    status: "active",
    requestType: undefined,
    isRequest: false,
    requestStatus: undefined,
    isBlocked: false,
    isIncoming: false,
    labels: [],
    notes: "",
    messages: [
      {
        id: "m1",
        senderId: "u2",
        text: "Hello",
        timestamp: new Date().toISOString(),
        isRead: false,
      },
    ],
    ...overrides,
  };
}

function InboxHarness({ initial }: { initial: Conversation[] }) {
  const [conversations, setConversations] = useState<Conversation[]>(initial);

  return (
    <MemoryRouter>
      <InboxView
        conversations={conversations}
        setConversations={setConversations}
      />
    </MemoryRouter>
  );
}

describe("InboxView (messaging behaviors)", () => {
  it("marks conversation read when selected", async () => {
    apiMock.getLabels.mockResolvedValueOnce([]);
    apiMock.markConversationRead.mockResolvedValueOnce({ updated: 1 });

    render(<InboxHarness initial={[makeConversation({ id: "c-read" })]} />);

    fireEvent.click(screen.getByText("Alex"));

    await waitFor(() => {
      expect(apiMock.markConversationRead).toHaveBeenCalledWith({
        conversationId: "c-read",
      });
    });
  });

  it("persists archive/unarchive via API", async () => {
    apiMock.getLabels.mockResolvedValueOnce([]);
    apiMock.setConversationStatus.mockResolvedValueOnce(undefined);

    render(<InboxHarness initial={[makeConversation({ id: "c-arch" })]} />);

    fireEvent.click(screen.getByText("Alex"));

    const archiveButton = screen.getByLabelText("Archive conversation");
    fireEvent.click(archiveButton);

    await waitFor(() => {
      expect(apiMock.setConversationStatus).toHaveBeenCalledWith({
        conversationId: "c-arch",
        status: "archived",
      });
    });
  });

  it("blocks user via API and disables messaging", async () => {
    apiMock.getLabels.mockResolvedValueOnce([]);
    apiMock.setConversationBlocked.mockResolvedValueOnce(undefined);

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<InboxHarness initial={[makeConversation({ id: "c-block" })]} />);

    fireEvent.click(screen.getByText("Alex"));

    fireEvent.click(screen.getByLabelText("Conversation menu"));

    fireEvent.click(screen.getByText("Block User"));

    await waitFor(() => {
      expect(apiMock.setConversationBlocked).toHaveBeenCalledWith({
        conversationId: "c-block",
        isBlocked: true,
      });
    });

    expect(screen.getByText("Messaging disabled.")).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it("persists private note on blur", async () => {
    apiMock.getLabels.mockResolvedValueOnce([]);
    apiMock.setConversationNotes.mockResolvedValueOnce(undefined);

    render(
      <InboxHarness initial={[makeConversation({ id: "c-note", notes: "" })]} />
    );

    fireEvent.click(screen.getByText("Alex"));

    const note = screen.getByPlaceholderText(
      "Add a private note about this person..."
    );
    fireEvent.change(note, { target: { value: "Met at a cafe" } });
    fireEvent.blur(note);

    await waitFor(() => {
      expect(apiMock.setConversationNotes).toHaveBeenCalledWith({
        conversationId: "c-note",
        notes: "Met at a cafe",
      });
    });
  });

  it("accepts an incoming request via API", async () => {
    apiMock.getLabels.mockResolvedValueOnce([]);
    apiMock.respondToRequest.mockResolvedValueOnce({
      ok: true,
      requestStatus: "accepted",
      status: "active",
      isRequest: false,
      lastMessage: "Accepted the request.",
      lastMessageDate: "Just now",
      lastMessageAt: new Date().toISOString(),
      message: {
        id: "m-accept",
        senderId: "me",
        text: "Accepted the request.",
        timestamp: new Date().toISOString(),
        isRead: false,
      },
    });

    const incoming = makeConversation({
      id: "c-req",
      isRequest: true,
      requestType: "host",
      requestStatus: "pending",
      messages: [
        {
          id: "m0",
          senderId: "u2", // not "me" => incoming request
          text: "Can I stay?",
          timestamp: new Date().toISOString(),
          isRead: false,
        },
      ],
    });

    render(<InboxHarness initial={[incoming]} />);

    fireEvent.click(screen.getByText("Alex"));
    fireEvent.click(screen.getByText("Accept"));

    await waitFor(() => {
      expect(apiMock.respondToRequest).toHaveBeenCalledWith({
        conversationId: "c-req",
        action: "accept",
      });
    });
  });
});

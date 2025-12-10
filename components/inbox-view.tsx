import {
  AlertCircle,
  Archive,
  ArrowLeft,
  Ban,
  Check,
  FileText,
  Flag,
  MapPin,
  MessageSquare,
  MoreVertical,
  Plus,
  Search,
  Send,
  Tag,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getRandomResponse } from "../constants";
import { api } from "../lib/api";
import { useUser } from "../lib/user-context";
import type { Conversation, Label, Message } from "../types";
import { QuickInfoList, UserIdentityCard } from "./ui/user-identity-card";
import { VerificationList } from "./ui/verification-list";

type InboxProps = {
  conversations: Conversation[];
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
};

const InboxView: React.FC<InboxProps> = ({
  conversations,
  setConversations,
}) => {
  const { currentUserId } = useUser();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewArchived, setViewArchived] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilterLabels, setSelectedFilterLabels] = useState<string[]>(
    []
  );
  const [privateNote, setPrivateNote] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showLabelsDropdown, setShowLabelsDropdown] = useState(false);
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [_isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const labelsDropdownRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find((c) => c.id === selectedId);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Load available labels
  useEffect(() => {
    const loadLabels = async () => {
      try {
        const labels = await api.getLabels(currentUserId);
        setAvailableLabels(labels);
      } catch (error) {
        console.error("Failed to load labels:", error);
      }
    };
    loadLabels();
  }, [currentUserId]);

  // Effect to close menu dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
      if (
        labelsDropdownRef.current &&
        !labelsDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLabelsDropdown(false);
      }
    };

    if (showMenu || showLabelsDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu, showLabelsDropdown]);

  // AI Response Simulation
  useEffect(() => {
    if (
      !selectedConversation ||
      selectedConversation.status === "archived" ||
      selectedConversation.isBlocked
    ) {
      return;
    }

    const lastMsg = selectedConversation.messages.at(-1);
    if (lastMsg && lastMsg.senderId === currentUserId) {
      const timeout = setTimeout(() => {
        const newMsg: Message = {
          id: `ai-${Date.now()}`,
          senderId: selectedConversation.otherUser.id,
          text: getRandomResponse(),
          timestamp: new Date().toISOString(),
          isRead: false,
        };

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === selectedConversation.id) {
              return {
                ...c,
                messages: [...c.messages, newMsg],
                lastMessage: newMsg.text,
                lastMessageDate: "Just now",
              };
            }
            return c;
          })
        );
      }, 1500); // 1.5s delay
      return () => clearTimeout(timeout);
    }
  }, [
    selectedConversation?.messages,
    selectedConversation?.id,
    selectedConversation?.isBlocked,
    selectedConversation?.otherUser?.id,
    selectedConversation?.status,
    currentUserId,
    setConversations,
    selectedConversation,
  ]);

  const handleSendMessage = async () => {
    if (!(inputValue.trim() && selectedId) || selectedConversation?.isBlocked) {
      return;
    }

    setIsSending(true);
    try {
      // Send message to API
      const newMsg = await api.sendMessage(
        selectedId,
        currentUserId,
        inputValue
      );

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === selectedId) {
            return {
              ...c,
              messages: [...c.messages, newMsg],
              lastMessage: inputValue,
              lastMessageDate: "Just now",
            };
          }
          return c;
        })
      );
      setInputValue("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrivateNote(e.target.value);
  };

  const toggleArchive = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedId) {
      return;
    }

    const newStatus =
      selectedConversation?.status === "active" ? "archived" : "active";

    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, status: newStatus } : c))
    );

    // If archiving, clear selection or switch view to see it?
    // Better to just clear selection to indicate it moved.
    if (newStatus === "archived" && !viewArchived) {
      setSelectedId(null);
    } else if (newStatus === "active" && viewArchived) {
      setSelectedId(null);
    }
    setShowMenu(false);
  };

  const handleToggleLabel = async (labelName: string) => {
    if (!selectedId) {
      return;
    }

    const currentLabels = selectedConversation?.labels || [];
    const hasLabel = currentLabels.includes(labelName);
    const newLabels = hasLabel
      ? currentLabels.filter((l) => l !== labelName)
      : [...currentLabels, labelName];

    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, labels: newLabels } : c))
    );

    try {
      await api.updateConversationLabels(selectedId, newLabels);
    } catch (error) {
      console.error("Failed to update labels:", error);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabelName.trim()) {
      return;
    }

    const colors = [
      "#22c55e",
      "#3b82f6",
      "#f59e0b",
      "#8b5cf6",
      "#ef4444",
      "#06b6d4",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      const newLabel = await api.createLabel(
        currentUserId,
        newLabelName.trim(),
        randomColor
      );
      setAvailableLabels((prev) => [...prev, newLabel]);
      setNewLabelName("");
    } catch (error) {
      console.error("Failed to create label:", error);
    }
  };

  const handleOpenLabelsDropdown = () => {
    setShowLabelsDropdown(true);
    setShowMenu(false);
  };

  const handleBlockUser = () => {
    if (
      window.confirm(
        "Are you sure you want to block this user? You won't be able to message each other."
      )
    ) {
      setConversations((prev) =>
        prev.map((c) => (c.id === selectedId ? { ...c, isBlocked: true } : c))
      );
      setShowMenu(false);
    }
  };

  const handleReportSubmit = (reason: string) => {
    alert(`Report submitted for "${reason}". User has been blocked.`);
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedId ? { ...c, isBlocked: true } : c))
    );
    setShowReportModal(false);
    setShowMenu(false);
  };

  // Filter logic
  const displayedConversations = conversations.filter((c) => {
    // Filter by archived/active status
    const statusMatch = viewArchived
      ? c.status === "archived"
      : c.status === "active";

    // Filter by search query
    const searchMatch =
      !searchQuery ||
      c.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    // Filter by selected labels
    const labelMatch =
      selectedFilterLabels.length === 0 ||
      selectedFilterLabels.some((label) => c.labels?.includes(label));

    return statusMatch && searchMatch && labelMatch;
  });

  const toggleFilterLabel = (labelName: string) => {
    setSelectedFilterLabels((prev) =>
      prev.includes(labelName)
        ? prev.filter((l) => l !== labelName)
        : [...prev, labelName]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFilterLabels([]);
  };

  return (
    // Full screen container
    <div className="flex h-[calc(100vh-64px)] w-full bg-gray-50 dark:bg-gray-900">
      {/* LEFT: Conversation List */}
      <div
        className={`flex w-full flex-col border-gray-200 border-r bg-white md:w-[350px] lg:w-[400px] dark:border-gray-700 dark:bg-gray-800 ${selectedId ? "hidden md:flex" : "flex"}`}
      >
        {/* Header */}
        <div className="flex-shrink-0 border-gray-100 border-b p-4 dark:border-gray-700">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 text-xl dark:text-gray-200">
              {viewArchived ? "Archived Chats" : "Inbox"}
            </h2>
            {viewArchived && (
              <button
                className="flex items-center gap-1 text-blue-600 text-xs hover:underline"
                onClick={() => setViewArchived(false)}
              >
                <ArrowLeft size={12} /> Back to Inbox
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute top-2.5 left-3 text-gray-400 dark:text-gray-500"
              size={16}
            />
            <input
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pr-3 pl-9 text-sm focus:border-orange-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              type="text"
              value={searchQuery}
            />
          </div>

          {/* Filter Labels */}
          {availableLabels.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {availableLabels.map((label) => {
                const isActive = selectedFilterLabels.includes(label.name);
                return (
                  <button
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-medium text-[11px] transition-all ${
                      isActive
                        ? "ring-2 ring-offset-1"
                        : "opacity-70 hover:opacity-100"
                    }`}
                    key={label.id}
                    onClick={() => toggleFilterLabel(label.name)}
                    style={{
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                      ringColor: isActive ? label.color : undefined,
                    }}
                    type="button"
                  >
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                    {label.name}
                  </button>
                );
              })}
              {(searchQuery || selectedFilterLabels.length > 0) && (
                <button
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-1 font-medium text-[11px] text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  onClick={clearFilters}
                  type="button"
                >
                  <X size={10} /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {displayedConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm dark:text-gray-500">
              {viewArchived ? "No archived chats." : "No messages yet."}
            </div>
          ) : (
            displayedConversations.map((conv) => {
              const isMyRequest =
                conv.isRequest && conv.messages[0].senderId === currentUserId;

              return (
                <div
                  className={`relative flex cursor-pointer gap-3 border-gray-50 border-b p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${selectedId === conv.id ? "border-orange-100 bg-orange-50/50 dark:border-orange-900 dark:bg-orange-500/10" : ""}`}
                  key={conv.id}
                  onClick={() => setSelectedId(conv.id)}
                >
                  <div className="relative shrink-0">
                    <img
                      alt={conv.otherUser.name}
                      className={`h-12 w-12 rounded-full object-cover ${conv.isBlocked ? "opacity-50 grayscale" : ""}`}
                      src={conv.otherUser.avatarUrl}
                    />
                    {conv.messages.some(
                      (m) => !m.isRead && m.senderId !== currentUserId
                    ) && (
                      <div className="absolute top-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-blue-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-baseline justify-between">
                      <h3
                        className={`truncate text-sm ${selectedId === conv.id ? "font-bold text-orange-900 dark:text-orange-400" : "font-semibold text-gray-900 dark:text-gray-100"} ${conv.isBlocked ? "text-gray-400 line-through dark:text-gray-500" : ""}`}
                      >
                        {conv.otherUser.name}
                      </h3>
                      <span className="ml-2 whitespace-nowrap text-[10px] text-gray-400 dark:text-gray-500">
                        {conv.lastMessageDate}
                      </span>
                    </div>

                    {/* Tags & Labels */}
                    <div className="mb-1 flex flex-wrap gap-1">
                      {conv.isBlocked && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 font-bold text-[9px] text-red-600 uppercase dark:bg-red-500/20 dark:text-red-400">
                          Blocked
                        </span>
                      )}
                      {conv.requestType &&
                        (isMyRequest ? (
                          <span className="rounded border border-gray-200 bg-gray-100 px-1.5 py-0.5 font-bold text-[9px] text-gray-600 uppercase dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                            Request Sent
                          </span>
                        ) : (
                          <span
                            className={`rounded px-1.5 py-0.5 font-bold text-[9px] uppercase ${
                              conv.requestType === "host"
                                ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                            }`}
                          >
                            {conv.requestType === "host"
                              ? "Host Request"
                              : "Meetup Request"}
                          </span>
                        ))}
                      {conv.labels?.map((label, i) => (
                        <span
                          className="rounded bg-purple-100 px-1.5 py-0.5 font-bold text-[9px] text-purple-700 uppercase dark:bg-purple-500/20 dark:text-purple-400"
                          key={i}
                        >
                          {label}
                        </span>
                      ))}
                    </div>

                    <p
                      className={`truncate text-xs ${conv.messages.at(-1).isRead ? "text-gray-500 dark:text-gray-400" : "font-medium text-gray-900 dark:text-gray-100"}`}
                    >
                      {conv.messages.at(-1).senderId === currentUserId
                        ? "You: "
                        : ""}
                      {conv.lastMessage}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Archive Toggle */}
        {!viewArchived && (
          <div className="border-gray-200 border-t bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
            <button
              className="flex w-full items-center justify-center gap-2 font-semibold text-gray-600 text-sm transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={() => setViewArchived(true)}
            >
              <Archive size={16} /> View Archived Chats
            </button>
          </div>
        )}
      </div>

      {/* MIDDLE: Chat Window */}
      <div
        className={`relative flex flex-1 flex-col bg-gray-100 dark:bg-gray-800 ${selectedId ? "flex" : "hidden md:flex"}`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="z-10 flex h-16 shrink-0 items-center justify-between border-gray-200 border-b bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <button
                  className="-ml-2 p-2 text-gray-600 md:hidden dark:text-gray-400"
                  onClick={() => setSelectedId(null)}
                  type="button"
                >
                  <ArrowLeft size={20} />
                </button>
                <Link to={`/people/${selectedConversation.otherUser.id}`}>
                  <img
                    alt={selectedConversation.otherUser.name}
                    className="h-10 w-10 rounded-full border border-gray-200 object-cover transition-opacity hover:opacity-80 dark:border-gray-600"
                    src={selectedConversation.otherUser.avatarUrl}
                  />
                </Link>
                <div>
                  <Link
                    className="font-bold text-gray-800 text-sm hover:text-orange-600 hover:underline dark:text-gray-200"
                    to={`/people/${selectedConversation.otherUser.id}`}
                  >
                    {selectedConversation.otherUser.name}
                  </Link>
                  <div className="flex items-center gap-1 text-gray-500 text-xs dark:text-gray-400">
                    <MapPin size={10} />{" "}
                    {selectedConversation.otherUser.location}
                  </div>
                </div>
              </div>
              <div className="relative flex gap-2">
                <button
                  className={`rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 ${selectedConversation.status === "archived" ? "text-orange-500" : "text-gray-500 dark:text-gray-400"}`}
                  onClick={(e) => toggleArchive(e)}
                  title={
                    selectedConversation.status === "archived"
                      ? "Unarchive"
                      : "Archive"
                  }
                >
                  <Archive size={18} />
                </button>

                <div className="relative" ref={menuDropdownRef}>
                  <button
                    className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                    onClick={() => setShowMenu(!showMenu)}
                    type="button"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {showMenu && (
                    <div className="fade-in zoom-in-95 absolute top-full right-0 z-50 mt-2 w-48 animate-in rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-600 dark:bg-gray-800">
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 text-sm hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={handleOpenLabelsDropdown}
                        type="button"
                      >
                        <Tag size={14} /> Manage Labels
                      </button>
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-gray-700 text-sm hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                        onClick={() => setShowReportModal(true)}
                      >
                        <Flag size={14} /> Report User
                      </button>
                      <button
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-red-600 text-sm hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/20"
                        onClick={handleBlockUser}
                        type="button"
                      >
                        <Ban size={14} /> Block User
                      </button>
                    </div>
                  )}

                  {/* Labels Dropdown */}
                  {showLabelsDropdown && (
                    <div
                      className="fade-in zoom-in-95 absolute top-full right-0 z-50 mt-2 w-64 animate-in rounded-lg border border-gray-200 bg-white py-2 shadow-xl dark:border-gray-600 dark:bg-gray-800"
                      ref={labelsDropdownRef}
                    >
                      <div className="mb-2 border-gray-100 border-b px-3 pb-2 dark:border-gray-700">
                        <h4 className="font-bold text-gray-700 text-xs uppercase dark:text-gray-300">
                          Manage Labels
                        </h4>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {availableLabels.map((label) => {
                          const isSelected =
                            selectedConversation?.labels?.includes(label.name);
                          return (
                            <button
                              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                                isSelected
                                  ? "bg-gray-100 font-semibold dark:bg-gray-700"
                                  : "hover:bg-gray-50 dark:hover:bg-gray-700"
                              }`}
                              key={label.id}
                              onClick={() => handleToggleLabel(label.name)}
                              type="button"
                            >
                              <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: label.color }}
                              />
                              <span className="flex-1 dark:text-gray-200">
                                {label.name}
                              </span>
                              {isSelected && (
                                <Check
                                  className="text-green-600 dark:text-green-400"
                                  size={14}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-2 border-gray-100 border-t px-3 pt-2 dark:border-gray-700">
                        <div className="flex gap-2">
                          <input
                            className="flex-1 rounded border border-gray-200 bg-white px-2 py-1 text-sm outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                            onChange={(e) => setNewLabelName(e.target.value)}
                            onKeyDown={(e) =>
                              e.key === "Enter" && handleCreateLabel()
                            }
                            placeholder="New label..."
                            type="text"
                            value={newLabelName}
                          />
                          <button
                            className="rounded bg-orange-500 px-2 py-1 text-white hover:bg-orange-600"
                            onClick={handleCreateLabel}
                            type="button"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
              {/* Blocked Banner */}
              {selectedConversation.isBlocked && (
                <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-center font-bold text-red-700 text-sm dark:border-red-800 dark:bg-red-500/20 dark:text-red-400">
                  <Ban size={16} /> You have blocked this user. You cannot send
                  or receive messages.
                </div>
              )}

              {/* Request Action Buttons for INCOMING requests */}
              {!selectedConversation.isBlocked &&
                selectedConversation.isRequest &&
                selectedConversation.messages[0].senderId !== "me" && (
                  <div className="mx-auto mb-6 max-w-md rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm dark:border-gray-700 dark:bg-gray-800">
                    <h4 className="mb-1 font-bold text-gray-900 dark:text-gray-100">
                      Request Pending
                    </h4>
                    <p className="mb-4 text-gray-500 text-sm dark:text-gray-400">
                      {selectedConversation.otherUser.name} sent you a{" "}
                      {selectedConversation.requestType} request.
                    </p>
                    <div className="flex justify-center gap-3">
                      <button className="flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2 font-bold text-sm text-white shadow-sm transition-transform hover:bg-green-600 active:scale-95">
                        <Check size={16} /> Accept
                      </button>
                      <button className="flex items-center gap-2 rounded-lg bg-gray-100 px-5 py-2 font-bold text-gray-700 text-sm transition-transform hover:bg-gray-200 active:scale-95 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                        <X size={16} /> Decline
                      </button>
                    </div>
                  </div>
                )}

              {/* Request Banner for OUTGOING requests */}
              {selectedConversation.isRequest &&
                selectedConversation.messages[0].senderId === currentUserId && (
                  <div className="mx-auto mb-6 max-w-md rounded-xl border border-gray-200 bg-gray-50 p-4 text-center dark:border-gray-700 dark:bg-gray-900">
                    <h4 className="mb-1 font-bold text-gray-600 text-sm uppercase dark:text-gray-400">
                      Request Sent
                    </h4>
                    <p className="text-gray-500 text-xs dark:text-gray-400">
                      You sent a request to{" "}
                      {selectedConversation.otherUser.name}. Wait for them to
                      respond.
                    </p>
                  </div>
                )}

              {selectedConversation.messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                return (
                  <div
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    key={msg.id}
                  >
                    <div
                      className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm md:max-w-[70%] ${
                        isMe
                          ? "rounded-br-none bg-orange-500 text-white"
                          : "rounded-bl-none border border-gray-200 bg-white text-gray-800 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                      }`}
                    >
                      <p>{msg.text}</p>
                      <p
                        className={`mt-1 text-right text-[10px] opacity-70 ${isMe ? "text-orange-100" : "text-gray-400 dark:text-gray-500"}`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {selectedConversation.isBlocked ? (
              <div className="border-gray-200 border-t bg-gray-100 p-4 text-center text-gray-500 text-sm italic dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
                Messaging disabled.
              </div>
            ) : (
              <div className="shrink-0 border-gray-200 border-t bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
                <div className="relative mx-auto flex max-w-4xl items-end gap-2">
                  <textarea
                    className="h-12 max-h-32 min-h-[48px] w-full resize-none rounded-xl border border-gray-300 bg-gray-50 p-3 pr-10 text-sm shadow-inner focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200"
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    value={inputValue}
                  />
                  <button
                    className="mb-0.5 rounded-xl bg-orange-500 p-3 text-white shadow-sm transition-colors hover:bg-orange-600 active:scale-95"
                    onClick={handleSendMessage}
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-gray-400 dark:text-gray-500">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700">
              <MessageSquare
                className="text-gray-400 dark:text-gray-500"
                size={40}
              />
            </div>
            <p className="font-medium text-lg">Your Messages</p>
            <p className="text-sm">Select a conversation to start messaging</p>
          </div>
        )}
      </div>

      {/* RIGHT: Mini Profile Sidebar */}
      {selectedConversation && (
        <div className="z-20 hidden h-full w-[320px] flex-col overflow-y-auto border-gray-200 border-l bg-white shadow-xl xl:flex dark:border-gray-700 dark:bg-gray-800">
          {/* Identity Card */}
          <UserIdentityCard
            isBlocked={selectedConversation.isBlocked}
            linkTo={`/people/${selectedConversation.otherUser.id}`}
            user={selectedConversation.otherUser}
            variant="inbox-sidebar"
          />

          {/* Details List */}
          <div className="flex-1 space-y-6 p-6">
            {/* Verification Badges */}
            <VerificationList
              compact
              showTitle
              verification={selectedConversation.otherUser.verification}
            />

            {/* Quick Info */}
            <QuickInfoList user={selectedConversation.otherUser} />

            {/* Interests */}
            <div>
              <h4 className="mb-3 font-bold text-gray-400 text-xs uppercase tracking-wider dark:text-gray-500">
                Interests
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedConversation.otherUser.interests.map((int, i) => (
                  <span
                    className="rounded border border-blue-100 bg-blue-50 px-2 py-1 font-medium text-[10px] text-blue-700 dark:border-blue-800 dark:bg-blue-500/20 dark:text-blue-400"
                    key={i}
                  >
                    {int}
                  </span>
                ))}
              </div>
            </div>

            {/* Private Notes */}
            <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-500/20">
              <div className="mb-2 flex items-center gap-2 font-bold text-xs text-yellow-800 uppercase dark:text-yellow-400">
                <FileText size={12} /> Private Note
              </div>
              <textarea
                className="w-full resize-none border-0 bg-transparent text-gray-700 text-sm placeholder-gray-400 outline-none dark:text-gray-300 dark:placeholder-gray-500"
                onChange={handleNoteChange}
                placeholder="Add a private note about this person..."
                rows={3}
                value={privateNote}
              />
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="fade-in zoom-in-95 w-full max-w-sm animate-in rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="mb-4 flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertCircle size={24} />
              <h3 className="font-bold text-lg">Report User</h3>
            </div>
            <p className="mb-4 text-gray-600 text-sm dark:text-gray-400">
              Why are you reporting {selectedConversation?.otherUser.name}? This
              will also block them.
            </p>

            <div className="mb-6 space-y-2">
              {[
                "Spam or Scam",
                "Inappropriate Content",
                "Harassment",
                "Fake Profile",
                "Other",
              ].map((reason) => (
                <button
                  className="w-full rounded border border-gray-200 bg-white px-4 py-3 text-left font-medium text-sm transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  key={reason}
                  onClick={() => handleReportSubmit(reason)}
                >
                  {reason}
                </button>
              ))}
            </div>

            <button
              className="w-full py-2 font-bold text-gray-500 text-sm hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setShowReportModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InboxView;

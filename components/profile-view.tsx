import {
  Briefcase,
  Calendar,
  Camera,
  Check,
  ChevronDown,
  Edit2,
  GraduationCap,
  Home,
  Info,
  Loader2,
  MapPin,
  MessageCircle,
  PenLine,
  Plus,
  Reply,
  Save,
  Send,
  Sparkles,
  Star,
  ThumbsDown,
  ThumbsUp,
  User as UserIcon,
  X,
  Zap,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../lib/api";
import { useUser } from "../lib/user-context";
import type { ProfileExtended, User, UserStatus } from "../types";
import { getStatusColor, getStatusLabel } from "./ui/status-badge";
import { VerificationList } from "./ui/verification-list";

type ProfileViewProps = {
  viewingProfileId?: string | null;
  onRequestSend?: (type: "host" | "meetup", user: User) => void;
};

const ProfileView: React.FC<ProfileViewProps> = ({
  viewingProfileId,
  onRequestSend,
}) => {
  const { currentUserId } = useUser();
  const [profile, setProfile] = useState<ProfileExtended | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "about" | "home" | "photos" | "references"
  >("about");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Write Reference Modal State
  const [showWriteRefModal, setShowWriteRefModal] = useState(false);
  const [refType, setRefType] = useState<"Host" | "Surfer" | "Personal">(
    "Host"
  );
  const [refIsPositive, setRefIsPositive] = useState(true);
  const [refText, setRefText] = useState("");
  const [isSubmittingRef, setIsSubmittingRef] = useState(false);

  // Interaction history state (for enabling Write Reference button)
  const [hasInteraction, setHasInteraction] = useState(false);
  const [checkingInteraction, setCheckingInteraction] = useState(false);

  // Interest Editing State
  const [newInterest, setNewInterest] = useState("");

  // Reference Reply State
  const [replyingToRefId, setReplyingToRefId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  // Ref for status dropdown to detect outside clicks
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  // Effect to close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false);
      }
    };

    if (showStatusDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusDropdown]);

  // Effect to load profile data from API
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      try {
        const targetId = viewingProfileId || currentUserId;
        const data = await api.getUser(targetId);
        if (data) {
          setProfile(data);
        }
        setIsEditing(false);
        setRequestSent(false);
      } catch (error) {
        console.error("Failed to load profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProfile();
  }, [viewingProfileId, currentUserId]);

  // Effect to check interaction history when viewing someone else's profile
  useEffect(() => {
    const checkInteraction = async () => {
      // Only check if viewing someone else's profile
      if (
        !viewingProfileId ||
        viewingProfileId === "me" ||
        viewingProfileId === currentUserId
      ) {
        setHasInteraction(false);
        return;
      }

      setCheckingInteraction(true);
      try {
        const hasHistory = await api.hasInteractionHistory(
          currentUserId,
          viewingProfileId
        );
        setHasInteraction(hasHistory);
      } catch (error) {
        console.error("Failed to check interaction history:", error);
        setHasInteraction(false);
      } finally {
        setCheckingInteraction(false);
      }
    };
    checkInteraction();
  }, [viewingProfileId, currentUserId]);

  const isMe =
    !viewingProfileId ||
    viewingProfileId === "me" ||
    viewingProfileId === currentUserId;

  const inputClass =
    "w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 outline-none focus:border-orange-500 placeholder-gray-400 dark:placeholder-gray-500";
  const textareaClass =
    "w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:border-orange-500 outline-none resize-y placeholder-gray-400 dark:placeholder-gray-500";

  const handleStatusChange = async (status: UserStatus) => {
    if (!profile) {
      return;
    }
    setProfile((prev) => (prev ? { ...prev, status } : prev));
    setShowStatusDropdown(false);
    // Auto-save status changes
    try {
      await api.updateUser(profile.id, { status });
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const handleInputChange = (field: keyof ProfileExtended, value: any) => {
    setProfile((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleHomeDetailChange = (field: string, value: any) => {
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            homeDetails: { ...prev.homeDetails, [field]: value },
          }
        : prev
    );
  };

  const handleSaveProfile = async () => {
    if (!profile) {
      return;
    }
    setIsSaving(true);
    try {
      await api.updateUser(profile.id, profile);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAIMagic = (field: keyof ProfileExtended) => {
    if (!profile) {
      return;
    }
    const currentText = profile[field] as string;
    const improvedText =
      currentText +
      "\n\n(AI Enhanced: Added more descriptive flair and corrected grammar!)";
    handleInputChange(field, improvedText);
  };

  const handleSendRequest = (type: "host" | "meetup") => {
    if (!profile) {
      return;
    }
    if (onRequestSend) {
      onRequestSend(type, profile);
    }
    setRequestSent(true);
    setShowRequestModal(false);
  };

  const handleSubmitReference = async () => {
    if (!(profile && refText.trim())) {
      return;
    }
    setIsSubmittingRef(true);
    try {
      const newRef = await api.createReference({
        userId: profile.id,
        authorId: currentUserId,
        type: refType,
        text: refText.trim(),
        isPositive: refIsPositive,
      });
      // Add the new reference to the profile
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              references: [newRef, ...prev.references],
              referencesCount: prev.referencesCount + 1,
            }
          : prev
      );
      // Reset form and close modal
      setRefText("");
      setRefType("Host");
      setRefIsPositive(true);
      setShowWriteRefModal(false);
      toast.success("Reference submitted successfully!");
    } catch (error) {
      console.error("Failed to submit reference:", error);
      toast.error("Failed to submit reference. Please try again.");
    } finally {
      setIsSubmittingRef(false);
    }
  };

  // Refs for file inputs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // --- Photo Logic ---
  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "cover" | "photo"
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    // Create a local URL for the file
    const localUrl = URL.createObjectURL(file);

    if (type === "avatar") {
      handleInputChange("avatarUrl", localUrl);
    } else if (type === "cover") {
      handleInputChange("coverUrl", localUrl);
    } else {
      setProfile((prev) =>
        prev ? { ...prev, photos: [...prev.photos, localUrl] } : prev
      );
    }

    // Reset the input so the same file can be selected again
    event.target.value = "";
  };

  const handleUpdateImage = (type: "avatar" | "cover") => {
    if (type === "avatar") {
      avatarInputRef.current?.click();
    } else {
      coverInputRef.current?.click();
    }
  };

  const handleAddPhoto = () => {
    photoInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    if (window.confirm("Delete this photo?") && profile) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              photos: prev.photos.filter((_, i) => i !== index),
            }
          : prev
      );
    }
  };

  // --- Interest Logic ---
  const handleAddInterest = () => {
    if (newInterest.trim() && profile) {
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              interests: [...prev.interests, newInterest.trim()],
            }
          : prev
      );
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest: string) => {
    if (!profile) {
      return;
    }
    setProfile((prev) =>
      prev
        ? {
            ...prev,
            interests: prev.interests.filter((i) => i !== interest),
          }
        : prev
    );
  };

  // --- Reference Reply Logic ---
  const handleReplySubmit = (refId: string) => {
    if (!(replyText.trim() && profile)) {
      return;
    }

    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            references: prev.references.map((ref) =>
              ref.id === refId
                ? { ...ref, response: replyText, responseDate: today }
                : ref
            ),
          }
        : prev
    );
    setReplyingToRefId(null);
    setReplyText("");
  };

  // Loading state
  if (isLoading || !profile) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Hidden file inputs */}
      <input
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "avatar")}
        ref={avatarInputRef}
        type="file"
      />
      <input
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "cover")}
        ref={coverInputRef}
        type="file"
      />
      <input
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e, "photo")}
        ref={photoInputRef}
        type="file"
      />

      {/* Cover Photo */}
      <div className="group relative h-64 w-full overflow-hidden bg-gray-300 md:h-80 dark:bg-gray-700">
        <img
          alt="Cover"
          className="h-full w-full object-cover"
          src={profile.coverUrl || "https://picsum.photos/1200/400"}
        />
        {isMe && (
          <button
            className="absolute top-4 right-4 flex cursor-pointer items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white transition-colors hover:bg-black/70"
            onClick={() => handleUpdateImage("cover")}
          >
            <Camera size={16} /> Change Cover
          </button>
        )}

        {/* Action Buttons for Non-Owner */}
        {!isMe && (
          <div className="absolute right-6 bottom-6 z-20 flex gap-3">
            <button
              className={`flex items-center gap-2 rounded-lg px-5 py-2 font-bold text-white shadow-lg ${
                hasInteraction && !checkingInteraction
                  ? "bg-blue-600 transition-transform hover:scale-105 hover:bg-blue-700 active:scale-95"
                  : "cursor-not-allowed bg-gray-400"
              }`}
              disabled={!hasInteraction || checkingInteraction}
              onClick={() => setShowWriteRefModal(true)}
              title={
                hasInteraction
                  ? "Write a reference for this user"
                  : "You can only write a reference after you've stayed with or met this person"
              }
            >
              <PenLine size={18} /> Write Reference
            </button>
            {requestSent ? (
              <button
                className="flex cursor-default items-center gap-2 rounded-lg bg-gray-500 px-6 py-2 font-bold text-white shadow-lg"
                disabled
              >
                <Check size={18} /> Request Sent
              </button>
            ) : (
              <button
                className="flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-2 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-orange-700 active:scale-95"
                onClick={() => setShowRequestModal(true)}
              >
                <Send size={18} /> Send Request
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 md:flex-row">
        {/* LEFT SIDEBAR (Consolidated Identity Card) */}
        <aside className="-mt-24 md:-mt-32 relative z-10 flex w-full flex-shrink-0 flex-col gap-6 md:w-[340px]">
          {/* Identity Card */}
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {/* Response Rate Top Banner */}
            <div className="flex items-center justify-between border-green-100 border-b bg-green-50 px-4 py-2 font-semibold text-green-800 text-xs dark:border-green-500/20 dark:bg-green-500/20 dark:text-green-400">
              <span className="flex items-center gap-1">
                <Zap
                  className="fill-green-600 text-green-600 dark:fill-green-400 dark:text-green-400"
                  size={12}
                />{" "}
                Very Responsive
              </span>
              <span>{profile.responseRate}% Response Rate</span>
            </div>

            <div className="p-6 text-center">
              <div className="group relative mb-4 inline-block">
                <img
                  alt={profile.name}
                  className="h-48 w-48 rounded-full border-[6px] border-white bg-white object-cover shadow-md dark:border-gray-800 dark:bg-gray-800"
                  src={profile.avatarUrl}
                />
                {isMe && (
                  <button
                    className="absolute right-2 bottom-2 cursor-pointer rounded-full bg-blue-600 p-2 text-white shadow-md transition-colors hover:bg-blue-700"
                    onClick={() => handleUpdateImage("avatar")}
                  >
                    <Camera size={18} />
                  </button>
                )}
              </div>

              {isEditing ? (
                <input
                  className="mb-1 w-full border-gray-300 border-b bg-transparent text-center font-bold text-2xl text-gray-900 outline-none focus:border-orange-500 dark:border-gray-600 dark:text-gray-100"
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  value={profile.name}
                />
              ) : (
                <h1 className="mb-1 font-bold text-3xl text-gray-900 dark:text-gray-100">
                  {profile.name}
                </h1>
              )}

              <div className="flex items-center justify-center gap-1 font-medium text-gray-600 dark:text-gray-400">
                <MapPin size={16} />
                <span>{profile.location}</span>
              </div>

              {/* Response Info */}
              <div className="mt-2 flex items-center justify-center gap-1 font-semibold text-gray-500 text-xs dark:text-gray-400">
                <Zap className="text-orange-500" size={12} />{" "}
                {profile.responseTime}
              </div>

              <div className="mt-2 text-gray-500 text-sm dark:text-gray-400">
                Member since {profile.joinedDate}
              </div>

              {/* Quick Status Dropdown (Only for owner) */}
              <div className="relative mt-6" ref={statusDropdownRef}>
                {isMe ? (
                  <button
                    className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3 font-bold transition-all hover:brightness-95 ${getStatusColor(profile.status)}`}
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    type="button"
                  >
                    {getStatusLabel(profile.status)}
                    <ChevronDown size={16} />
                  </button>
                ) : (
                  <div
                    className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 font-bold ${getStatusColor(profile.status)}`}
                  >
                    {getStatusLabel(profile.status)}
                  </div>
                )}

                {isMe && showStatusDropdown && (
                  <div className="fade-in zoom-in-95 absolute top-full left-0 z-50 mt-2 w-full animate-in overflow-hidden rounded-lg border border-gray-200 bg-white text-left shadow-xl duration-200 dark:border-gray-700 dark:bg-gray-800">
                    {(
                      [
                        "accepting_guests",
                        "maybe_accepting_guests",
                        "not_accepting_guests",
                        "wants_to_meet_up",
                      ] as UserStatus[]
                    ).map((s) => (
                      <button
                        className="flex w-full items-center gap-2 border-gray-50 border-b px-4 py-3 text-left font-medium text-gray-700 text-sm last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
                        key={s}
                        onClick={() => handleStatusChange(s)}
                      >
                        <div
                          className={`h-3 w-3 rounded-full ${s.includes("not") ? "bg-red-400" : s.includes("maybe") ? "bg-yellow-400" : s.includes("wants") ? "bg-blue-400" : "bg-green-400"}`}
                        />
                        {getStatusLabel(s)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 divide-x divide-gray-100 border-gray-100 border-t dark:divide-gray-700 dark:border-gray-700">
              <div className="cursor-pointer p-4 text-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="font-bold text-2xl text-gray-900 dark:text-gray-100">
                  {profile.referencesCount}
                </div>
                <div className="font-bold text-gray-400 text-xs uppercase tracking-wider dark:text-gray-500">
                  References
                </div>
              </div>
              <div className="cursor-pointer p-4 text-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-700">
                <div className="font-bold text-2xl text-gray-900 dark:text-gray-100">
                  {profile.friendsCount}
                </div>
                <div className="font-bold text-gray-400 text-xs uppercase tracking-wider dark:text-gray-500">
                  Friends
                </div>
              </div>
            </div>

            {/* Verifications List - Integrated into Main Card */}
            <VerificationList
              className="border-gray-100 border-t p-6 dark:border-gray-700"
              verification={profile.verification}
            />

            {/* Last Login Footer */}
            <div className="border-gray-100 border-t bg-gray-50 p-4 text-center text-gray-400 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
              Last active:{" "}
              <span className="font-semibold text-gray-600 dark:text-gray-400">
                {profile.lastLogin}
              </span>
            </div>

            {/* Edit Toggle (Only for Me) */}
            {isMe && (
              <button
                className={`flex w-full items-center justify-center gap-2 border-gray-100 border-t py-3 font-bold text-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700 ${isEditing ? "bg-green-50 text-green-600 dark:bg-green-500/20 dark:text-green-400" : "text-gray-600 dark:text-gray-400"}`}
                disabled={isSaving}
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? (
                  isSaving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} /> Save Changes
                    </>
                  )
                ) : (
                  <>
                    <Edit2 size={16} /> Edit Profile
                  </>
                )}
              </button>
            )}
          </div>
        </aside>

        {/* RIGHT MAIN CONTENT */}
        <main className="min-w-0 flex-1 md:mt-6">
          {/* Navigation Tabs */}
          <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex">
              {[
                { id: "about", label: "About", icon: Info },
                { id: "home", label: "My Home", icon: Home },
                {
                  id: "photos",
                  label: "Photos",
                  icon: Camera,
                  count: profile.photos.length,
                },
                {
                  id: "references",
                  label: "References",
                  icon: Star,
                  count: profile.referencesCount,
                },
              ].map((tab, index, arr) => (
                <button
                  className={`flex flex-1 items-center justify-center gap-1 border-b-2 px-2 py-3 font-bold text-xs transition-colors sm:gap-2 sm:px-4 sm:py-4 sm:text-sm ${
                    index === 0 ? "rounded-tl-xl" : ""
                  } ${index === arr.length - 1 ? "rounded-tr-xl" : ""} ${
                    activeTab === tab.id
                      ? "border-orange-500 bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400"
                      : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  }`}
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                >
                  <tab.icon className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
                  <span className="xs:inline hidden sm:inline">
                    {tab.label}
                  </span>
                  <span className="inline sm:hidden">
                    {tab.id === "references" ? "Refs" : tab.label}
                  </span>
                  {tab.count !== undefined && (
                    <span className="hidden rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600 sm:inline sm:px-2 sm:text-xs dark:bg-gray-700 dark:text-gray-400">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* TAB CONTENT */}
          <div className="min-h-[500px] rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {activeTab === "about" && (
              <div className="fade-in animate-in space-y-10">
                {/* Redesigned Overview Grid */}
                <section>
                  <h2 className="mb-4 flex items-center gap-2 font-bold text-gray-800 text-xl dark:text-gray-200">
                    Overview
                  </h2>
                  <div className="flex flex-col gap-4">
                    {/* Row 1: From | Education */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
                        <MapPin
                          className="shrink-0 text-gray-400 dark:text-gray-500"
                          size={18}
                        />
                        <div className="flex-1">
                          <span className="block font-bold text-gray-400 text-xs uppercase dark:text-gray-500">
                            From
                          </span>
                          {isEditing ? (
                            <input
                              className={inputClass}
                              onChange={(e) =>
                                handleInputChange("location", e.target.value)
                              }
                              value={profile.location}
                            />
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-gray-200">
                              {profile.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
                        <GraduationCap
                          className="shrink-0 text-gray-400 dark:text-gray-500"
                          size={18}
                        />
                        <div className="flex-1">
                          <span className="block font-bold text-gray-400 text-xs uppercase dark:text-gray-500">
                            Education
                          </span>
                          {isEditing ? (
                            <input
                              className={inputClass}
                              onChange={(e) =>
                                handleInputChange("education", e.target.value)
                              }
                              value={profile.education}
                            />
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-gray-200">
                              {profile.education}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Gender | Age | Occupation */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
                        <UserIcon
                          className="shrink-0 text-gray-400 dark:text-gray-500"
                          size={18}
                        />
                        <div className="flex-1">
                          <span className="block font-bold text-gray-400 text-xs uppercase dark:text-gray-500">
                            Gender
                          </span>
                          {isEditing ? (
                            <input
                              className={inputClass}
                              onChange={(e) =>
                                handleInputChange("gender", e.target.value)
                              }
                              value={profile.gender}
                            />
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-gray-200">
                              {profile.gender}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
                        <Calendar
                          className="shrink-0 text-gray-400 dark:text-gray-500"
                          size={18}
                        />
                        <div className="flex-1">
                          <span className="block font-bold text-gray-400 text-xs uppercase dark:text-gray-500">
                            Age
                          </span>
                          {isEditing ? (
                            <input
                              className={inputClass}
                              onChange={(e) =>
                                handleInputChange("age", Number(e.target.value))
                              }
                              type="number"
                              value={profile.age}
                            />
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-gray-200">
                              {profile.age}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-5 dark:border-gray-700 dark:bg-gray-800">
                        <Briefcase
                          className="shrink-0 text-gray-400 dark:text-gray-500"
                          size={18}
                        />
                        <div className="flex-1">
                          <span className="block font-bold text-gray-400 text-xs uppercase dark:text-gray-500">
                            Occupation
                          </span>
                          {isEditing ? (
                            <input
                              className={inputClass}
                              onChange={(e) =>
                                handleInputChange("occupation", e.target.value)
                              }
                              value={profile.occupation}
                            />
                          ) : (
                            <span className="font-medium text-gray-900 dark:text-gray-200">
                              {profile.occupation}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Interests Tags */}
                <section>
                  <h3 className="mb-3 font-bold text-gray-900 text-lg dark:text-gray-100">
                    Interests
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.interests?.map((interest, i) => (
                      <span
                        className="flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 font-medium text-blue-800 text-sm dark:border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400"
                        key={i}
                      >
                        {interest}
                        {isEditing && (
                          <button
                            className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300"
                            onClick={() => handleRemoveInterest(interest)}
                          >
                            <X size={14} />
                          </button>
                        )}
                      </span>
                    ))}
                    {isEditing && (
                      <div className="flex gap-2">
                        <input
                          className="w-32 rounded border border-gray-300 bg-white px-2 py-1 text-gray-900 text-sm outline-none focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
                          onChange={(e) => setNewInterest(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleAddInterest()
                          }
                          placeholder="Add interest"
                          type="text"
                          value={newInterest}
                        />
                        <button
                          className="rounded bg-blue-600 px-2 text-white hover:bg-blue-700"
                          onClick={handleAddInterest}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </section>

                {/* About Me */}
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-lg dark:text-gray-100">
                      About Me
                    </h3>
                    {isEditing && (
                      <button
                        className="flex items-center gap-1 rounded px-2 py-1 font-bold text-purple-600 text-xs transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-500/20"
                        onClick={() => handleAIMagic("aboutMe")}
                      >
                        <Sparkles size={14} /> AI Polish
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      className={`${textareaClass} h-32`}
                      onChange={(e) =>
                        handleInputChange("aboutMe", e.target.value)
                      }
                      value={profile.aboutMe}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed dark:text-gray-300">
                      {profile.aboutMe}
                    </p>
                  )}
                </section>

                {/* Why I'm on CS */}
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-lg dark:text-gray-100">
                      Why I'm on Couchsurfing
                    </h3>
                    {isEditing && (
                      <button
                        className="flex items-center gap-1 rounded px-2 py-1 font-bold text-purple-600 text-xs transition-colors hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-500/20"
                        onClick={() => handleAIMagic("whyImOnCouchsurfing")}
                      >
                        <Sparkles size={14} /> AI Polish
                      </button>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      className={`${textareaClass} h-24`}
                      onChange={(e) =>
                        handleInputChange("whyImOnCouchsurfing", e.target.value)
                      }
                      value={profile.whyImOnCouchsurfing}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed dark:text-gray-300">
                      {profile.whyImOnCouchsurfing}
                    </p>
                  )}
                </section>

                {/* Teach Learn Share */}
                <section>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-lg dark:text-gray-100">
                      Teach, Learn, Share
                    </h3>
                  </div>
                  {isEditing ? (
                    <textarea
                      className={`${textareaClass} h-24`}
                      onChange={(e) =>
                        handleInputChange("teachLearnShare", e.target.value)
                      }
                      value={profile.teachLearnShare}
                    />
                  ) : (
                    <p className="whitespace-pre-wrap text-gray-700 leading-relaxed dark:text-gray-300">
                      {profile.teachLearnShare}
                    </p>
                  )}
                </section>

                {/* Countries */}
                <section>
                  <h3 className="mb-3 font-bold text-gray-900 text-lg dark:text-gray-100">
                    Countries I've Visited
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.countriesVisited.map((c) => (
                      <span
                        className="flex items-center gap-2 rounded-lg border border-orange-100 bg-orange-50 px-3 py-1.5 font-medium text-orange-800 text-sm dark:border-orange-500/20 dark:bg-orange-500/20 dark:text-orange-400"
                        key={c}
                      >
                        {c}
                        {isEditing && (
                          <X
                            className="cursor-pointer hover:text-red-500"
                            size={12}
                          />
                        )}
                      </span>
                    ))}
                    {isEditing && (
                      <button className="rounded-lg border border-gray-200 bg-gray-100 px-3 py-1.5 font-medium text-gray-600 text-sm hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600">
                        + Add Country
                      </button>
                    )}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "home" && (
              <div className="fade-in animate-in space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200">
                    My Home
                  </h2>
                  <div
                    className={`flex items-center gap-2 rounded-full px-4 py-1.5 font-bold text-sm ${profile.status.includes("not") ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400" : "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400"}`}
                  >
                    <Home size={16} /> {getStatusLabel(profile.status)}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-x-12 gap-y-6 md:grid-cols-2 lg:grid-cols-2">
                  {[
                    { key: "maxGuests", label: "Max Guests" },
                    { key: "preferredGender", label: "Preferred Gender" },
                    {
                      key: "sleepingArrangements",
                      label: "Sleeping Arrangements",
                    },
                    { key: "petFriendly", label: "Pet Friendly", bool: true },
                    { key: "kidFriendly", label: "Kid Friendly", bool: true },
                    {
                      key: "smokingAllowed",
                      label: "Smoking Allowed",
                      bool: true,
                    },
                    {
                      key: "wheelchairAccessible",
                      label: "Wheelchair Accessible",
                      bool: true,
                    },
                  ].map((item) => (
                    <div
                      className="flex items-center justify-between border-gray-100 border-b pb-2 dark:border-gray-700"
                      key={item.key}
                    >
                      <span className="font-medium text-gray-500 dark:text-gray-400">
                        {item.label}
                      </span>
                      {isEditing ? (
                        item.bool ? (
                          <input
                            checked={
                              profile.homeDetails[
                                item.key as keyof typeof profile.homeDetails
                              ] as boolean
                            }
                            onChange={(e) =>
                              handleHomeDetailChange(item.key, e.target.checked)
                            }
                            type="checkbox"
                          />
                        ) : (
                          <input
                            className="w-1/2 border-gray-300 border-b bg-white text-right text-gray-900 outline-none focus:border-orange-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200"
                            onChange={(e) =>
                              handleHomeDetailChange(item.key, e.target.value)
                            }
                            value={
                              profile.homeDetails[
                                item.key as keyof typeof profile.homeDetails
                              ] as string
                            }
                          />
                        )
                      ) : (
                        <span className="text-right font-semibold text-gray-900 dark:text-gray-200">
                          {item.bool
                            ? profile.homeDetails[
                                item.key as keyof typeof profile.homeDetails
                              ]
                              ? "Yes"
                              : "No"
                            : profile.homeDetails[
                                item.key as keyof typeof profile.homeDetails
                              ]}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                <section>
                  <h3 className="mb-3 font-bold text-gray-900 text-lg dark:text-gray-100">
                    Roommate Situation
                  </h3>
                  {isEditing ? (
                    <textarea
                      className={`${textareaClass} h-24`}
                      onChange={(e) =>
                        handleHomeDetailChange(
                          "roommateSituation",
                          e.target.value
                        )
                      }
                      value={profile.homeDetails.roommateSituation}
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                      {profile.homeDetails.roommateSituation}
                    </p>
                  )}
                </section>

                <section>
                  <h3 className="mb-3 font-bold text-gray-900 text-lg dark:text-gray-100">
                    Public Transport
                  </h3>
                  {isEditing ? (
                    <textarea
                      className={`${textareaClass} h-24`}
                      onChange={(e) =>
                        handleHomeDetailChange(
                          "publicTransport",
                          e.target.value
                        )
                      }
                      value={profile.homeDetails.publicTransport}
                    />
                  ) : (
                    <p className="text-gray-700 leading-relaxed dark:text-gray-300">
                      {profile.homeDetails.publicTransport}
                    </p>
                  )}
                </section>
              </div>
            )}

            {activeTab === "photos" && (
              <div className="fade-in animate-in">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200">
                    Photos
                  </h2>
                  {isMe && (
                    <button
                      className="rounded-lg bg-orange-500 px-4 py-2 font-bold text-white shadow-sm transition-colors hover:bg-orange-600"
                      onClick={handleAddPhoto}
                    >
                      + Upload Photo
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {profile.photos.map((photo, i) => (
                    <div
                      className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 transition-opacity hover:opacity-90 dark:bg-gray-700"
                      key={i}
                    >
                      <img
                        alt={`User photo ${i}`}
                        className="h-full w-full object-cover"
                        src={photo}
                      />
                      {isEditing && (
                        <button
                          className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                          onClick={() => removePhoto(i)}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "references" && (
              <div className="fade-in animate-in space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-2xl text-gray-800 dark:text-gray-200">
                    References
                  </h2>
                </div>
                {profile.references.map((ref) => (
                  <div
                    className="flex gap-4 border-gray-100 border-b pb-6 last:border-0 dark:border-gray-700"
                    key={ref.id}
                  >
                    <Link to={`/people/${ref.authorId}`}>
                      <img
                        alt={ref.authorName}
                        className="h-14 w-14 rounded-full object-cover transition-opacity hover:opacity-80"
                        src={ref.authorAvatar}
                      />
                    </Link>
                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <Link
                            className="font-bold text-gray-900 hover:text-orange-600 hover:underline dark:text-gray-100 dark:hover:text-orange-400"
                            to={`/people/${ref.authorId}`}
                          >
                            {ref.authorName}
                          </Link>
                          <p className="font-semibold text-gray-500 text-xs uppercase dark:text-gray-400">
                            {ref.type} • {ref.authorLocation}
                          </p>
                        </div>
                        <div
                          className={`rounded-full px-3 py-1 font-bold text-xs uppercase ${ref.isPositive ? "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"}`}
                        >
                          {ref.isPositive ? "Positive" : "Negative"}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed dark:text-gray-300">
                        {ref.text}
                      </p>
                      <p className="mt-2 text-gray-400 text-xs dark:text-gray-500">
                        {ref.date}
                      </p>

                      {/* Response Display */}
                      {ref.response && (
                        <div className="mt-4 flex gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                          <div className="shrink-0 pt-1">
                            <Reply
                              className="rotate-180 transform text-gray-400 dark:text-gray-500"
                              size={16}
                            />
                          </div>
                          <div>
                            <p className="mb-1 font-bold text-gray-600 text-xs dark:text-gray-400">
                              Your Response • {ref.responseDate}
                            </p>
                            <p className="text-gray-700 text-sm italic dark:text-gray-300">
                              "{ref.response}"
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Reply Button (Only for Me and if no response yet) */}
                      {isMe && !ref.response && replyingToRefId !== ref.id && (
                        <button
                          className="mt-2 flex items-center gap-1 font-semibold text-blue-600 text-sm hover:underline dark:text-blue-400"
                          onClick={() => setReplyingToRefId(ref.id)}
                        >
                          <MessageCircle size={14} /> Respond to Reference
                        </button>
                      )}

                      {/* Reply Form */}
                      {replyingToRefId === ref.id && (
                        <div className="fade-in mt-4 animate-in">
                          <textarea
                            className={textareaClass}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write your response..."
                            rows={3}
                            value={replyText}
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              className="rounded-lg bg-blue-600 px-4 py-1.5 font-bold text-sm text-white hover:bg-blue-700"
                              onClick={() => handleReplySubmit(ref.id)}
                            >
                              Publish Response
                            </button>
                            <button
                              className="rounded-lg px-4 py-1.5 font-bold text-gray-500 text-sm hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                              onClick={() => {
                                setReplyingToRefId(null);
                                setReplyText("");
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="fade-in zoom-in-95 w-full max-w-sm animate-in rounded-xl bg-white p-6 shadow-xl duration-200 dark:bg-gray-800">
            <h3 className="mb-2 font-bold text-gray-900 text-xl dark:text-gray-100">
              Send Request to {profile.name}
            </h3>
            <p className="mb-6 text-gray-600 text-sm dark:text-gray-400">
              Choose what kind of request you'd like to send.
            </p>

            <div className="space-y-3">
              <button
                className="group flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:hover:bg-orange-500/20"
                onClick={() => handleSendRequest("host")}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-100 p-2 text-green-600 transition-colors group-hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400 dark:group-hover:bg-green-500/30">
                    <Home size={20} />
                  </div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    Request to Stay
                  </span>
                </div>
              </button>

              <button
                className="group flex w-full items-center justify-between rounded-lg border border-gray-200 p-4 transition-all hover:border-orange-500 hover:bg-orange-50 dark:border-gray-700 dark:hover:bg-orange-500/20"
                onClick={() => handleSendRequest("meetup")}
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600 transition-colors group-hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:group-hover:bg-blue-500/30">
                    <UserIcon size={20} />
                  </div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    Request to Meet Up
                  </span>
                </div>
              </button>
            </div>

            <button
              className="mt-6 w-full py-2 font-bold text-gray-500 transition-colors hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setShowRequestModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Write Reference Modal */}
      {showWriteRefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="fade-in zoom-in-95 w-full max-w-lg animate-in rounded-xl bg-white p-6 shadow-xl duration-200 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-xl dark:text-gray-100">
                Write Reference for {profile.name}
              </h3>
              <button
                className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-gray-400"
                onClick={() => {
                  setShowWriteRefModal(false);
                  setRefText("");
                  setRefType("Host");
                  setRefIsPositive(true);
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Reference Type Selector */}
            <div className="mb-4">
              <label className="mb-2 block font-semibold text-gray-700 text-sm dark:text-gray-300">
                How do you know {profile.name}?
              </label>
              <div className="flex gap-2">
                {(["Host", "Surfer", "Personal"] as const).map((type) => (
                  <button
                    className={`flex-1 rounded-lg border-2 px-4 py-2 font-semibold text-sm transition-all ${
                      refType === type
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400"
                        : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700"
                    }`}
                    key={type}
                    onClick={() => setRefType(type)}
                    type="button"
                  >
                    {type === "Host" && "They hosted me"}
                    {type === "Surfer" && "They stayed with me"}
                    {type === "Personal" && "We met up"}
                  </button>
                ))}
              </div>
            </div>

            {/* Positive/Negative Toggle */}
            <div className="mb-4">
              <label className="mb-2 block font-semibold text-gray-700 text-sm dark:text-gray-300">
                Was it a positive experience?
              </label>
              <div className="flex gap-3">
                <button
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-semibold transition-all ${
                    refIsPositive
                      ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-500/20 dark:text-green-400"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setRefIsPositive(true)}
                  type="button"
                >
                  <ThumbsUp size={20} /> Positive
                </button>
                <button
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 font-semibold transition-all ${
                    refIsPositive
                      ? "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:bg-gray-700"
                      : "border-red-500 bg-red-50 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                  }`}
                  onClick={() => setRefIsPositive(false)}
                  type="button"
                >
                  <ThumbsDown size={20} /> Negative
                </button>
              </div>
            </div>

            {/* Reference Text */}
            <div className="mb-6">
              <label className="mb-2 block font-semibold text-gray-700 text-sm dark:text-gray-300">
                Your Reference
              </label>
              <textarea
                className="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                onChange={(e) => setRefText(e.target.value)}
                placeholder={`Share your experience with ${profile.name}...`}
                rows={5}
                value={refText}
              />
              <p className="mt-1 text-gray-500 text-xs dark:text-gray-400">
                Be honest and constructive. Your reference helps others make
                informed decisions.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                className="flex-1 rounded-lg px-4 py-2.5 font-bold text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                onClick={() => {
                  setShowWriteRefModal(false);
                  setRefText("");
                  setRefType("Host");
                  setRefIsPositive(true);
                }}
              >
                Cancel
              </button>
              <button
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-bold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!refText.trim() || isSubmittingRef}
                onClick={handleSubmitReference}
              >
                {isSubmittingRef ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Submitting...
                  </>
                ) : (
                  <>
                    <PenLine size={18} /> Submit Reference
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;

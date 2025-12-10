import {
  AlertTriangle,
  Bell,
  Cloud,
  CreditCard,
  Facebook,
  Ghost,
  Instagram,
  Lock,
  LogOut,
  Phone,
  Share2,
  Shield,
  Trash2,
  Twitter,
  User,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useUser } from "../lib/user-context";
import type { ProfileExtended } from "../types";

type SettingsTab =
  | "account"
  | "notifications"
  | "membership"
  | "privacy"
  | "social"
  | "safety";

// Settings data type
type SettingsData = {
  email: string;
  phone: string;
  address: string;
  publicLocation: string;
  emergencyContact: {
    name: string;
    phone: string;
    email: string;
    notes: string;
  };
};

const SettingsView: React.FC = () => {
  const { currentUserId } = useUser();
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [profile, setProfile] = useState<ProfileExtended | null>(null);
  const [settings, setSettings] = useState<SettingsData>({
    email: "",
    phone: "",
    address: "",
    publicLocation: "",
    emergencyContact: {
      name: "",
      phone: "",
      email: "",
      notes: "",
    },
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user profile and settings
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const userProfile = await api.getUser(currentUserId);
        if (userProfile) {
          setProfile(userProfile);
          // In a real app, settings would come from a separate API
          // For now, use placeholder defaults based on the user
          setSettings({
            email: `${userProfile.name.toLowerCase().replace(/\s+/g, ".")}@example.com`,
            phone: "(555) 000-0000",
            address: userProfile.location,
            publicLocation: userProfile.location,
            emergencyContact: {
              name: "",
              phone: "",
              email: "",
              notes: "",
            },
          });
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [currentUserId]);

  // Helper for consistent input styles (Light theme enforcement)
  const inputClass =
    "w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400";
  const labelClass =
    "block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1";
  const sectionTitleClass =
    "text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-700 pb-2";

  // Get name parts
  const nameParts = profile?.name.split(" ") || ["", ""];
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  const renderContent = () => {
    if (isLoading || !profile) {
      return (
        <div className="flex h-64 items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">
            Loading settings...
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case "account":
        return (
          <div className="fade-in animate-in space-y-8">
            {/* Personal Details */}
            <section>
              <h3 className={sectionTitleClass}>Account Details</h3>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Username</label>
                  <div className="flex items-center">
                    <span className="rounded-l border border-gray-300 border-r-0 bg-gray-100 px-3 py-2 text-gray-500 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400">
                      app.com/people/
                    </span>
                    <input
                      className={`${inputClass} rounded-l-none`}
                      defaultValue={currentUserId}
                      type="text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>First name</label>
                    <input
                      className={inputClass}
                      defaultValue={firstName}
                      type="text"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Last name</label>
                    <input
                      className={inputClass}
                      defaultValue={lastName}
                      type="text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Birthday</label>
                    <div className="flex gap-2">
                      <select className={inputClass} defaultValue="1">
                        {Array.from({ length: 31 }, (_, i) => (
                          <option key={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                      <select className={inputClass} defaultValue="January">
                        {[
                          "January",
                          "February",
                          "March",
                          "April",
                          "May",
                          "June",
                          "July",
                          "August",
                          "September",
                          "October",
                          "November",
                          "December",
                        ].map((month) => (
                          <option key={month}>{month}</option>
                        ))}
                      </select>
                      <select className={inputClass} defaultValue="1990">
                        {Array.from({ length: 80 }, (_, i) => (
                          <option key={2005 - i}>{2005 - i}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select
                      className={inputClass}
                      defaultValue={profile.gender}
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Preferred Language</label>
                  <select className={inputClass} defaultValue="English">
                    <option>English</option>
                    <option>Spanish</option>
                    <option>French</option>
                  </select>
                  <p className="mt-1 text-gray-400 text-xs dark:text-gray-500">
                    We'll send you messages in this language.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact Details */}
            <section>
              <h3 className={`${sectionTitleClass} mt-8`}>
                My Contact Details
              </h3>
              <div className="space-y-6">
                <div>
                  <label className={labelClass}>Phone</label>
                  <div className="flex">
                    <select className="rounded-l border border-gray-300 border-r-0 bg-gray-50 px-2 text-gray-900 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                      <option>🇺🇸</option>
                    </select>
                    <input
                      className={`${inputClass} rounded-l-none`}
                      defaultValue={settings.phone}
                      placeholder="(555) 000-0000"
                      type="tel"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Home Address</label>
                  <div className="mb-2 rounded border border-gray-200 bg-gray-50 p-3 text-gray-600 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
                    {settings.address || "No address set"}
                    <br />
                    <span className="font-bold">Public Profile Location:</span>{" "}
                    {settings.publicLocation || profile.location}
                  </div>
                  <button
                    className="font-medium text-blue-600 text-sm hover:underline dark:text-blue-400"
                    type="button"
                  >
                    Edit your Address
                  </button>
                </div>
              </div>
            </section>

            {/* Account Details (Email/Pass) */}
            <section>
              <h3 className={`${sectionTitleClass} mt-8`}>Account Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div>
                    <label className={labelClass}>Email</label>
                    <span className="text-gray-600 text-sm dark:text-gray-400">
                      {settings.email || "No email set"}
                    </span>
                  </div>
                  <button
                    className="font-medium text-blue-600 text-sm hover:underline dark:text-blue-400"
                    type="button"
                  >
                    Change My Email
                  </button>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <label className={labelClass}>Password</label>
                    <span className="text-gray-600 text-sm dark:text-gray-400">
                      ••••••••••
                    </span>
                  </div>
                  <button
                    className="font-medium text-blue-600 text-sm hover:underline dark:text-blue-400"
                    type="button"
                  >
                    Change My Password
                  </button>
                </div>
              </div>
            </section>

            {/* Emergency Contact */}
            <section>
              <h3 className={`${sectionTitleClass} mt-8`}>Emergency Contact</h3>
              <p className="mb-4 text-gray-500 text-sm dark:text-gray-400">
                You give us permission to notify this person if we believe you
                were involved in an emergency.
              </p>
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Name</label>
                  <input
                    className={inputClass}
                    defaultValue={settings.emergencyContact.name}
                    placeholder="Emergency contact name"
                    type="text"
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone Number</label>
                  <div className="flex">
                    <select className="rounded-l border border-gray-300 border-r-0 bg-gray-50 px-2 text-gray-900 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
                      <option>🇺🇸</option>
                    </select>
                    <input
                      className={`${inputClass} rounded-l-none`}
                      defaultValue={settings.emergencyContact.phone}
                      placeholder="(555) 000-0000"
                      type="tel"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    className={inputClass}
                    defaultValue={settings.emergencyContact.email}
                    placeholder="email@example.com"
                    type="email"
                  />
                </div>
                <div>
                  <label className={labelClass}>Notes</label>
                  <textarea
                    className={`${inputClass} h-20 resize-none`}
                    defaultValue={settings.emergencyContact.notes}
                    placeholder="Any additional notes..."
                  />
                </div>
              </div>
            </section>

            <div className="flex justify-between border-gray-200 border-t pt-6 dark:border-gray-700">
              <button
                className="rounded bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                type="button"
              >
                Save Changes
              </button>
              <button
                className="font-medium text-red-500 text-sm hover:underline dark:text-red-400"
                type="button"
              >
                Deactivate My Account
              </button>
            </div>
          </div>
        );

      case "membership":
        return (
          <div className="fade-in animate-in space-y-8">
            <section>
              <h3 className={sectionTitleClass}>Membership & Subscriptions</h3>
              <div className="rounded border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <h4 className="mb-4 font-bold text-orange-600 text-sm uppercase dark:text-orange-500">
                  Your Subscription Details
                </h4>
                <div className="grid grid-cols-[160px_1fr] gap-y-4 text-sm">
                  <div className="font-bold text-gray-700 dark:text-gray-300">
                    Membership Type
                  </div>
                  <div className="text-gray-900 dark:text-gray-100">
                    Couchsurfing Contribution
                  </div>

                  <div className="font-bold text-gray-700 dark:text-gray-300">
                    Subscription Status
                  </div>
                  <div className="font-bold text-green-600 dark:text-green-500">
                    Active
                  </div>

                  <div className="font-bold text-gray-700 dark:text-gray-300">
                    Next Billing
                  </div>
                  <div className="text-gray-900 dark:text-gray-100">
                    1/7/2026
                  </div>

                  <div className="font-bold text-gray-700 dark:text-gray-300">
                    Chosen Plan
                  </div>
                  <div className="text-gray-900 dark:text-gray-100">
                    Couchsurfing Contribution charged monthly
                  </div>

                  <div className="font-bold text-gray-700 dark:text-gray-300">
                    Payment Method
                  </div>
                  <div className="text-gray-900 dark:text-gray-100">
                    Apple In App
                  </div>
                </div>
                <div className="mt-6">
                  <button className="rounded bg-gray-800 px-4 py-2 font-bold text-sm text-white hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600">
                    Manage Plan
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded border border-gray-200 bg-white p-6 shadow-sm">
                <h4 className="mb-4 font-bold text-orange-600 text-sm uppercase dark:text-orange-500">
                  Verification
                </h4>
                <div className="grid grid-cols-[160px_1fr] gap-y-4 text-sm">
                  <div className="font-bold text-gray-700 dark:text-gray-300">
                    Status
                  </div>
                  <div className="font-bold text-green-600 dark:text-green-500">
                    Lifetime
                  </div>
                </div>
              </div>
            </section>
          </div>
        );

      case "notifications":
        return (
          <div className="fade-in animate-in space-y-8">
            <section>
              <h3 className={sectionTitleClass}>Notification Preferences</h3>
              <p className="mb-6 text-gray-500 text-sm dark:text-gray-400">
                Choose how you want to be notified about activity on
                Couchsurfing.
              </p>

              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left text-sm">
                  <thead className="border-gray-200 border-b bg-gray-50 font-bold text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    <tr>
                      <th className="p-4">Notification Type</th>
                      <th className="w-24 p-4 text-center">Email</th>
                      <th className="w-24 p-4 text-center">Mobile</th>
                      <th className="w-24 p-4 text-center">Browser</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {[
                      "New messages",
                      "Couch requests",
                      "Friend requests",
                      "Reference updates",
                      "Group activity",
                      "Event invites",
                      "Marketing updates",
                    ].map((type, i) => (
                      <tr
                        className="hover:bg-gray-50 dark:hover:bg-gray-700"
                        key={i}
                      >
                        <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                          {type}
                        </td>
                        <td className="p-4 text-center">
                          <input
                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            defaultChecked
                            type="checkbox"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            defaultChecked={i < 4}
                            type="checkbox"
                          />
                        </td>
                        <td className="p-4 text-center">
                          <input
                            className="h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                            defaultChecked={i < 2}
                            type="checkbox"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-end">
                <button className="rounded bg-blue-600 px-6 py-2 font-bold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                  Update Preferences
                </button>
              </div>
            </section>
          </div>
        );

      case "social":
        return (
          <div className="fade-in animate-in space-y-8">
            <section>
              <h3 className={sectionTitleClass}>Social Networks</h3>
              <p className="mb-6 text-gray-500 text-sm">
                Connect your social accounts to find friends and build trust.
              </p>

              <div className="grid grid-cols-1 gap-4">
                {[
                  {
                    name: "Facebook",
                    icon: Facebook,
                    connected: true,
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    name: "Instagram",
                    icon: Instagram,
                    connected: false,
                    color: "text-pink-600",
                    bg: "bg-pink-50",
                  },
                  {
                    name: "X (Twitter)",
                    icon: Twitter,
                    connected: false,
                    color: "text-gray-900",
                    bg: "bg-gray-100",
                  },
                  {
                    name: "Snapchat",
                    icon: Ghost,
                    connected: false,
                    color: "text-yellow-500",
                    bg: "bg-yellow-50",
                  },
                  {
                    name: "Blue Sky",
                    icon: Cloud,
                    connected: false,
                    color: "text-blue-400",
                    bg: "bg-blue-50",
                  },
                ].map((social) => (
                  <div
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                    key={social.name}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`rounded-full p-2.5 ${social.bg} ${social.color}`}
                      >
                        <social.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100">
                          {social.name}
                        </h4>
                        <p
                          className={`font-semibold text-xs ${social.connected ? "text-green-600 dark:text-green-500" : "text-gray-400 dark:text-gray-500"}`}
                        >
                          {social.connected
                            ? `Connected as ${profile.name}`
                            : "Not connected"}
                        </p>
                      </div>
                    </div>
                    <button
                      className={`rounded px-4 py-1.5 font-bold text-sm transition-colors ${
                        social.connected
                          ? "border border-gray-300 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                          : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                      }`}
                    >
                      {social.connected ? "Disconnect" : "Connect"}
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        );

      case "privacy":
        return (
          <div className="fade-in animate-in space-y-8">
            <section>
              <h3 className={sectionTitleClass}>Privacy Settings</h3>
              <div className="space-y-6 rounded border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">
                      Search Visibility
                    </h4>
                    <p className="text-gray-500 text-sm dark:text-gray-400">
                      Allow search engines (like Google) to index your profile.
                    </p>
                  </div>
                  <div className="relative mr-2 inline-block w-12 select-none align-middle">
                    <input
                      className="toggle-checkbox absolute block h-6 w-6 cursor-pointer appearance-none rounded-full border-4 bg-white checked:right-0 checked:border-green-400 dark:bg-gray-700"
                      defaultChecked
                      type="checkbox"
                    />
                    <label className="toggle-label block h-6 cursor-pointer overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600" />
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">
                      Show exact location
                    </h4>
                    <p className="text-gray-500 text-sm dark:text-gray-400">
                      Display your precise neighborhood on the map instead of
                      just the city.
                    </p>
                  </div>
                  <div className="relative mr-2 inline-block w-12 select-none align-middle">
                    <input
                      className="toggle-checkbox absolute block h-6 w-6 cursor-pointer appearance-none rounded-full border-4 bg-white checked:right-0 checked:border-green-400 dark:bg-gray-700"
                      type="checkbox"
                    />
                    <label className="toggle-label block h-6 cursor-pointer overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600" />
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">
                      Allow personalized ads
                    </h4>
                    <p className="text-gray-500 text-sm dark:text-gray-400">
                      We use your interests to show you relevant offers.
                    </p>
                  </div>
                  <div className="relative mr-2 inline-block w-12 select-none align-middle">
                    <input
                      className="toggle-checkbox absolute block h-6 w-6 cursor-pointer appearance-none rounded-full border-4 bg-white checked:right-0 checked:border-green-400 dark:bg-gray-700"
                      defaultChecked
                      type="checkbox"
                    />
                    <label className="toggle-label block h-6 cursor-pointer overflow-hidden rounded-full bg-gray-300 dark:bg-gray-600" />
                  </div>
                </div>

                <div className="border-gray-100 border-t pt-4 dark:border-gray-700">
                  <button className="font-bold text-blue-600 text-sm hover:underline dark:text-blue-400">
                    Download my data
                  </button>
                </div>
              </div>
            </section>
          </div>
        );

      case "safety":
        return (
          <div className="fade-in animate-in space-y-8">
            <section>
              <h3 className={sectionTitleClass}>Safety Resources</h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-orange-100 bg-orange-50 p-6 dark:border-orange-900/50 dark:bg-orange-900/20">
                  <div className="mb-3 flex items-center gap-2 font-bold text-orange-700 dark:text-orange-400">
                    <Shield size={20} />
                    <h4>Tips for Guests</h4>
                  </div>
                  <ul className="list-inside list-disc space-y-2 text-gray-700 text-sm dark:text-gray-300">
                    <li>Read profiles and references carefully.</li>
                    <li>Communicate clearly within the app.</li>
                    <li>Have a backup plan for accommodation.</li>
                    <li>Trust your instincts.</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-blue-100 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-900/20">
                  <div className="mb-3 flex items-center gap-2 font-bold text-blue-700 dark:text-blue-400">
                    <Shield size={20} />
                    <h4>Tips for Hosts</h4>
                  </div>
                  <ul className="list-inside list-disc space-y-2 text-gray-700 text-sm dark:text-gray-300">
                    <li>Verify your guests' identity.</li>
                    <li>Set clear house rules upfront.</li>
                    <li>Don't be afraid to say no.</li>
                    <li>Secure your valuables.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex items-start gap-4 rounded-lg border border-red-100 bg-red-50 p-6 dark:border-red-900/50 dark:bg-red-900/20">
                <div className="shrink-0 rounded-full bg-red-100 p-2 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-red-800 dark:text-red-400">
                    In an Emergency
                  </h4>
                  <p className="mb-3 text-gray-700 text-sm dark:text-gray-300">
                    If you are in immediate danger, please contact local law
                    enforcement immediately.
                  </p>
                  <button className="flex items-center gap-2 rounded bg-red-600 px-4 py-2 font-bold text-sm text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600">
                    <Phone size={16} /> View Local Emergency Numbers
                  </button>
                </div>
              </div>
            </section>
          </div>
        );

      default:
        return (
          <div className="text-gray-500 dark:text-gray-400">
            Section under construction.
          </div>
        );
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-bold text-2xl text-gray-800 dark:text-gray-100">
        Account & Settings
      </h1>

      <div className="flex flex-col gap-8 md:flex-row">
        {/* Sidebar */}
        <nav className="flex w-full shrink-0 flex-col gap-1 md:w-64">
          {[
            { id: "account", label: "Account", icon: User },
            { id: "notifications", label: "Notifications", icon: Bell },
            {
              id: "membership",
              label: "Membership & Subscriptions",
              icon: CreditCard,
            },
            { id: "privacy", label: "Privacy", icon: Lock },
            { id: "social", label: "Social Networks", icon: Share2 },
            { id: "safety", label: "Safety", icon: Shield },
          ].map((item) => (
            <button
              className={`flex items-center gap-3 rounded-full px-4 py-3 text-left font-bold text-sm transition-all ${
                activeTab === item.id
                  ? "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
              key={item.id}
              onClick={() => setActiveTab(item.id as SettingsTab)}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}

          <div className="my-4 border-gray-200 border-t pt-4 dark:border-gray-700">
            <button className="flex w-full items-center gap-3 rounded-full px-4 py-3 font-bold text-gray-600 text-sm hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700">
              <LogOut size={18} /> Log Out
            </button>
            <button className="flex w-full items-center gap-3 rounded-full px-4 py-3 font-bold text-red-600 text-sm hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
              <Trash2 size={18} /> Delete Account
            </button>
          </div>
        </nav>

        {/* Content Area */}
        <div className="min-h-[600px] flex-1 rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;

import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";
import {
  conversations,
  labels,
  messages,
  references,
  settings,
  users,
} from "./schema";

const sqlite = new Database("couchsurfing.db");
const db = drizzle(sqlite);

// Helper to generate unique IDs
const _generateId = () => Math.random().toString(36).substring(2, 15);

// Seed Data
const seedUsers = () => {
  console.log("Seeding users...");

  // Current User (you)
  const currentUser = {
    id: "me",
    name: "Chibuzor",
    location: "Morgantown, WV, USA",
    avatarUrl: "https://picsum.photos/id/338/600/600",
    coverUrl: "https://picsum.photos/id/193/1200/400",
    status: "wants_to_meet_up" as const,
    referencesCount: 4,
    friendsCount: 29,
    languages: JSON.stringify(["English", "French", "Russian"]),
    occupation: "Chemical Engineer",
    education: "BS in Chemical Engineering",
    interests: JSON.stringify([
      "Hiking",
      "Guitar",
      "Travel",
      "Engineering",
      "Cooking",
      "Language Exchange",
    ]),
    age: 31,
    gender: "Male",
    joinedDate: "2014",
    responseRate: 100,
    responseTime: "Replies within an hour",
    lastLogin: "Today",
    verificationPayment: true,
    verificationPhone: true,
    verificationGovernmentId: false,
    verificationAddress: "pending" as const,
    aboutMe:
      "I love playing music and I've been playing guitar for almost 2 years. I love to do the outdoors stuff e.g. hiking, biking, etc. I'm a chill dude who can get down with hanging out or partying at the clubs.",
    whyImOnCouchsurfing:
      "I am a recent engineering graduate looking for awesome people to travel the world with!",
    oneAmazingThing: "I've backpacked through 15 countries in 3 months.",
    teachLearnShare:
      "I can teach you guitar basics, some engineering concepts, or we can share travel stories.",
    musicMoviesBooks:
      "Music - Country, Ed Sheeran, Literally anything on acoustic guitar.\nMovies - High School Musicals 1-3.",
    countriesVisited: JSON.stringify([
      "Germany",
      "France",
      "Estonia",
      "United States",
      "Canada",
      "Hungary",
      "Poland",
      "England",
    ]),
    countriesLived: JSON.stringify(["United States", "Nigeria"]),
    photos: JSON.stringify([
      "https://picsum.photos/id/1011/600/400",
      "https://picsum.photos/id/1012/600/400",
      "https://picsum.photos/id/1013/600/400",
      "https://picsum.photos/id/1014/600/400",
    ]),
    homeDetails: JSON.stringify({
      maxGuests: 1,
      lastMinute: true,
      preferredGender: "Any",
      kidFriendly: false,
      petFriendly: false,
      smokingAllowed: false,
      hasPets: false,
      hasChildren: false,
      sleepingArrangements: "Shared room",
      roommateSituation: "I live with 2 roommates who are also students.",
      publicTransport: "Bus stop is 5 mins away.",
      wheelchairAccessible: false,
    }),
  };

  db.insert(users).values(currentUser).run();

  // Generate other users
  const statuses = [
    "accepting_guests",
    "maybe_accepting_guests",
    "not_accepting_guests",
    "wants_to_meet_up",
  ] as const;
  const responseTimes = [
    "Replies within an hour",
    "Replies within a day",
    "Replies in 1-3 days",
    "Takes a week or more",
  ];
  const interestsList = [
    "Hiking",
    "Photography",
    "Cooking",
    "Yoga",
    "Surfing",
    "Coding",
    "Music",
    "Art",
    "History",
    "Foodie",
  ];
  const educations = [
    "Bachelors in Arts",
    "Masters in Science",
    "PhD in Physics",
    "Self-taught",
    "University of Life",
  ];
  const names = [
    "Abner Bogan",
    "Avi Amon",
    "J.R. Hamilton",
    "Natalie Lorenze",
    "Kristen Selin",
    "Cole Weaver",
    "Karima Neghmouche",
    "Sarah Johnson",
    "Mike Thompson",
    "Elena Rodriguez",
    "David Kim",
    "Lisa Chen",
    "Marcus Williams",
    "Anna Petrova",
    "James O'Brien",
    "Sofia Garcia",
  ];
  const locations = [
    "Morgantown, WV",
    "New York, NY",
    "Pittsburgh, PA",
    "Washington, DC",
    "Columbus, OH",
    "Boston, MA",
    "San Francisco, CA",
    "Austin, TX",
  ];

  for (let i = 0; i < 16; i++) {
    const user = {
      id: `user-${i}`,
      name: names[i % names.length] + (i >= names.length ? ` ${i}` : ""),
      location: locations[i % locations.length],
      avatarUrl: `https://picsum.photos/id/${150 + i}/200/200`,
      coverUrl: `https://picsum.photos/id/${250 + i}/600/200`,
      status: statuses[i % 4],
      referencesCount: Math.floor(Math.random() * 50),
      friendsCount: Math.floor(Math.random() * 200),
      languages: JSON.stringify([
        "English",
        i % 2 === 0 ? "Spanish" : "French",
      ]),
      occupation: ["Student", "Engineer", "Artist", "Teacher", "Nomad"][i % 5],
      education: educations[i % 5],
      interests: JSON.stringify([
        interestsList[i % 10],
        interestsList[(i + 1) % 10],
        interestsList[(i + 3) % 10],
      ]),
      age: 20 + Math.floor(Math.random() * 20),
      gender: i % 2 === 0 ? "Female" : "Male",
      joinedDate: (2015 + Math.floor(Math.random() * 8)).toString(),
      responseRate: 50 + Math.floor(Math.random() * 50),
      responseTime: responseTimes[i % 4],
      lastLogin: ["Today", "Yesterday", "Last Week"][i % 3],
      verificationPayment: i % 3 === 0,
      verificationPhone: i % 2 === 0,
      verificationGovernmentId: i % 4 === 0,
      verificationAddress: (i % 5 === 0 ? "verified" : "unverified") as
        | "verified"
        | "unverified",
      aboutMe: `Hi! I'm ${names[i % names.length]}. I love traveling and meeting new people.`,
      whyImOnCouchsurfing: "Looking to meet travelers and share experiences!",
      oneAmazingThing: "Once traveled across the country by train.",
      teachLearnShare: "I can share local tips and learn about your culture!",
      musicMoviesBooks: "Eclectic taste in music and film.",
      countriesVisited: JSON.stringify(["USA", "Canada", "Mexico"]),
      countriesLived: JSON.stringify(["USA"]),
      photos: JSON.stringify([`https://picsum.photos/id/${200 + i}/600/400`]),
      homeDetails: JSON.stringify({
        maxGuests: Math.floor(Math.random() * 3) + 1,
        lastMinute: Math.random() > 0.5,
        preferredGender: "Any",
        kidFriendly: Math.random() > 0.5,
        petFriendly: Math.random() > 0.5,
        smokingAllowed: false,
        hasPets: false,
        hasChildren: false,
        sleepingArrangements: "Private room",
        roommateSituation: "I live alone",
        publicTransport: "Good public transport nearby",
        wheelchairAccessible: Math.random() > 0.7,
      }),
    };
    db.insert(users).values(user).run();
  }

  // Add specific conversation users
  const conversationUsers = [
    {
      id: "seany",
      name: "SEANY KANE",
      location: "Indonesia, Bali",
      avatarUrl: "https://picsum.photos/id/1062/100/100",
      status: "accepting_guests" as const,
      referencesCount: 125,
      friendsCount: 580,
      languages: JSON.stringify(["English"]),
      occupation: "Digital Nomad",
      education: "Life University",
      interests: JSON.stringify(["Surfing", "Digital Nomad", "Crypto"]),
      age: 39,
      gender: "Male",
      joinedDate: "2015",
      responseRate: 80,
      responseTime: "Replies within a day",
      lastLogin: "yesterday",
      verificationPayment: true,
      verificationPhone: true,
      verificationGovernmentId: true,
      verificationAddress: "verified" as const,
      aboutMe: "Living the dream in Bali!",
      whyImOnCouchsurfing: "Love meeting fellow travelers",
      oneAmazingThing: "Surfed in 20+ countries",
      teachLearnShare: "Surfing lessons and crypto tips",
      musicMoviesBooks: "Reggae, surf films",
      countriesVisited: JSON.stringify([
        "Indonesia",
        "Australia",
        "Thailand",
        "Vietnam",
        "USA",
      ]),
      countriesLived: JSON.stringify(["USA", "Indonesia"]),
      photos: JSON.stringify(["https://picsum.photos/id/1062/600/400"]),
      homeDetails: JSON.stringify({
        maxGuests: 2,
        lastMinute: true,
        preferredGender: "Any",
        kidFriendly: true,
        petFriendly: true,
        smokingAllowed: false,
        hasPets: false,
        hasChildren: false,
        sleepingArrangements: "Shared space",
        roommateSituation: "Villa with other nomads",
        publicTransport: "Scooter recommended",
        wheelchairAccessible: false,
      }),
    },
    {
      id: "vlad",
      name: "Vlad Vee",
      location: "Moscow, Russia",
      avatarUrl: "https://picsum.photos/id/1005/100/100",
      status: "maybe_accepting_guests" as const,
      referencesCount: 12,
      friendsCount: 5,
      languages: JSON.stringify(["Russian", "English"]),
      occupation: "Student",
      education: "Moscow State",
      interests: JSON.stringify(["Coding", "Chess", "Reading"]),
      age: 24,
      gender: "Male",
      joinedDate: "2020",
      responseRate: 60,
      responseTime: "Replies in 1-3 days",
      lastLogin: "1 week ago",
      verificationPayment: false,
      verificationPhone: false,
      verificationGovernmentId: false,
      verificationAddress: "unverified" as const,
      aboutMe:
        "Computer science student interested in meeting international friends.",
      whyImOnCouchsurfing: "Cultural exchange and practice English",
      oneAmazingThing: "Can solve a Rubik's cube in under 2 minutes",
      teachLearnShare: "Programming basics, Russian language",
      musicMoviesBooks: "Classical music, Dostoevsky",
      countriesVisited: JSON.stringify(["Russia", "Germany", "France"]),
      countriesLived: JSON.stringify(["Russia"]),
      photos: JSON.stringify(["https://picsum.photos/id/1005/600/400"]),
      homeDetails: JSON.stringify({
        maxGuests: 1,
        lastMinute: false,
        preferredGender: "Any",
        kidFriendly: false,
        petFriendly: false,
        smokingAllowed: false,
        hasPets: false,
        hasChildren: false,
        sleepingArrangements: "Couch",
        roommateSituation: "Shared apartment",
        publicTransport: "Metro nearby",
        wheelchairAccessible: false,
      }),
    },
    {
      id: "new_friend",
      name: "Elara Moon",
      location: "Portland, OR",
      avatarUrl: "https://picsum.photos/id/334/100/100",
      status: "wants_to_meet_up" as const,
      referencesCount: 8,
      friendsCount: 42,
      languages: JSON.stringify(["English", "German"]),
      occupation: "Artist",
      education: "Art School",
      interests: JSON.stringify(["Painting", "Hiking", "Veganism"]),
      age: 27,
      gender: "Female",
      joinedDate: "2022",
      responseRate: 95,
      responseTime: "Replies within an hour",
      lastLogin: "Today",
      verificationPayment: true,
      verificationPhone: true,
      verificationGovernmentId: false,
      verificationAddress: "verified" as const,
      aboutMe: "Artist and nature lover based in Portland.",
      whyImOnCouchsurfing: "Connecting with creative souls",
      oneAmazingThing: "Had a solo art exhibition at 25",
      teachLearnShare: "Watercolor painting, vegan cooking",
      musicMoviesBooks: "Indie folk, Studio Ghibli",
      countriesVisited: JSON.stringify(["USA", "Germany", "Japan"]),
      countriesLived: JSON.stringify(["USA", "Germany"]),
      photos: JSON.stringify(["https://picsum.photos/id/334/600/400"]),
      homeDetails: JSON.stringify({
        maxGuests: 1,
        lastMinute: true,
        preferredGender: "Female",
        kidFriendly: false,
        petFriendly: true,
        smokingAllowed: false,
        hasPets: true,
        hasChildren: false,
        sleepingArrangements: "Private room",
        roommateSituation: "Live with my cat",
        publicTransport: "Great public transit",
        wheelchairAccessible: true,
      }),
    },
    {
      id: "archived_user",
      name: "Old Host",
      location: "Paris, France",
      avatarUrl: "https://picsum.photos/id/34/100/100",
      status: "not_accepting_guests" as const,
      referencesCount: 50,
      friendsCount: 100,
      languages: JSON.stringify(["French", "English"]),
      occupation: "Baker",
      education: "Culinary Institute",
      interests: JSON.stringify(["Baking", "History", "Wine"]),
      age: 45,
      gender: "Male",
      joinedDate: "2010",
      responseRate: 90,
      responseTime: "Replies within a day",
      lastLogin: "Last Month",
      verificationPayment: true,
      verificationPhone: false,
      verificationGovernmentId: false,
      verificationAddress: "unverified" as const,
      aboutMe: "Parisian baker with a love for hosting travelers.",
      whyImOnCouchsurfing: "Share the real Paris with visitors",
      oneAmazingThing: "My croissants won a local competition",
      teachLearnShare: "French baking, Paris history",
      musicMoviesBooks: "French cinema, Edith Piaf",
      countriesVisited: JSON.stringify(["France", "Italy", "Spain", "Belgium"]),
      countriesLived: JSON.stringify(["France"]),
      photos: JSON.stringify(["https://picsum.photos/id/34/600/400"]),
      homeDetails: JSON.stringify({
        maxGuests: 2,
        lastMinute: false,
        preferredGender: "Any",
        kidFriendly: true,
        petFriendly: false,
        smokingAllowed: false,
        hasPets: false,
        hasChildren: true,
        sleepingArrangements: "Guest room",
        roommateSituation: "Family apartment",
        publicTransport: "Metro 2 min walk",
        wheelchairAccessible: false,
      }),
    },
  ];

  for (const user of conversationUsers) {
    db.insert(users).values(user).run();
  }

  console.log("Users seeded!");
};

const seedReferences = () => {
  console.log("Seeding references...");

  const refs = [
    {
      id: "ref1",
      userId: "me",
      authorId: "user-0",
      authorName: "Renzo Diaz",
      authorAvatar: "https://picsum.photos/id/55/100/100",
      authorLocation: "New York, USA",
      type: "Personal" as const,
      date: "Aug 2024",
      text: "Chibuzor is the life of the party! We hiked together and he played guitar by the fire. Awesome dude.",
      isPositive: true,
    },
    {
      id: "ref2",
      userId: "me",
      authorId: "user-1",
      authorName: "Sarah Jenkins",
      authorAvatar: "https://picsum.photos/id/65/100/100",
      authorLocation: "London, UK",
      type: "Host" as const,
      date: "May 2023",
      text: "Very clean and respectful guest. Would host again!",
      isPositive: true,
    },
    {
      id: "ref3",
      userId: "me",
      authorId: "seany",
      authorName: "SEANY KANE",
      authorAvatar: "https://picsum.photos/id/1062/100/100",
      authorLocation: "Bali, Indonesia",
      type: "Surfer" as const,
      date: "Jan 2023",
      text: "Great guy to hang with! Showed me around and we had amazing conversations.",
      isPositive: true,
    },
  ];

  for (const ref of refs) {
    db.insert(references).values(ref).run();
  }

  console.log("References seeded!");
};

const seedConversations = () => {
  console.log("Seeding conversations...");

  const convos = [
    {
      id: "conv1",
      userId: "me",
      otherUserId: "seany",
      lastMessage: "Brother are you there??",
      lastMessageDate: "2y ago",
      status: "active" as const,
      requestType: "meetup" as const,
      isRequest: false,
      isBlocked: false,
      labels: JSON.stringify([]),
    },
    {
      id: "conv2",
      userId: "me",
      otherUserId: "vlad",
      lastMessage: "Ciao! You're welcome ;)",
      lastMessageDate: "7y ago",
      status: "active" as const,
      requestType: "host" as const,
      isRequest: false,
      isBlocked: false,
      labels: JSON.stringify([]),
    },
    {
      id: "conv3",
      userId: "me",
      otherUserId: "new_friend",
      lastMessage: "Hey! I noticed we both like hiking. Want to grab coffee?",
      lastMessageDate: "10m ago",
      status: "active" as const,
      requestType: "meetup" as const,
      isRequest: true,
      isBlocked: false,
      labels: JSON.stringify([]),
    },
    {
      id: "conv4",
      userId: "me",
      otherUserId: "archived_user",
      lastMessage: "Hope you enjoyed Paris!",
      lastMessageDate: "5y ago",
      status: "archived" as const,
      requestType: "host" as const,
      isRequest: false,
      isBlocked: false,
      labels: JSON.stringify([]),
    },
  ];

  for (const conv of convos) {
    db.insert(conversations).values(conv).run();
  }

  console.log("Conversations seeded!");
};

const seedMessages = () => {
  console.log("Seeding messages...");

  const msgs = [
    // Conv1 - Seany
    {
      id: "m1-1",
      conversationId: "conv1",
      senderId: "seany",
      text: "Hey man, saw you were in Bali!",
      timestamp: "2023-01-15T10:00:00Z",
      isRead: true,
    },
    {
      id: "m1-2",
      conversationId: "conv1",
      senderId: "me",
      text: "Yeah just arrived!",
      timestamp: "2023-01-15T10:05:00Z",
      isRead: true,
    },
    {
      id: "m1-3",
      conversationId: "conv1",
      senderId: "seany",
      text: "Brother are you there??",
      timestamp: "2023-01-16T09:00:00Z",
      isRead: false,
    },

    // Conv2 - Vlad
    {
      id: "m2-1",
      conversationId: "conv2",
      senderId: "vlad",
      text: "Can I stay at your place?",
      timestamp: "2017-05-10T10:00:00Z",
      isRead: true,
    },
    {
      id: "m2-2",
      conversationId: "conv2",
      senderId: "me",
      text: "Sure thing, accepted.",
      timestamp: "2017-05-10T12:00:00Z",
      isRead: true,
    },
    {
      id: "m2-3",
      conversationId: "conv2",
      senderId: "vlad",
      text: "Ciao! You're welcome ;)",
      timestamp: "2017-05-12T09:00:00Z",
      isRead: true,
    },

    // Conv3 - Elara
    {
      id: "m3-1",
      conversationId: "conv3",
      senderId: "new_friend",
      text: "Hey! I noticed we both like hiking. I'm passing through Morgantown next week. Want to grab coffee or go for a trail run?",
      timestamp: new Date().toISOString(),
      isRead: false,
    },

    // Conv4 - Archived
    {
      id: "m4-1",
      conversationId: "conv4",
      senderId: "archived_user",
      text: "Hope you enjoyed Paris!",
      timestamp: "2019-06-01T12:00:00Z",
      isRead: true,
    },
  ];

  for (const msg of msgs) {
    db.insert(messages).values(msg).run();
  }

  console.log("Messages seeded!");
};

const seedSettings = () => {
  console.log("Seeding settings...");

  db.insert(settings)
    .values({
      id: "settings-me",
      userId: "me",
      email: "user@example.com",
      phone: "(555) 123-4567",
      emergencyContactName: "Emergency Contact",
      emergencyContactPhone: "(555) 987-6543",
      emergencyContactEmail: "emergency@example.com",
      emergencyContactNotes: "Available 24/7",
    })
    .run();

  console.log("Settings seeded!");
};

const seedLabels = () => {
  console.log("Seeding labels...");

  const defaultLabels = [
    { id: "label-1", userId: "me", name: "Friend", color: "#22c55e" },
    { id: "label-2", userId: "me", name: "Host", color: "#3b82f6" },
    { id: "label-3", userId: "me", name: "Potential Host", color: "#f59e0b" },
    { id: "label-4", userId: "me", name: "Met in Person", color: "#8b5cf6" },
    { id: "label-5", userId: "me", name: "Follow Up", color: "#ef4444" },
    { id: "label-6", userId: "me", name: "Local", color: "#06b6d4" },
  ];

  for (const label of defaultLabels) {
    db.insert(labels).values(label).run();
  }

  console.log("Labels seeded!");
};

// Main seed function
const seed = () => {
  console.log("Starting database seed...\n");

  // Drop existing tables (if any) by recreating
  sqlite.exec("DROP TABLE IF EXISTS messages");
  sqlite.exec("DROP TABLE IF EXISTS conversations");
  sqlite.exec(`DROP TABLE IF EXISTS "references"`);
  sqlite.exec("DROP TABLE IF EXISTS settings");
  sqlite.exec("DROP TABLE IF EXISTS labels");
  sqlite.exec("DROP TABLE IF EXISTS users");

  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      cover_url TEXT,
      status TEXT NOT NULL,
      references_count INTEGER NOT NULL DEFAULT 0,
      friends_count INTEGER NOT NULL DEFAULT 0,
      languages TEXT NOT NULL,
      occupation TEXT NOT NULL,
      education TEXT NOT NULL,
      interests TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      joined_date TEXT NOT NULL,
      response_rate INTEGER NOT NULL DEFAULT 100,
      response_time TEXT NOT NULL,
      last_login TEXT NOT NULL,
      verification_payment INTEGER NOT NULL DEFAULT 0,
      verification_phone INTEGER NOT NULL DEFAULT 0,
      verification_government_id INTEGER NOT NULL DEFAULT 0,
      verification_address TEXT NOT NULL DEFAULT 'unverified',
      about_me TEXT,
      one_amazing_thing TEXT,
      teach_learn_share TEXT,
      why_im_on_couchsurfing TEXT,
      music_movies_books TEXT,
      countries_visited TEXT,
      countries_lived TEXT,
      photos TEXT,
      home_details TEXT
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS "references" (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_avatar TEXT NOT NULL,
      author_location TEXT NOT NULL,
      type TEXT NOT NULL,
      text TEXT NOT NULL,
      date TEXT NOT NULL,
      is_positive INTEGER NOT NULL,
      response TEXT,
      response_date TEXT
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      other_user_id TEXT NOT NULL,
      last_message TEXT NOT NULL,
      last_message_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      request_type TEXT,
      is_request INTEGER DEFAULT 0,
      is_blocked INTEGER DEFAULT 0,
      labels TEXT,
      notes TEXT
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      text TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      emergency_contact_email TEXT,
      emergency_contact_notes TEXT
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS labels (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL DEFAULT '#6b7280'
    )
  `);

  seedUsers();
  seedReferences();
  seedConversations();
  seedMessages();
  seedSettings();
  seedLabels();

  console.log("\n✓ Database seeded successfully!");
  console.log("  Database file: couchsurfing.db");
};

seed();

import type { User, Session, Artwork, Rating, Comment, Report } from "./types";

const KEYS = {
  users: "ta_users",
  session: "ta_session",
  artworks: "ta_artworks",
  ratings: "ta_ratings",
  comments: "ta_comments",
  reports: "ta_reports",
  categories: "ta_categories",
  saved: "ta_saved",
  initialized: "ta_initialized",
};

const SAMPLE_ARTWORKS: Artwork[] = [
  {
    id: "art1",
    title: "Mountain Serenity",
    description:
      "A peaceful landscape capturing the quiet majesty of mountain peaks at dawn.",
    category: "Landscape",
    artistName: "Elena Voss",
    ownerUsername: "user1",
    imageUrl: "https://picsum.photos/seed/mountain1/800/600",
    uploadedBy: "user1",
    uploadedAt: "2026-04-10T09:00:00Z",
  },
  {
    id: "art2",
    title: "Neon Samurai",
    description:
      "A cyberpunk-style anime warrior wielding a glowing blade in a rain-soaked city.",
    category: "Anime",
    artistName: "KazeArt",
    ownerUsername: "user1",
    imageUrl: "https://picsum.photos/seed/anime2/600/900",
    uploadedBy: "user1",
    uploadedAt: "2026-04-12T14:30:00Z",
  },
  {
    id: "art3",
    title: "Study of Hands",
    description: "Detailed anatomical study of human hands in various poses.",
    category: "Anatomy",
    artistName: "Marco Bellini",
    ownerUsername: "admin",
    imageUrl: "https://picsum.photos/seed/hands3/700/700",
    uploadedBy: "admin",
    uploadedAt: "2026-04-15T11:00:00Z",
  },
  {
    id: "art4",
    title: "Forest Spirit",
    description:
      "An original character — a guardian spirit born from ancient woodland magic.",
    category: "Character",
    artistName: "Lila Moone",
    ownerUsername: "admin",
    imageUrl: "https://picsum.photos/seed/spirit4/600/800",
    uploadedBy: "admin",
    uploadedAt: "2026-04-18T16:45:00Z",
  },
  {
    id: "art5",
    title: "Coastal Dusk",
    description:
      "Golden hour over a rocky coastline, waves glowing amber in the fading light.",
    category: "Landscape",
    artistName: "Elena Voss",
    ownerUsername: "user1",
    imageUrl: "https://picsum.photos/seed/coast5/900/500",
    uploadedBy: "user1",
    uploadedAt: "2026-04-22T08:15:00Z",
  },
  {
    id: "art6",
    title: "Void Walker",
    description:
      "A mysterious traveler wandering through an abstract dimension between realities.",
    category: "Other",
    artistName: "DarkPixel",
    ownerUsername: "admin",
    imageUrl: "https://picsum.photos/seed/void6/700/900",
    uploadedBy: "admin",
    uploadedAt: "2026-05-01T20:00:00Z",
  },
  {
    id: "art7",
    title: "Dragon Scroll",
    description:
      "Traditional-style dragon character with flowing scales and fierce expression.",
    category: "Anime",
    artistName: "KazeArt",
    ownerUsername: "user1",
    imageUrl: "https://picsum.photos/seed/dragon7/800/700",
    uploadedBy: "user1",
    uploadedAt: "2026-05-05T13:00:00Z",
  },
  {
    id: "art8",
    title: "Muscle Map",
    description:
      "Front-view reference sheet for figure drawing — muscle groups and proportions.",
    category: "Anatomy",
    artistName: "Marco Bellini",
    ownerUsername: "admin",
    imageUrl: "https://picsum.photos/seed/muscle8/600/850",
    uploadedBy: "admin",
    uploadedAt: "2026-05-08T09:30:00Z",
  },
];

const SAMPLE_RATINGS: Rating[] = [
  { artworkId: "art1", username: "user1", value: 5 },
  { artworkId: "art1", username: "admin", value: 4 },
  { artworkId: "art2", username: "admin", value: 5 },
  { artworkId: "art3", username: "user1", value: 4 },
  { artworkId: "art4", username: "user1", value: 5 },
  { artworkId: "art5", username: "admin", value: 4 },
  { artworkId: "art6", username: "user1", value: 3 },
  { artworkId: "art7", username: "admin", value: 4 },
  { artworkId: "art8", username: "user1", value: 5 },
];

const SAMPLE_COMMENTS: Comment[] = [
  {
    id: "c1",
    artworkId: "art1",
    username: "user1",
    text: "The lighting here is absolutely breathtaking!",
    createdAt: "2026-04-11T10:00:00Z",
  },
  {
    id: "c2",
    artworkId: "art1",
    username: "admin",
    text: "Amazing use of color gradients. Love this piece.",
    createdAt: "2026-04-13T09:00:00Z",
  },
  {
    id: "c3",
    artworkId: "art2",
    username: "user1",
    text: "The neon glow effect on the blade is so well done!",
    createdAt: "2026-04-14T15:00:00Z",
  },
  {
    id: "c4",
    artworkId: "art3",
    username: "admin",
    text: "Perfect reference material. The shading is incredible.",
    createdAt: "2026-04-16T12:00:00Z",
  },
  {
    id: "c5",
    artworkId: "art4",
    username: "user1",
    text: "This character design is so original and full of life!",
    createdAt: "2026-04-19T17:00:00Z",
  },
  {
    id: "c6",
    artworkId: "art5",
    username: "admin",
    text: "The atmosphere is stunning. Great composition.",
    createdAt: "2026-04-23T08:30:00Z",
  },
  {
    id: "c7",
    artworkId: "art6",
    username: "user1",
    text: "Very abstract and thought-provoking. Love the concept.",
    createdAt: "2026-05-02T21:00:00Z",
  },
  {
    id: "c8",
    artworkId: "art7",
    username: "admin",
    text: "The scale details are insanely detailed. Wow!",
    createdAt: "2026-05-06T14:00:00Z",
  },
];

const DEFAULT_CATEGORIES = [
  "Digital Art",
  "Traditional",
  "Photography",
  "3D",
  "Other",
];

export function initStorage() {
  if (localStorage.getItem(KEYS.initialized)) return;

  const users: User[] = [
    {
      username: "AdMutCy",
      password: "AdMutCy24260612",
      role: "admin",
      createdAt: new Date().toISOString(),
    },
    {
      username: "user1",
      password: "user123",
      role: "user",
      createdAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(KEYS.users, JSON.stringify(users));
  localStorage.setItem(KEYS.artworks, JSON.stringify(SAMPLE_ARTWORKS));
  localStorage.setItem(KEYS.ratings, JSON.stringify(SAMPLE_RATINGS));
  localStorage.setItem(KEYS.comments, JSON.stringify(SAMPLE_COMMENTS));
  localStorage.setItem(KEYS.reports, JSON.stringify([]));
  localStorage.setItem(KEYS.saved, JSON.stringify([]));
  localStorage.setItem(KEYS.categories, JSON.stringify(DEFAULT_CATEGORIES));
  localStorage.setItem(KEYS.initialized, "true");
}

function parse<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

// Users
export const getUsers = (): User[] => parse<User[]>(KEYS.users, []);
export const saveUsers = (users: User[]) =>
  localStorage.setItem(KEYS.users, JSON.stringify(users));

// Session
export const getSession = (): Session | null =>
  parse<Session | null>(KEYS.session, null);
export const saveSession = (s: Session) =>
  localStorage.setItem(KEYS.session, JSON.stringify(s));
export const clearSession = () => localStorage.removeItem(KEYS.session);

// Artworks
export const getArtworks = (): Artwork[] => parse<Artwork[]>(KEYS.artworks, []);
export const saveArtworks = (artworks: Artwork[]) =>
  localStorage.setItem(KEYS.artworks, JSON.stringify(artworks));

// Ratings
export const getRatings = (): Rating[] => parse<Rating[]>(KEYS.ratings, []);
export const saveRatings = (ratings: Rating[]) =>
  localStorage.setItem(KEYS.ratings, JSON.stringify(ratings));

// Comments
export const getComments = (): Comment[] => parse<Comment[]>(KEYS.comments, []);
export const saveComments = (comments: Comment[]) =>
  localStorage.setItem(KEYS.comments, JSON.stringify(comments));

// Reports
export const getReports = (): Report[] => parse<Report[]>(KEYS.reports, []);
export const saveReports = (reports: Report[]) =>
  localStorage.setItem(KEYS.reports, JSON.stringify(reports));

// Categories
export const getCategories = (): string[] =>
  parse<string[]>(KEYS.categories, DEFAULT_CATEGORIES);
export const saveCategories = (cats: string[]) =>
  localStorage.setItem(KEYS.categories, JSON.stringify(cats));

// Saved Artworks
export const getSavedArtworks = (): string[] => parse<string[]>(KEYS.saved, []);
export const saveSavedArtworks = (saved: string[]) =>
  localStorage.setItem(KEYS.saved, JSON.stringify(saved));
export const toggleSaveArtwork = (artworkId: string) => {
  const saved = getSavedArtworks();
  if (saved.includes(artworkId)) {
    saveSavedArtworks(saved.filter((id) => id !== artworkId));
  } else {
    saveSavedArtworks([...saved, artworkId]);
  }
};
export const isArtworkSaved = (artworkId: string): boolean =>
  getSavedArtworks().includes(artworkId);

// Helpers
export function getArtworkRatings(artworkId: string) {
  const ratings = getRatings().filter((r) => r.artworkId === artworkId);
  if (!ratings.length) return { avg: 0, count: 0 };
  const avg = ratings.reduce((s, r) => s + r.value, 0) / ratings.length;
  return { avg: Math.round(avg * 10) / 10, count: ratings.length };
}

export function getArtworkComments(artworkId: string) {
  return getComments().filter((c) => c.artworkId === artworkId);
}

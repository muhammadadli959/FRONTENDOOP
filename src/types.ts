export type UserRole = "guest" | "user" | "admin";

export interface User {
  username: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface Session {
  username: string;
  role: UserRole;
  token?: string;
}

export interface Artwork {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  // backend: ArtworkResponse.ownerUsername
  ownerUsername: string;
  artistName?: string;
  uploadedBy?: string;
  uploadedAt?: string;
}

export interface Rating {
  artworkId: string;
  username: string;
  value: number;
}

export interface Comment {
  id: string;
  artworkId: string;
  username: string;
  text: string;
  createdAt: string;
}

export interface Report {
  id: string;
  artworkId: string;
  artworkTitle: string;
  reporter: string;
  reason: string;
  createdAt: string;
}

export interface SavedArtwork {
  artworkId: string;
  userId: string;
  savedAt: string;
}

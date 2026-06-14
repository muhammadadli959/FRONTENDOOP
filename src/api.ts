import type { Artwork, Comment, UserRole } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

function getSessionToken(): string | null {
  const stored =
    localStorage.getItem("ta_session") || sessionStorage.getItem("ta_session");
  if (!stored) return null;
  try {
    return JSON.parse(stored)?.token ?? null;
  } catch {
    return null;
  }
}

function authHeader(token?: string): Record<string, string> {
  const actualToken = token ?? getSessionToken();
  return actualToken ? { Authorization: `Bearer ${actualToken}` } : {};
}

async function safeJson(res: Response): Promise<unknown> {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function parseResponse<T>(
  res: Response,
  defaultMessage: string,
): Promise<T> {
  const body = await safeJson(res);
  if (!res.ok) {
    const errorMessage =
      typeof body === "object" && body !== null && "message" in body
        ? String((body as Record<string, unknown>).message)
        : defaultMessage;
    throw new Error(errorMessage);
  }

  if (
    typeof body === "object" &&
    body !== null &&
    Object.prototype.hasOwnProperty.call(body, "data")
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export async function fetchArtworks(): Promise<Artwork[]> {
  const res = await fetch(`${API_BASE_URL}/api/artworks`);
  return parseResponse<Artwork[]>(res, "Failed to fetch artworks");
}

export async function login(
  username: string,
  password: string,
): Promise<{ username: string; role: UserRole; token: string }> {
  const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return parseResponse<{ username: string; role: UserRole; token: string }>(
    res,
    "Login failed",
  );
}

export async function register(username: string, password: string) {
  const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return parseResponse(res, "Registration failed");
}

export async function getCategories(): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/api/categories`);
  return parseResponse<string[]>(res, "Failed to fetch categories");
}

export async function createCategory(
  name: string,
  token?: string,
): Promise<string> {
  const res = await fetch(`${API_BASE_URL}/api/categories`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ name }),
  });
  return parseResponse<string>(res, "Failed to create category");
}

export async function deleteCategory(
  name: string,
  token?: string,
): Promise<unknown> {
  const res = await fetch(
    `${API_BASE_URL}/api/categories?name=${encodeURIComponent(name)}`,
    {
      method: "DELETE",
      headers: authHeader(token),
    },
  );
  return parseResponse<unknown>(res, "Failed to delete category");
}

export async function getAdminComments(token?: string): Promise<unknown[]> {
  const res = await fetch(`${API_BASE_URL}/api/admin/comments`, {
    headers: authHeader(token),
  });
  return parseResponse<unknown[]>(res, "Failed to fetch admin comments");
}

export async function createComment(
  artworkId: string,
  content: string,
  token?: string,
): Promise<unknown> {
  const res = await fetch(
    `${API_BASE_URL}/api/artworks/${artworkId}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(token),
      },
      body: JSON.stringify({ content }),
    },
  );
  return parseResponse<unknown>(res, "Failed to create comment");
}

export async function deleteComment(
  commentId: string,
  token?: string,
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
  return parseResponse<unknown>(res, "Failed to delete comment");
}

export async function createArtwork(
  data: FormData,
  token?: string,
): Promise<Artwork> {
  const res = await fetch(`${API_BASE_URL}/api/artworks`, {
    method: "POST",
    headers: {
      ...authHeader(token),
    },
    body: data,
  });
  return parseResponse<Artwork>(res, "Failed to create artwork");
}

export async function updateArtwork(
  id: string,
  data: unknown,
  token?: string,
): Promise<Artwork> {
  const res = await fetch(`${API_BASE_URL}/api/artworks/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify(data),
  });
  return parseResponse<Artwork>(res, "Failed to update artwork");
}

export async function deleteArtwork(
  id: string,
  token?: string,
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/api/artworks/${id}`, {
    method: "DELETE",
    headers: authHeader(token),
  });
  return parseResponse<unknown>(res, "Failed to delete artwork");
}

export async function saveArtwork(
  artworkId: string,
  token?: string,
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/api/artworks/${artworkId}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
  });
  return parseResponse<unknown>(res, "Failed to save artwork");
}

export async function unsaveArtwork(
  artworkId: string,
  token?: string,
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/api/artworks/${artworkId}/unsave`, {
    method: "DELETE",
    headers: authHeader(token),
  });
  return parseResponse<unknown>(res, "Failed to unsave artwork");
}

export async function getSavedArtworks(token?: string): Promise<Artwork[]> {
  const res = await fetch(`${API_BASE_URL}/api/artworks/user/saved`, {
    headers: authHeader(token),
  });
  return parseResponse<Artwork[]>(res, "Failed to fetch saved artworks");
}

export async function saveArtworkToServer(
  artworkId: string,
  token?: string,
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/api/artworks/${artworkId}/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
  });
  // Handle 409 Conflict (already saved) as success
  if (res.status === 409) {
    return { message: "Already saved" };
  }
  return parseResponse<unknown>(res, "Failed to save artwork");
}

export async function unsaveArtworkFromServer(
  artworkId: string,
  token?: string,
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/api/artworks/${artworkId}/unsave`, {
    method: "DELETE",
    headers: {
      ...authHeader(token),
    },
  });
  return parseResponse<unknown>(res, "Failed to unsave artwork");
}

export async function checkIfSaved(
  artworkId: string,
  token?: string,
): Promise<{ isSaved: boolean }> {
  const res = await fetch(
    `${API_BASE_URL}/api/artworks/${artworkId}/is-saved`,
    {
      headers: authHeader(token),
    },
  );
  return parseResponse(res, "Failed to check save status");
}

export async function getArtworkComments(
  artworkId: string,
  token?: string,
): Promise<Comment[]> {
  const res = await fetch(
    `${API_BASE_URL}/api/artworks/${artworkId}/comments`,
    {
      headers: authHeader(token),
    },
  );
  return parseResponse<Comment[]>(res, "Failed to fetch comments");
}

export type RatingSummary = {
  average?: number;
  avg?: number;
  count?: number;
  getCount?: number;
};

export async function getArtworkRatingSummary(
  artworkId: string,
  token?: string,
): Promise<RatingSummary> {
  const res = await fetch(
    `${API_BASE_URL}/api/artworks/${artworkId}/ratings/summary`,
    {
      headers: authHeader(token),
    },
  );
  return parseResponse<RatingSummary>(res, "Failed to fetch rating summary");
}

export async function submitRatingToServer(
  artworkId: string,
  rating: number,
  token?: string,
): Promise<unknown> {
  const res = await fetch(`${API_BASE_URL}/api/artworks/${artworkId}/ratings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeader(token),
    },
    body: JSON.stringify({ rating }),
  });
  return parseResponse<unknown>(res, "Failed to submit rating");
}

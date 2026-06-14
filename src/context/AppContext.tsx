/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getReports,
  saveReports,
  getCategories,
  saveCategories,
} from "../storage";
import * as api from "../api";
import type { Artwork, Comment, Report } from "../types";

interface AppContextValue {
  artworks: Artwork[];
  refreshArtworks: () => Promise<void>;
  addArtwork: (a: Artwork, token?: string) => Promise<void>;
  updateArtwork: (a: Artwork, token?: string) => Promise<void>;
  deleteArtwork: (id: string, token?: string) => Promise<void>;

  getRatingInfo: (artworkId: string) => { avg: number; count: number };
  getUserRating: (artworkId: string, token?: string) => number | null;
  submitRating: (artworkId: string, username: string, value: number) => void;

  refreshRating: (artworkId: string) => Promise<void>;
  hasRatingLoaded: (artworkId: string) => boolean;
  getComments: (artworkId: string) => Comment[];
  refreshComments: (artworkId: string) => Promise<void>;
  hasCommentsLoaded: (artworkId: string) => boolean;
  postComment: (
    artworkId: string,
    content: string,
    token?: string,
  ) => Promise<void>;
  addComment: (
    artworkId: string,
    content: string,
    token?: string,
  ) => Promise<void>;
  deleteComment: (id: string, token?: string) => Promise<void>;

  reports: Report[];
  addReport: (r: Report) => void;
  dismissReport: (id: string) => void;
  deleteReportAndArtwork: (reportId: string, artworkId: string) => void;

  categories: string[];
  addCategory: (name: string, token?: string) => Promise<void>;
  deleteCategory: (name: string, token?: string) => Promise<void>;

  savedArtworks: string[];
  toggleSaveArtwork: (artworkId: string) => void;
  isArtworkSaved: (artworkId: string) => boolean;
  getSavedArtworksList: () => Artwork[];

  refreshSavedArtworks: () => Promise<void>;

  toast: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [artworks, setArtworksState] = useState<Artwork[]>([]);
  const [categories, setCategoriesState] = useState<string[]>(() =>
    getCategories(),
  );
  const [reports, setReportsState] = useState<Report[]>(() => getReports());
  const [toast, setToast] = useState<string | null>(null);
  const [savedArtworks, setSavedArtworksState] = useState<string[]>([]);
  const [commentsByArtwork, setCommentsByArtwork] = useState<
    Record<string, Comment[]>
  >({});
  const [ratingSummaryByArtwork, setRatingSummaryByArtwork] = useState<
    Record<string, { avg: number; count: number }>
  >({});
  const [userRatingByArtwork, setUserRatingByArtwork] = useState<
    Record<string, number>
  >({});

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const refreshArtworks = useCallback(async () => {
    try {
      const data = await api.fetchArtworks();
      // sync categories from server to ensure category names match backend
      try {
        const cats = await api.getCategories();
        if (Array.isArray(cats) && cats.length) setCategoriesState(cats);
      } catch {
        // keep local categories if server not available
      }
      // Normalize IDs to strings and ensure expected fields exist
      const normalized = (data ?? []).map((a: unknown) => {
        const obj = a as Record<string, unknown>;
        return {
          id: String(obj.id ?? obj._id ?? ""),
          title: String(obj.title ?? ""),
          description: String(obj.description ?? ""),
          category: String(obj.category ?? "Other"),
          imageUrl:
            (obj.imageUrl as string) ?? (obj.image_url as string) ?? null,
          ownerUsername: String(
            obj.ownerUsername ?? obj.uploadedBy ?? obj.username ?? "",
          ),
          artistName: (obj.artistName as string) ?? undefined,
          uploadedBy: (obj.uploadedBy as string) ?? undefined,
          uploadedAt: (obj.uploadedAt as string) ?? undefined,
        } as Artwork;
      });
      setArtworksState(normalized);
    } catch {
      showToast("Gagal memuat artworks dari server");
    }
  }, [showToast]);

  const addArtwork = useCallback(async (_a: Artwork, _token?: string) => {
    void _a;
    void _token;
    throw new Error(
      "Use UploadPage's createArtwork(FormData). AppContext.addArtwork is not used.",
    );
  }, []);

  const updateArtwork = useCallback(
    async (a: Artwork, token?: string) => {
      // optimistic update so UI reflects category/title/description changes immediately
      setArtworksState((prev) =>
        prev.map((x) => (x.id === a.id ? { ...x, ...a } : x)),
      );
      try {
        const updated = await api.updateArtwork(a.id, a, token);
        setArtworksState((prev) =>
          prev.map((x) =>
            x.id === a.id
              ? { ...x, ...updated, id: String(updated.id ?? x.id) }
              : x,
          ),
        );
        showToast("Artwork berhasil diupdate");
      } catch (err) {
        showToast("Gagal update artwork");
        // refresh from server to ensure consistency
        void refreshArtworks();
        throw err;
      }
    },
    [showToast, refreshArtworks],
  );

  const deleteArtwork = useCallback(
    async (id: string, token?: string) => {
      try {
        await api.deleteArtwork(id, token);
        setArtworksState((prev) => prev.filter((x) => x.id !== id));
        showToast("Artwork berhasil dihapus");
      } catch {
        showToast("Gagal menghapus artwork");
      }
    },
    [showToast],
  );

  const getRatingInfo = useCallback(
    (artworkId: string) =>
      ratingSummaryByArtwork[artworkId] ?? { avg: 0, count: 0 },
    [ratingSummaryByArtwork],
  );

  const refreshRating = useCallback(async (artworkId: string) => {
    try {
      const summary = await api.getArtworkRatingSummary(artworkId);
      const avg =
        typeof summary.average === "number" ? summary.average : summary.avg;
      const count =
        typeof summary.count === "number" ? summary.count : summary.getCount;
      const nextValue = { avg: Number(avg ?? 0), count: Number(count ?? 0) };
      setRatingSummaryByArtwork((prev) => {
        const existing = prev[artworkId];
        if (
          existing?.avg === nextValue.avg &&
          existing?.count === nextValue.count
        ) {
          return prev;
        }
        return { ...prev, [artworkId]: nextValue };
      });
    } catch {
      setRatingSummaryByArtwork((prev) => {
        const existing = prev[artworkId];
        if (existing?.avg === 0 && existing?.count === 0) {
          return prev;
        }
        return { ...prev, [artworkId]: { avg: 0, count: 0 } };
      });
    }
  }, []);

  const getUserRating = useCallback(
    (artworkId: string, token?: string): number | null => {
      void token;
      return userRatingByArtwork[artworkId] ?? null;
    },
    [userRatingByArtwork],
  );

  const hasRatingLoaded = useCallback(
    (artworkId: string) => artworkId in ratingSummaryByArtwork,
    [ratingSummaryByArtwork],
  );

  const hasCommentsLoaded = useCallback(
    (artworkId: string) => artworkId in commentsByArtwork,
    [commentsByArtwork],
  );

  const submitRating = useCallback(
    async (artworkId: string, username: string, value: number) => {
      // username tidak dipakai oleh backend, backend pakai JWT userId
      if (!username) return;
      await api.submitRatingToServer(artworkId, value);
      // reload summary dari server agar UI tidak blank
      const summary = await api.getArtworkRatingSummary(artworkId);
      const avg =
        typeof summary.average === "number" ? summary.average : summary.avg;
      const count = typeof summary.count === "number" ? summary.count : 0;
      setRatingSummaryByArtwork((prev) => ({
        ...prev,
        [artworkId]: { avg: Number(avg ?? 0), count: Number(count) },
      }));
      setUserRatingByArtwork((prev) => ({
        ...prev,
        [artworkId]: value,
      }));
    },
    [],
  );

  const getCommentsForArtwork = useCallback(
    (artworkId: string) => commentsByArtwork[artworkId] ?? [],
    [commentsByArtwork],
  );

  const refreshComments = useCallback(async (artworkId: string) => {
    try {
      const token = undefined;
      const res = await api.getArtworkComments(artworkId, token);
      type UnknownRecord = Record<string, unknown>;
      const normalized: Comment[] = (res ?? []).map((c) => {
        const record = c as unknown as UnknownRecord;
        return {
          id: String(record.id ?? ""),
          artworkId: String(artworkId),
          username: String(record.username ?? ""),
          text: String(record.content ?? ""),
          createdAt: new Date().toISOString(),
        };
      });
      setCommentsByArtwork((prev) => {
        const existing = prev[artworkId];
        const same =
          existing &&
          existing.length === normalized.length &&
          existing.every(
            (comment, index) => comment.id === normalized[index].id,
          );
        if (same) return prev;
        return { ...prev, [artworkId]: normalized };
      });
    } catch {
      setCommentsByArtwork((prev) => {
        const existing = prev[artworkId];
        if (existing?.length === 0) return prev;
        return { ...prev, [artworkId]: [] };
      });
    }
  }, []);

  const postComment = useCallback(
    async (artworkId: string, content: string, token?: string) => {
      await api.createComment(artworkId, content, token);
      await refreshComments(artworkId);
    },
    [refreshComments],
  );

  // backward-compat alias: some components call `addComment`
  const addComment = postComment;

  const deleteComment = useCallback(async (id: string, token?: string) => {
    await api.deleteComment(id, token);
    setCommentsByArtwork((prev) => {
      const next: Record<string, Comment[]> = { ...prev };
      for (const key of Object.keys(next)) {
        next[key] = next[key].filter((c) => c.id !== id);
      }
      return next;
    });
  }, []);

  const addReport = useCallback((r: Report) => {
    const updated = [...getReports(), r];
    saveReports(updated);
    setReportsState(updated);
  }, []);

  const dismissReport = useCallback((id: string) => {
    const updated = getReports().filter((r) => r.id !== id);
    saveReports(updated);
    setReportsState(updated);
  }, []);

  const deleteReportAndArtwork = useCallback(
    (reportId: string, artworkId: string) => {
      const updatedReports = getReports().filter(
        (r) => r.id !== reportId && r.artworkId !== artworkId,
      );
      saveReports(updatedReports);
      setReportsState(updatedReports);
      setArtworksState((prev) => prev.filter((a) => a.id !== artworkId));
    },
    [],
  );

  const addCategory = useCallback(
    async (name: string, token?: string) => {
      if (token) {
        try {
          const created = await api.createCategory(name, token);
          setCategoriesState((prev) => [...prev, created]);
          return;
        } catch {
          showToast("Gagal menambahkan kategori ke server");
          throw new Error("Failed to create category");
        }
      }

      const updated = [...getCategories(), name];
      saveCategories(updated);
      setCategoriesState(updated);
    },
    [showToast],
  );

  const deleteCategory = useCallback(
    async (name: string, token?: string) => {
      if (token) {
        try {
          await api.deleteCategory(name, token);
          setCategoriesState((prev) => prev.filter((c) => c !== name));
          return;
        } catch {
          showToast("Gagal menghapus kategori di server");
          throw new Error("Failed to delete category");
        }
      }

      const updated = getCategories().filter((c) => c !== name);
      saveCategories(updated);
      setCategoriesState(updated);
    },
    [showToast],
  );

  const isArtworkSaved = useCallback(
    (artworkId: string) => savedArtworks.includes(String(artworkId)),
    [savedArtworks],
  );

  const refreshSavedArtworks = useCallback(async () => {
    try {
      const data = await api.getSavedArtworks();
      const ids = (data ?? []).map((a) => String(a.id));
      setSavedArtworksState(ids);
    } catch {
      // ignore
    }
  }, []);

  // Load saved artworks and artwork list on app start
  useEffect(() => {
    void refreshSavedArtworks();
    void refreshArtworks();
  }, [refreshSavedArtworks, refreshArtworks]);

  const toggleSaveArtwork = useCallback(
    async (artworkId: string) => {
      const artworkIdStr = String(artworkId);
      const isSaved = savedArtworks.includes(artworkIdStr);
      if (isSaved) {
        await api.unsaveArtworkFromServer(artworkIdStr);
      } else {
        await api.saveArtworkToServer(artworkIdStr);
      }
      await refreshSavedArtworks();
    },
    [savedArtworks, refreshSavedArtworks],
  );

  const getSavedArtworksList = useCallback(
    () => artworks.filter((a) => savedArtworks.includes(String(a.id))),
    [artworks, savedArtworks],
  );

  return (
    <AppContext.Provider
      value={{
        artworks,
        refreshArtworks,
        addArtwork,
        updateArtwork,
        deleteArtwork,
        getRatingInfo,
        getUserRating,
        submitRating,
        refreshRating,
        hasRatingLoaded,
        getComments: getCommentsForArtwork,
        refreshComments,
        hasCommentsLoaded,
        postComment,
        addComment,
        deleteComment,

        reports,
        addReport,
        dismissReport,
        deleteReportAndArtwork,
        categories,
        addCategory,
        deleteCategory,
        savedArtworks,
        toggleSaveArtwork,
        isArtworkSaved,
        getSavedArtworksList,
        refreshSavedArtworks,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

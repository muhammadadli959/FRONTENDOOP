import { useEffect, useState } from "react";
import {
  Flag,
  Layers,
  Image,
  MessageCircle,
  Trash2,
  CheckCheck,
  Plus,
  X,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { getAdminComments, deleteComment } from "../api";

type Tab = "reports" | "categories" | "content";

interface AdminComment {
  id: string;
  artworkId: string;
  artworkTitle: string;
  username: string;
  content: string;
  createdAt?: string;
}

export default function AdminPage() {
  const { session } = useAuth();
  const {
    reports,
    artworks,
    categories,
    dismissReport,
    deleteReportAndArtwork,
    deleteArtwork,
    addCategory,
    deleteCategory,
    showToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<Tab>("reports");
  const [newCategory, setNewCategory] = useState("");
  const [allComments, setAllComments] = useState<AdminComment[]>([]);

  useEffect(() => {
    const loadAdminComments = async () => {
      if (!session?.token) return;
      try {
        const comments = await getAdminComments(session.token);
        const normalized = (comments ?? []).map((comment) => {
          const c = comment as Record<string, unknown>;
          return {
            id: String(c.id ?? ""),
            artworkId: String(c.artworkId ?? ""),
            artworkTitle: String(c.artworkTitle ?? "Unknown artwork"),
            username: String(c.username ?? ""),
            content: String(c.content ?? ""),
            createdAt: String(c.createdAt ?? new Date().toISOString()),
          };
        });
        setAllComments(normalized);
      } catch {
        setAllComments([]);
      }
    };

    void loadAdminComments();
  }, [session?.token]);

  const handleDeleteComment = async (id: string) => {
    if (!session?.token) return;
    try {
      await deleteComment(id, session.token);
      setAllComments((prev) => prev.filter((comment) => comment.id !== id));
      showToast("Comment deleted.");
    } catch {
      showToast("Failed to delete comment.");
    }
  };

  const handleDeleteArtwork = (id: string) => {
    if (!confirm("Delete this artwork permanently?")) return;
    deleteArtwork(id, session?.token);
    showToast("Artwork deleted.");
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name || categories.includes(name)) return;
    try {
      await addCategory(name, session?.token);
      setNewCategory("");
      showToast(`Category "${name}" added.`);
    } catch {
      showToast("Failed to add category.");
    }
  };

  const tabs: {
    key: Tab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      key: "reports",
      label: "Reports",
      icon: <Flag size={14} />,
      count: reports.length,
    },
    {
      key: "categories",
      label: "Categories",
      icon: <Layers size={14} />,
      count: categories.length,
    },
    {
      key: "content",
      label: "Moderation",
      icon: <Image size={14} />,
      count: artworks.length,
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage reports, categories, and content
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#13131f] border border-white/5 p-1 rounded-xl mb-8 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${
                    activeTab === tab.key
                      ? "bg-violet-500 text-white"
                      : "bg-white/10 text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <div>
            <h2 className="text-white font-semibold mb-4">Report Management</h2>
            {reports.length === 0 ? (
              <p className="text-gray-600 text-sm">No pending reports.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="bg-[#13131f] border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-semibold text-sm">
                          {report.artworkTitle}
                        </span>
                        <span className="text-xs bg-amber-900/40 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                          {report.reason}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">
                        Reported by{" "}
                        <span className="text-gray-400">{report.reporter}</span>{" "}
                        · {new Date(report.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          dismissReport(report.id);
                          showToast("Report dismissed.");
                        }}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-400 border border-white/10 hover:border-green-500/30 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <CheckCheck size={13} /> Dismiss
                      </button>
                      <button
                        onClick={() => {
                          deleteReportAndArtwork(report.id, report.artworkId);
                          showToast("Artwork deleted and report resolved.");
                        }}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 size={13} /> Delete Artwork
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === "categories" && (
          <div>
            <h2 className="text-white font-semibold mb-4">
              Category Management
            </h2>
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="flex-1 bg-[#13131f] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <button
                type="submit"
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
              >
                <Plus size={14} /> Add
              </button>
            </form>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <div
                  key={cat}
                  className="flex items-center gap-2 bg-[#13131f] border border-white/10 rounded-lg px-3 py-2"
                >
                  <span className="text-sm text-white">{cat}</span>
                  <button
                    onClick={async () => {
                      try {
                        await deleteCategory(cat, session?.token);
                        showToast(`Category "${cat}" deleted.`);
                      } catch {
                        showToast("Failed to delete category.");
                      }
                    }}
                    className="text-gray-600 hover:text-red-400 transition-colors"
                    title="Delete category"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content Moderation Tab */}
        {activeTab === "content" && (
          <div className="flex flex-col gap-8">
            {/* Artworks */}
            <div>
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Image size={16} /> All Artworks
                <span className="text-gray-600 font-normal text-sm">
                  ({artworks.length})
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                {artworks.map((artwork) => (
                  <div
                    key={artwork.id}
                    className="bg-[#13131f] border border-white/5 rounded-xl p-3 flex items-center gap-3"
                  >
                    <img
                      src={artwork.imageUrl}
                      alt={artwork.title}
                      className="w-12 h-12 object-cover rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">
                        {artwork.title}
                      </p>
                      <p className="text-gray-500 text-xs">
                        by {artwork.artistName ?? artwork.ownerUsername} ·{" "}
                        {artwork.category}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteArtwork(artwork.id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <MessageCircle size={16} /> All Comments
                <span className="text-gray-600 font-normal text-sm">
                  ({allComments.length})
                </span>
              </h2>
              <div className="flex flex-col gap-2">
                {allComments.length === 0 && (
                  <p className="text-gray-600 text-sm">No comments yet.</p>
                )}
                {allComments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-[#13131f] border border-white/5 rounded-xl p-3 flex items-start gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-violet-400 text-xs font-semibold">
                          {comment.username}
                        </span>
                        <span className="text-gray-600 text-xs">
                          on artwork #{comment.artworkId}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm line-clamp-2">
                        {comment.content}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 border border-red-500/20 px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

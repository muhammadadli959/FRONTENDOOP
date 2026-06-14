import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Modal from "../components/Modal";
import type { Artwork } from "../types";

export default function MyGalleryPage() {
  const { session } = useAuth();
  const {
    artworks,
    updateArtwork,
    deleteArtwork,
    categories,
    showToast,
    refreshArtworks,
  } = useApp();

  useEffect(() => {
    refreshArtworks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const myArtworks = artworks.filter(
    (a) => a.ownerUsername === session?.username,
  );

  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const openEdit = (artwork: Artwork) => {
    setEditingArtwork(artwork);
    setEditTitle(artwork.title);
    setEditDescription(artwork.description);
    setEditCategory(artwork.category);
  };

  const handleSave = async () => {
    if (!editingArtwork) return;
    try {
      await updateArtwork(
        {
          ...editingArtwork,
          title: editTitle.trim(),
          description: editDescription.trim(),
          category: editCategory,
        },
        session?.token,
      );
      setEditingArtwork(null);
      showToast("Artwork updated!");
    } catch {
      showToast("Gagal update artwork");
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this artwork? This cannot be undone.")) return;
    deleteArtwork(id, session?.token);
    showToast("Artwork deleted.");
  };

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">My Gallery</h1>
            <p className="text-gray-500 text-sm mt-1">
              {myArtworks.length} artwork{myArtworks.length !== 1 ? "s" : ""}{" "}
              uploaded
            </p>
          </div>
          <Link
            to="/upload"
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            Upload New
          </Link>
        </div>

        {myArtworks.length === 0 ? (
          <div className="text-center py-24 text-gray-600">
            <p className="text-lg mb-2">No artworks yet.</p>
            <Link
              to="/upload"
              className="text-violet-400 hover:text-violet-300 text-sm transition-colors"
            >
              Upload your first artwork
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {myArtworks.map((artwork) => (
              <div
                key={artwork.id}
                className="bg-[#13131f] rounded-xl border border-white/5 overflow-hidden group hover:border-violet-500/30 transition-colors"
              >
                <Link to={`/artwork/${artwork.id}`}>
                  <img
                    src={artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-44 object-cover group-hover:opacity-90 transition-opacity"
                  />
                </Link>
                <div className="p-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-500">
                    {artwork.category}
                  </span>
                  <h3 className="text-white font-semibold text-sm mt-0.5 line-clamp-1">
                    {artwork.title}
                  </h3>
                  <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
                    {artwork.description || "No description"}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => openEdit(artwork)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-violet-400 border border-white/10 hover:border-violet-500/30 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(artwork.id)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingArtwork && (
        <Modal title="Edit Artwork" onClose={() => setEditingArtwork(null)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Category
              </label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button
                onClick={() => setEditingArtwork(null)}
                className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="text-sm bg-violet-600 hover:bg-violet-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

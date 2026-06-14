import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { getCategories } from "../api";

export default function UploadPage() {
  const { session } = useAuth();
  const { categories, showToast, refreshArtworks } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(categories[0] || "Other");

  // kategori dari backend (DB) untuk menghindari mismatch "Invalid category"
  const [serverCategories, setServerCategories] = useState<string[]>([]);

  useEffect(() => {
    getCategories()
      .then((names) => {
        if (Array.isArray(names) && names.length > 0) {
          setServerCategories(names);

          // jika kategori yang dipilih tidak ada di server, set ke item pertama
          const next = (category || "").trim();
          const exists = names.includes(next);
          if (!exists) {
            setCategory(names[0]);
          }
        }
      })
      .catch(() => {
        // fallback pakai categories dari context
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getCategories]);

  const normalizedCategory = (category || "").trim();
  const [artistName, setArtistName] = useState(session?.username || "");
  const [imageUrl, setImageUrl] = useState("");
  const [previewError, setPreviewError] = useState(false);
  const [error, setError] = useState("");

  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isUploading) return;
    setIsUploading(true);

    const fileInput = document.getElementById(
      "imageFileInput",
    ) as HTMLInputElement | null;
    const file = fileInput?.files?.[0];

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!session?.token) {
      setError("Please login before uploading artwork.");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", normalizedCategory);
    formData.append("artistName", artistName.trim() || session.username);
    formData.append("uploadedBy", session.username);

    if (file) {
      formData.append("imageFile", file);
    }

    if (imageUrl.trim()) {
      formData.append("imageUrl", imageUrl.trim());
    }

    if (!file && !imageUrl.trim()) {
      setError("Image file or Image URL is required.");
      return;
    }

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/artworks`,
        {
          method: "POST",
          headers: {
            ...((session?.token
              ? { Authorization: `Bearer ${session.token}` }
              : {}) as Record<string, string>),
          },
          body: formData,
        },
      );

      const body = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(body?.message || "Failed to upload artwork.");
      }

      // backend wraps response in ApiResponse{ data: ... }
      const artworkCreated = body?.data ?? body;

      if (artworkCreated?.imageUrl) {
        // keep local preview stable before navigating
        setImageUrl(artworkCreated.imageUrl);
      }

      // pastikan kalau kategori dari server mengembalikan nilai yang berbeda
      if (artworkCreated?.category) {
        // setCategory(artworkCreated.category); // tidak wajib, tapi aman jika ada
      }

      showToast("Artwork uploaded successfully!");

      // refresh artworks so My Gallery & Home show the new item
      await refreshArtworks();

      // navigasi setelah state artworks diperbarui
      navigate("/my-gallery");
      return artworkCreated;
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload artwork. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPreviewError(false);

    if (!file) {
      setImageUrl("");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Upload Artwork</h1>
          <p className="text-gray-500 text-sm mt-1">
            Share your creative work with the community
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#13131f] border border-white/10 rounded-2xl p-6 flex flex-col gap-5"
        >
          {error && (
            <div className="bg-red-900/30 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Artwork title"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">
                Artist Name
              </label>
              <input
                type="text"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
                placeholder="Your name"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            >
              {(serverCategories.length ? serverCategories : categories).map(
                (c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ),
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              placeholder="Describe your artwork..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Image URL
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => {
                setPreviewError(false);
                setImageUrl(e.target.value);
              }}
              className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Or choose an image file
            </label>
            <input
              id="imageFileInput"
              type="file"
              accept="image/*"
              onChange={handleImageFileChange}
              className="w-full bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500 transition-colors"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can paste an image URL above or upload a local image file.
            </p>
          </div>

          {/* Preview */}
          {imageUrl && (
            <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0d0d1a]">
              <p className="text-xs text-gray-500 px-3 py-2 border-b border-white/5 flex items-center gap-1.5">
                <ImageIcon size={12} /> Preview
              </p>
              {previewError ? (
                <div className="p-4 text-sm text-red-300">
                  Unable to load preview. Check the image URL or select a
                  different file.
                </div>
              ) : (
                <img
                  src={imageUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-cover"
                  onLoad={() => setPreviewError(false)}
                  onError={() => setPreviewError(true)}
                />
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isUploading}
            className={`flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition-colors ${
              isUploading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            <Upload size={16} />
            {isUploading ? "Uploading..." : "Upload Artwork"}
          </button>
        </form>
      </div>
    </div>
  );
}

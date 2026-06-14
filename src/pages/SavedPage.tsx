import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import ArtworkCard from "../components/ArtworkCard";

export default function SavedPage() {
  const { getSavedArtworksList, refreshArtworks } = useApp();
  const { isGuest } = useAuth();

  useEffect(() => {
    refreshArtworks();
  }, [refreshArtworks]);

  const savedArtworks = getSavedArtworksList();

  if (isGuest) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex flex-col items-center justify-center text-gray-500">
        <p className="text-lg mb-4">Please login to view saved artworks.</p>
        <Link
          to="/login"
          className="text-violet-400 hover:text-violet-300 font-semibold underline"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Explore
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart size={28} className="text-red-500 fill-red-500" />
            <h1 className="text-3xl font-bold text-white">Saved Artworks</h1>
          </div>
          <p className="text-gray-400">
            {savedArtworks.length} artwork
            {savedArtworks.length !== 1 ? "s" : ""} saved
          </p>
        </div>

        {/* Content */}
        {savedArtworks.length === 0 ? (
          <div className="bg-[#13131f] border border-white/5 rounded-xl p-12 text-center">
            <Heart
              size={48}
              className="text-gray-600 mx-auto mb-4 opacity-50"
            />
            <h2 className="text-lg font-semibold text-gray-400 mb-2">
              No saved artworks yet
            </h2>
            <p className="text-gray-500 mb-4">
              Start saving your favorite artworks to see them here!
            </p>
            <Link
              to="/"
              className="inline-block text-violet-400 hover:text-violet-300 font-semibold"
            >
              Explore Artworks →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

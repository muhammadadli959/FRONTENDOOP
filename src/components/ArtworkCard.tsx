import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, MessageCircle, Heart } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Artwork } from "../types";
import { useAuth } from "../context/AuthContext";

interface Props {
  artwork: Artwork;
}

export default function ArtworkCard({ artwork }: Props) {
  const {
    getRatingInfo,
    getComments,
    isArtworkSaved,
    toggleSaveArtwork,
    refreshComments,
    refreshRating,
    hasCommentsLoaded,
    hasRatingLoaded,
  } = useApp();
  const { isGuest } = useAuth();

  const ownerName = artwork.artistName ?? artwork.ownerUsername;
  const { avg, count } = getRatingInfo(artwork.id);
  const commentCount = getComments(artwork.id).length;
  const isLoadedComments = hasCommentsLoaded(artwork.id);
  const isLoadedRating = hasRatingLoaded(artwork.id);
  const isSaved = isArtworkSaved(artwork.id);

  useEffect(() => {
    if (!isLoadedComments) {
      void refreshComments(artwork.id);
    }
  }, [artwork.id, isLoadedComments, refreshComments]);

  useEffect(() => {
    if (!isLoadedRating) {
      void refreshRating(artwork.id);
    }
  }, [artwork.id, isLoadedRating, refreshRating]);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isGuest) {
      // konsisten dengan flow akses: redirect ke login
      window.location.href = "/login";
      return;
    }
    toggleSaveArtwork(artwork.id);
  };

  return (
    <Link
      to={`/artwork/${artwork.id}`}
      className="group block bg-[#13131f] rounded-xl overflow-hidden border border-white/5 hover:border-violet-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-violet-900/20 hover:-translate-y-0.5"
    >
      <div className="overflow-hidden bg-[#0d0d1a] relative">
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
          style={{ maxHeight: "320px" }}
          loading="lazy"
        />
        <button
          onClick={handleSaveClick}
          className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 p-1.5 rounded-lg transition-colors"
          title={isSaved ? "Remove from saved" : "Save artwork"}
        >
          <Heart
            size={16}
            className={isSaved ? "fill-red-500 text-red-500" : "text-white"}
          />
        </button>
      </div>
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-violet-500 mb-0.5">
          {artwork.category}
        </p>
        <h3 className="text-white font-semibold text-sm leading-snug line-clamp-1">
          {artwork.title}
        </h3>
        <p className="text-gray-500 text-xs mt-0.5 line-clamp-1">
          by {ownerName}
        </p>
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-xs text-amber-400">
            <Star size={12} fill="currentColor" />
            {count > 0 ? avg.toFixed(1) : "—"}
            <span className="text-gray-600">({count})</span>
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MessageCircle size={12} />
            {commentCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

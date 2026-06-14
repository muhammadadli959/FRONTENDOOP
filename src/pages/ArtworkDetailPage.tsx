import { useState, useCallback, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Flag, Trash2, Calendar, User, Heart } from "lucide-react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import Modal from "../components/Modal";
import type { Report } from "../types";

// Removed duplicate constant/entrypoint (kept the second declaration below)
const REPORT_REASONS = [
  "Inappropriate Content",
  "Spam",
  "Copyright Violation",
  "Other",
];

export default function ArtworkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, isUser, isAdmin, isGuest } = useAuth();
  const {
    artworks,
    getRatingInfo,
    getUserRating,
    submitRating,
    getComments,
    refreshComments,
    refreshRating,
    postComment,
    deleteComment,
    addReport,
    deleteArtwork,
    isArtworkSaved,
    toggleSaveArtwork,
    showToast,
  } = useApp();

  const artwork = artworks.find((a) => a.id === id);

  const [commentName, setCommentName] = useState(session?.username || "");
  const [commentText, setCommentText] = useState("");
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState(REPORT_REASONS[0]);
  const [ratingKey, setRatingKey] = useState(0);

  const comments = id ? getComments(id) : [];
  const { avg, count } = id ? getRatingInfo(id) : { avg: 0, count: 0 };

  useEffect(() => {
    if (!id) return;
    void refreshComments(id);
    void refreshRating(id);
  }, [id, refreshComments, refreshRating]);

  const userRating = id && session ? getUserRating(id, session.username) : null;
  const isSaved = id ? isArtworkSaved(id) : false;

  const handleRate = useCallback(
    (value: number) => {
      if (!id || !session) return;
      submitRating(id, session.username, value);
      setRatingKey((k) => k + 1);
      showToast("Rating submitted!");
    },
    [id, session, submitRating, showToast],
  );

  const handleSave = () => {
    if (!id) return;
    toggleSaveArtwork(id);
    showToast(isSaved ? "Removed from saved" : "Artwork saved!");
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !id || !session?.token) return;

    try {
      await postComment(id, commentText.trim(), session.token);
      setCommentText("");
      showToast("Comment posted!");
    } catch {
      showToast("Failed to post comment.");
    }
  };

  const handleReport = () => {
    if (!id || !artwork || !session) return;
    const r: Report = {
      id: `r${Date.now()}`,
      artworkId: id,
      artworkTitle: artwork.title,
      reporter: session.username,
      reason: reportReason,
      createdAt: new Date().toISOString(),
    };
    addReport(r);
    setReportModalOpen(false);
    showToast("Report submitted. Thank you!");
  };

  const handleAdminDelete = () => {
    if (!id) return;
    deleteArtwork(id, session?.token);
    showToast("Artwork deleted.");
    navigate("/");
  };

  if (!artwork) {
    return (
      <div className="min-h-screen bg-[#0a0a14] flex flex-col items-center justify-center text-gray-500">
        <p className="text-lg">Artwork not found.</p>
        <Link
          to="/"
          className="mt-3 text-violet-400 hover:text-violet-300 text-sm"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  const canInteract = isUser || isAdmin;

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Explore
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <div className="bg-[#13131f] rounded-2xl overflow-hidden border border-white/5">
              <img
                src={artwork.imageUrl}
                alt={artwork.title}
                className="w-full object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-violet-500">
                {artwork.category}
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">
                {artwork.title}
              </h1>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <User size={13} /> {artwork.ownerUsername}
                </span>
                {/* backend ArtworkResponse belum expose uploadedAt */}
                <span className="flex items-center gap-1">
                  <Calendar size={13} />

                  <span className="text-gray-600">—</span>
                </span>
              </div>
              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                {artwork.description}
              </p>
            </div>

            {canInteract && (
              <button
                onClick={handleSave}
                className={`flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors border ${
                  isSaved
                    ? "bg-red-600/20 border-red-500/40 text-red-400 hover:bg-red-600/30"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
                {isSaved ? "Saved" : "Save Artwork"}
              </button>
            )}

            <div className="bg-[#13131f] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">
                  Rating
                </span>
                <span className="text-sm text-amber-400 font-semibold">
                  {count > 0 ? `${avg.toFixed(1)} / 5` : "No ratings yet"}
                  {count > 0 && (
                    <span className="text-gray-500 font-normal ml-1">
                      ({count})
                    </span>
                  )}
                </span>
              </div>
              <StarRating value={avg} readonly size={18} />

              {canInteract && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-xs text-gray-500 mb-2">Your rating:</p>
                  <StarRating
                    key={ratingKey}
                    value={userRating ?? 0}
                    onChange={handleRate}
                    size={22}
                  />
                  {userRating && (
                    <p className="text-xs text-gray-600 mt-1">
                      You rated {userRating}/5. Click to update.
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {canInteract && (
                <button
                  onClick={() => setReportModalOpen(true)}
                  className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-amber-400 border border-white/10 hover:border-amber-400/30 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Flag size={14} />
                  Report
                </button>
              )}
              {isAdmin && (
                <button
                  onClick={handleAdminDelete}
                  className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-400/40 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Artwork
                </button>
              )}
            </div>

            {isGuest && (
              <div className="bg-violet-900/20 border border-violet-500/20 rounded-xl p-4 text-sm text-violet-300">
                <Link to="/login" className="font-semibold underline">
                  Login
                </Link>{" "}
                to rate, comment, or report this artwork.
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-white font-semibold text-lg mb-5">
            Comments{" "}
            <span className="text-gray-600 font-normal text-base">
              ({comments.length})
            </span>
          </h2>

          {canInteract && (
            <form
              onSubmit={handleComment}
              className="bg-[#13131f] border border-white/5 rounded-xl p-4 mb-6 flex flex-col gap-3"
            >
              <input
                type="text"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Your name"
                className="bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="bg-[#0d0d1a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                required
              />
              <button
                type="submit"
                className="self-end bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Post Comment
              </button>
            </form>
          )}

          <div className="flex flex-col gap-3">
            {comments.length === 0 && (
              <p className="text-gray-600 text-sm">
                No comments yet. Be the first!
              </p>
            )}
            {[...comments].reverse().map((c) => (
              <div
                key={c.id}
                className="bg-[#13131f] border border-white/5 rounded-xl p-4 flex justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-violet-400">
                      {c.username}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {c.text}
                  </p>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => {
                      deleteComment(c.id, session?.token);
                      showToast("Comment deleted.");
                    }}
                    className="text-gray-600 hover:text-red-400 transition-colors shrink-0"
                    title="Delete comment"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {reportModalOpen && (
        <Modal title="Report Artwork" onClose={() => setReportModalOpen(false)}>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-gray-400">
              Select a reason for reporting this artwork:
            </p>
            <div className="flex flex-col gap-2">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reason}
                    checked={reportReason === reason}
                    onChange={() => setReportReason(reason)}
                    className="accent-violet-500"
                  />
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                    {reason}
                  </span>
                </label>
              ))}
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setReportModalOpen(false)}
                className="text-sm text-gray-400 hover:text-white px-4 py-2 rounded-lg border border-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="text-sm bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                Submit Report
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

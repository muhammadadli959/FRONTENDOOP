import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import { useApp } from "../context/AppContext";
import ArtworkCard from "../components/ArtworkCard";

export default function HomePage() {
  const { artworks, categories, refreshArtworks } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    refreshArtworks();
    // eslint-disable-next-line
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return artworks.filter((a) => {
      const matchCat =
        selectedCategory === "All" || a.category === selectedCategory;
      const title = a.title?.toLowerCase() ?? "";
      const artistName = (a.artistName ?? a.ownerUsername).toLowerCase();
      const matchSearch = !q || title.includes(q) || artistName.includes(q);
      return matchCat && matchSearch;
    });
  }, [artworks, selectedCategory, search]);

  const allCategories = ["All", ...categories];

  return (
    <div className="min-h-screen bg-[#0a0a14]">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0d0d1f] to-[#0a0a14] border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(124,58,237,0.12)_0%,_transparent_70%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 tracking-tight">
            Discover <span className="text-violet-400">Original Art</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mb-6">
            A community gallery celebrating hand-drawn and digital creativity.
          </p>
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or artist..."
              className="w-full bg-[#13131f] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-sm px-4 py-1.5 rounded-full font-medium transition-colors border ${
                selectedCategory === cat
                  ? "bg-violet-600 border-violet-600 text-white"
                  : "bg-transparent border-white/10 text-gray-400 hover:border-violet-500/50 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-600">
            <p className="text-lg">No artworks found.</p>
            <p className="text-sm mt-1">
              Try adjusting your search or category.
            </p>
          </div>
        ) : (
          /* Masonry-style grid using CSS columns */
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-0">
            {filtered.map((artwork) => (
              <div key={artwork.id} className="break-inside-avoid mb-4">
                <ArtworkCard artwork={artwork} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

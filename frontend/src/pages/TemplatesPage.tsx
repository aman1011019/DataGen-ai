import { useState } from "react";
import { Link } from "react-router-dom";
import { PREBUILT_TEMPLATES } from "../data/templates";
import { Sparkles, ArrowRight, LayoutTemplate, Search, Layers, Check } from "lucide-react";

export const TemplatesPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("All");

  const filteredTemplates = PREBUILT_TEMPLATES.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === "All" || t.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const allTags = ["All", "Classification", "Regression", "Anomaly", "Time Series", "Healthcare", "Finance", "Retail", "IoT", "Logistics", "Real Estate"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <LayoutTemplate className="w-6 h-6 text-primary" /> Schema Templates Library
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Jumpstart your dataset generation with pre-engineered production schemas across enterprise domains.
        </p>
      </div>

      {/* Search & Tag Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedTag === tag
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="p-6 rounded-2xl bg-card border border-border space-y-4 hover:border-primary/40 transition-all shadow-sm flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{tmpl.category}</span>
                <span className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded-md">
                  {tmpl.fields.length} fields
                </span>
              </div>

              <h3 className="text-base font-bold text-foreground">{tmpl.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{tmpl.description}</p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {tmpl.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-secondary text-[10px] text-muted-foreground font-medium">
                    #{tag}
                  </span>
                ))}
              </div>

              <Link
                to={`/dashboard/generate?template=${tmpl.id}`}
                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Use Template ({tmpl.recommendedSize.toLocaleString()} rows)</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplatesPage;

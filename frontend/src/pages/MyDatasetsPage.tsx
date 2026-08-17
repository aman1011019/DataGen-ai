import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Database,
  Search,
  Sparkles,
  Download,
  MoreVertical,
  Copy,
  Trash2,
  Eye,
  Plus
} from "lucide-react";
import { getSavedDatasets, deleteDataset, duplicateDataset } from "../services/datasetStorageService";
import { GeneratedDataset, DatasetCategory } from "../types/dataset";
import { exportToCSV, exportToJSON } from "../services/exportService";
import { toast } from "sonner";

export const MyDatasetsPage = () => {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState<GeneratedDataset[]>(getSavedDatasets());
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const refreshDatasets = () => {
    setDatasets(getSavedDatasets());
  };

  useEffect(() => {
    refreshDatasets();
    const handleUpdate = () => refreshDatasets();
    window.addEventListener("datagen_dataset_created", handleUpdate);
    window.addEventListener("datagen_auth_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("datagen_dataset_created", handleUpdate);
      window.removeEventListener("datagen_auth_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const filteredDatasets = useMemo(() => {
    return datasets.filter((d) => {
      const matchesSearch =
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = categoryFilter === "All" || d.category === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [datasets, searchTerm, categoryFilter]);

  const handleDelete = (id: string, name: string) => {
    deleteDataset(id);
    toast.success(`Deleted dataset "${name}".`);
    refreshDatasets();
    setActiveMenuId(null);
  };

  const handleDuplicate = (id: string) => {
    const dup = duplicateDataset(id);
    if (dup) {
      toast.success(`Duplicated dataset as "${dup.name}".`);
      refreshDatasets();
    }
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Datasets</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your generated synthetic datasets, export artifacts, and duplicate schemas.
          </p>
        </div>

        <Link
          to="/dashboard/generate"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Dataset</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search datasets by name..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-muted-foreground">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-secondary border border-border text-foreground text-xs"
          >
            <option value="All">All Categories</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
            <option value="E-commerce">E-commerce</option>
            <option value="Education">Education</option>
            <option value="HR">HR</option>
            <option value="Marketing">Marketing</option>
            <option value="Cybersecurity">Cybersecurity</option>
            <option value="IoT">IoT</option>
          </select>
        </div>
      </div>

      {/* Dataset Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-secondary/40 text-muted-foreground font-semibold">
                <th className="py-3.5 px-4">Dataset Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Record Count</th>
                <th className="py-3.5 px-4">Fields</th>
                <th className="py-3.5 px-4">Quality Score</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredDatasets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground space-y-3">
                    <Database className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                    <p className="font-medium text-foreground">No datasets found.</p>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                      You haven't generated any datasets in this category yet. Click below to create your first dataset.
                    </p>
                    <Link
                      to="/dashboard/generate"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-all mt-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Create Dataset
                    </Link>
                  </td>
                </tr>
              ) : (
                filteredDatasets.map((dataset) => (
                  <tr key={dataset.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/dashboard/datasets/${dataset.id}`}
                        className="font-bold text-foreground hover:text-primary transition-colors block"
                      >
                        {dataset.name}
                      </Link>
                      <span className="text-[10px] text-muted-foreground truncate max-w-xs block">
                        {dataset.description}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full bg-secondary border border-border text-[11px] font-medium">
                        {dataset.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {dataset.recordCount.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      {dataset.fieldCount} fields
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success font-bold text-[10px] border border-success/20">
                        {dataset.qualityScore}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                      {new Date(dataset.createdAt).toLocaleDateString()}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/dashboard/datasets/${dataset.id}`)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          title="View Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => exportToCSV(dataset)}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          title="Download CSV"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        <div className="relative">
                          <button
                            onClick={() => setActiveMenuId(activeMenuId === dataset.id ? null : dataset.id)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === dataset.id && (
                            <div className="absolute right-0 mt-1 w-44 rounded-xl bg-card border border-border shadow-xl p-1.5 z-40 space-y-1 text-left">
                              <button
                                onClick={() => handleDuplicate(dataset.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                              >
                                <Copy className="w-3.5 h-3.5" /> Duplicate
                              </button>
                              <button
                                onClick={() => handleDelete(dataset.id, dataset.name)}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyDatasetsPage;

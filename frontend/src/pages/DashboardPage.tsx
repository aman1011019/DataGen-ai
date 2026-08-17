import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Database,
  Layers,
  Download,
  Plus,
  ArrowRight,
  MoreVertical,
  Trash2,
  Copy,
  Eye,
  FileText,
  Clock,
  ShieldCheck,
  Zap,
  CreditCard,
  AlertCircle
} from "lucide-react";
import { getStoredAuthState } from "../services/authService";
import { getSavedDatasets, getDashboardStats, deleteDataset, duplicateDataset } from "../services/datasetStorageService";
import { GeneratedDataset } from "../types/dataset";
import { PREBUILT_TEMPLATES } from "../data/templates";
import { exportToCSV, exportToJSON } from "../services/exportService";
import { useSubscription } from "../hooks/useSubscription";
import SubscriptionBadge from "../components/billing/SubscriptionBadge";
import { toast } from "sonner";

export const DashboardPage = () => {
  const navigate = useNavigate();
  const user = getStoredAuthState().user;
  const {
    planConfig,
    subscription,
    limits,
    usage,
    isNormal,
    setIsUpgradeModalOpen,
    setUpgradeModalReason,
  } = useSubscription();
  const [stats, setStats] = useState(getDashboardStats());
  const [datasets, setDatasets] = useState<GeneratedDataset[]>(getSavedDatasets());
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const refreshData = () => {
    setDatasets(getSavedDatasets());
    setStats(getDashboardStats());
  };

  useEffect(() => {
    refreshData();
    const handleUpdate = () => refreshData();
    window.addEventListener("datagen_auth_changed", handleUpdate);
    window.addEventListener("datagen_dataset_created", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("datagen_auth_changed", handleUpdate);
      window.removeEventListener("datagen_dataset_created", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const handleDelete = (id: string, name: string) => {
    deleteDataset(id);
    toast.success(`Deleted dataset "${name}".`);
    refreshData();
    setActiveMenuId(null);
  };

  const handleDuplicate = (id: string) => {
    const dup = duplicateDataset(id);
    if (dup) {
      toast.success(`Duplicated dataset as "${dup.name}".`);
      refreshData();
    }
    setActiveMenuId(null);
  };

  return (
    <div className="space-y-8">
      {/* Header & Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Good day, {user?.name || "Alex"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage your AI-powered synthetic datasets and schemas.
          </p>
        </div>

        <Link
          to="/dashboard/generate"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all hover:scale-[1.02]"
        >
          <Sparkles className="w-4 h-4" />
          <span>Create New Dataset</span>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Datasets Created</span>
            <Database className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{stats.datasetsCreated}</p>
          <span className="text-[11px] text-success font-medium">Active Schemas</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Records Generated</span>
            <Sparkles className="w-4 h-4 text-accent" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{stats.recordsGenerated.toLocaleString()}</p>
          <span className="text-[11px] text-muted-foreground">Synthetic Rows</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Fields Configured</span>
            <Layers className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{stats.fieldsGenerated}</p>
          <span className="text-[11px] text-muted-foreground">Across Categories</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-border space-y-2 hover:border-primary/40 transition-all shadow-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Total Exports</span>
            <Download className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{stats.exportsCount}</p>
          <span className="text-[11px] text-success font-medium">CSV & JSON Downloads</span>
        </div>
      </div>

      {/* Recent Datasets Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Recent Datasets</h2>
          <Link to="/dashboard/datasets" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Dataset Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Records</th>
                  <th className="py-3 px-4">Fields</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {datasets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted-foreground">
                      No datasets created yet. Click "Create New Dataset" to begin.
                    </td>
                  </tr>
                ) : (
                  datasets.slice(0, 5).map((dataset) => (
                    <tr key={dataset.id} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-3.5 px-4">
                        <Link to={`/dashboard/datasets/${dataset.id}`} className="font-semibold text-foreground hover:text-primary transition-colors block">
                          {dataset.name}
                        </Link>
                        <span className="text-[10px] text-muted-foreground truncate max-w-xs block">{dataset.description}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-secondary border border-border text-[11px] font-medium">
                          {dataset.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs font-medium">
                        {dataset.recordCount.toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-xs text-muted-foreground">
                        {dataset.fieldCount} fields
                      </td>

                      <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                        {new Date(dataset.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-success/10 text-success border border-success/20 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                          {dataset.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right relative">
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

      {/* Ready Domain Templates */}
      <div className="space-y-4 pt-4">
        <h2 className="text-lg font-bold text-foreground">Pre-Engineered Schema Templates</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PREBUILT_TEMPLATES.slice(0, 4).map((tmpl) => (
            <div key={tmpl.id} className="p-4 rounded-2xl bg-card border border-border space-y-3 hover:border-primary/40 transition-all flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">{tmpl.category}</span>
                <h3 className="text-sm font-bold text-foreground mt-0.5">{tmpl.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{tmpl.description}</p>
              </div>

              <Link
                to={`/dashboard/generate?template=${tmpl.id}`}
                className="flex items-center justify-between text-xs font-semibold text-primary hover:underline pt-2 border-t border-border/50"
              >
                <span>Use Template</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
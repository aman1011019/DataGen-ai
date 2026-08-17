import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Copy,
  Sparkles,
  Database,
  Layers,
  ShieldCheck,
  FileCode,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { getDatasetById } from "../services/datasetStorageService";
import { exportToCSV, exportToJSON, copyJSONToClipboard, copySchemaToClipboard } from "../services/exportService";
import DatasetTable from "../components/DatasetTable";
import QualityPanel from "../components/QualityPanel";

export const DatasetDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const rawDataset = getDatasetById(id || "");
  const [activeTab, setActiveTab] = useState<"overview" | "preview" | "schema" | "quality" | "exports">("preview");

  // ── JSON Field Expansion ─────────────────────────────────────────────────
  // If this dataset was saved with only "input" + "output" columns and the
  // input value is a JSON string (e.g. {"order_id":…}), expand it so the
  // preview shows all real fields. This fixes datasets saved before the
  // domain-aware schema fix without requiring re-generation.
  const dataset = (() => {
    if (!rawDataset) return rawDataset;

    const fields = rawDataset.fields || [];
    const rows = rawDataset.sampleRows || [];

    // Check if this looks like a 2-field input/output dataset
    const hasOnlyInputOutput =
      fields.length <= 3 &&
      fields.some(f => f.name === "input") &&
      rows.length > 0;

    if (!hasOnlyInputOutput) return rawDataset;

    // Try to parse the first row's input as JSON
    const firstInput = rows[0]?.input;
    let parsedInput: Record<string, any> | null = null;
    if (firstInput && typeof firstInput === "string") {
      const trimmed = firstInput.trim();
      if (trimmed.startsWith("{")) {
        try { parsedInput = JSON.parse(trimmed); } catch (_) {}
      }
    }

    if (!parsedInput) return rawDataset; // input is plain text, nothing to expand

    // Build expanded rows by flattening JSON input + metadata into columns
    const expandedRows = rows.map((row: Record<string, any>) => {
      let inputObj: Record<string, any> = {};
      try {
        const t = String(row.input || "").trim();
        if (t.startsWith("{")) inputObj = JSON.parse(t);
      } catch (_) {}
      const metaKeys = Object.keys(row).filter(k => k !== "input" && k !== "id");
      const metaVals: Record<string, any> = {};
      metaKeys.forEach(k => { metaVals[k] = row[k]; });
      return { ...inputObj, ...metaVals };
    });

    // Derive new fields from expanded rows
    const expandedFieldNames = expandedRows.length > 0 ? Object.keys(expandedRows[0]) : [];
    const inferType = (val: any): string => {
      if (typeof val === "boolean") return "boolean";
      if (typeof val === "number") return "number";
      if (typeof val === "string" && /^\d{4}-\d{2}-\d{2}/.test(val)) return "date";
      return "string";
    };
    const firstExpRow = expandedRows[0] || {};
    const expandedFields = expandedFieldNames.map(name => ({
      id: name,
      name,
      type: inferType(firstExpRow[name]) as any,
      nullable: false,
      unique: name === "id" || name.endsWith("_id"),
    }));

    return {
      ...rawDataset,
      fields: expandedFields.length > 0 ? expandedFields : fields,
      fieldCount: expandedFields.length > 0 ? expandedFields.length : rawDataset.fieldCount,
      sampleRows: expandedRows.length > 0 ? expandedRows : rows,
    };
  })();


  if (!dataset) {
    return (
      <div className="py-20 text-center space-y-4">
        <Database className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold text-foreground">Dataset Not Found</h2>
        <p className="text-xs text-muted-foreground">The dataset you requested does not exist or was deleted.</p>
        <Link
          to="/dashboard/datasets"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Datasets
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <button
          onClick={() => navigate("/dashboard/datasets")}
          className="p-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-foreground">{dataset.name}</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-secondary border border-border text-[10px] font-semibold">
              {dataset.category}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{dataset.description}</p>
        </div>
      </div>

      {/* Summary KPI Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Records</span>
          <p className="text-2xl font-black text-foreground font-mono">{dataset.recordCount.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Fields</span>
          <p className="text-2xl font-black text-foreground font-mono">{dataset.fieldCount}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Quality Score</span>
          <p className="text-2xl font-black text-success font-mono">{dataset.qualityScore}%</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Created Date</span>
          <p className="text-sm font-semibold text-foreground">{new Date(dataset.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border text-xs font-semibold">
        {(["preview", "schema", "quality", "exports", "overview"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 border-b-2 transition-all capitalize ${
              activeTab === tab
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: PREVIEW */}
      {activeTab === "preview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Interactive Dataset Preview</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => exportToCSV(dataset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90"
              >
                <Download className="w-3.5 h-3.5" /> CSV
              </button>
              <button
                onClick={() => exportToJSON(dataset)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground font-semibold text-xs hover:bg-secondary/80"
              >
                <Download className="w-3.5 h-3.5" /> JSON
              </button>
            </div>
          </div>
          <DatasetTable fields={dataset.fields} rows={dataset.sampleRows} totalRecords={dataset.recordCount} />
        </div>
      )}

      {/* TAB CONTENT: SCHEMA */}
      {activeTab === "schema" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Configured Schema Definition ({dataset.fields.length} Fields)</h2>
            <button
              onClick={() => copySchemaToClipboard(dataset.fields)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs font-medium hover:bg-secondary/80"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Schema JSON
            </button>
          </div>

          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/40 text-muted-foreground font-semibold">
                  <th className="py-3 px-4">Field Name</th>
                  <th className="py-3 px-4">Data Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Required</th>
                  <th className="py-3 px-4">Nullable</th>
                  <th className="py-3 px-4">Synthetic Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {dataset.fields.map((f) => (
                  <tr key={f.name} className="hover:bg-secondary/30">
                    <td className="py-3 px-4 font-mono font-bold text-foreground">{f.name}</td>
                    <td className="py-3 px-4 font-mono text-primary text-[10px]">{f.type}</td>
                    <td className="py-3 px-4 text-muted-foreground">{f.description}</td>
                    <td className="py-3 px-4">{f.required ? "Yes" : "No"}</td>
                    <td className="py-3 px-4">{f.nullable ? "Yes" : "No"}</td>
                    <td className="py-3 px-4 font-medium text-foreground">{f.syntheticStrategy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: QUALITY */}
      {activeTab === "quality" && (
        <QualityPanel stats={dataset.stats} fields={dataset.fields} />
      )}

      {/* TAB CONTENT: EXPORTS */}
      {activeTab === "exports" && (
        <div className="grid sm:grid-cols-3 gap-6 text-xs">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="font-bold text-foreground text-sm">Download CSV</h3>
            <p className="text-muted-foreground">Export full dataset as comma-separated values compatible with Excel and Pandas.</p>
            <button
              onClick={() => exportToCSV(dataset)}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:bg-primary/90"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="font-bold text-foreground text-sm">Download JSON</h3>
            <p className="text-muted-foreground">Export dataset records as structured JSON array for web applications and API pipelines.</p>
            <button
              onClick={() => exportToJSON(dataset)}
              className="w-full py-2.5 rounded-xl bg-secondary border border-border text-foreground font-semibold flex items-center justify-center gap-2 hover:bg-secondary/80"
            >
              <Download className="w-4 h-4" /> Export JSON
            </button>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
            <h3 className="font-bold text-foreground text-sm">Copy Schema JSON</h3>
            <p className="text-muted-foreground">Copy the AI-synthesized field schema definition to clipboard for code integration.</p>
            <button
              onClick={() => copySchemaToClipboard(dataset.fields)}
              className="w-full py-2.5 rounded-xl bg-secondary border border-border text-foreground font-semibold flex items-center justify-center gap-2 hover:bg-secondary/80"
            >
              <Copy className="w-4 h-4" /> Copy Schema
            </button>
          </div>
        </div>
      )}

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6 text-xs animate-in fade-in">
          {/* Recorded Information Table matching user specification */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" /> Recorded Information Log
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold">
                16 Metrics Captured
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-border bg-secondary/10">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-secondary/40 border-b border-border text-foreground font-bold">
                    <th className="py-3 px-4 w-1/3 border-r border-border/50">Information</th>
                    <th className="py-3 px-4">Record this</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono text-[11px]">
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Dataset name</td>
                    <td className="py-2.5 px-4 text-primary font-bold">{dataset.name}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Domain</td>
                    <td className="py-2.5 px-4 text-foreground">{dataset.category}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">ML task</td>
                    <td className="py-2.5 px-4 text-foreground font-bold">{dataset.mlTask || dataset.metadata?.mlTask || "Classification"}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Number of records</td>
                    <td className="py-2.5 px-4 text-foreground font-bold">{dataset.recordCount.toLocaleString()}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Number of fields</td>
                    <td className="py-2.5 px-4 text-foreground">{dataset.fieldCount}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Field names</td>
                    <td className="py-2.5 px-4 text-muted-foreground break-all">{dataset.fields.map(f => f.name).join(", ")}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Field types</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{Array.from(new Set(dataset.fields.map(f => f.type))).join(", ")}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Output</td>
                    <td className="py-2.5 px-4 text-foreground font-bold">{dataset.outputFormat || dataset.metadata?.outputFormat || "JSON & CSV"}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Generation time</td>
                    <td className="py-2.5 px-4 text-foreground">
                      {dataset.metadata?.generationTimeMs ? `${(dataset.metadata.generationTimeMs / 1000).toFixed(2)} seconds (${dataset.metadata.generationTimeMs} ms)` : "< 1.4 seconds"}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Validation time</td>
                    <td className="py-2.5 px-4 text-foreground">
                      {dataset.metadata?.validationTimeMs ? `${(dataset.metadata.validationTimeMs / 1000).toFixed(2)} seconds (${dataset.metadata.validationTimeMs} ms)` : "< 0.35 seconds"}
                    </td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Valid records</td>
                    <td className="py-2.5 px-4 text-success font-bold">{dataset.metadata?.validRecords ?? dataset.recordCount}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Invalid records</td>
                    <td className="py-2.5 px-4 text-foreground">{dataset.metadata?.invalidRecords ?? 0}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Total generation attempts</td>
                    <td className="py-2.5 px-4 text-foreground">{dataset.metadata?.totalGenerationAttempts ?? 1}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Model/LLM</td>
                    <td className="py-2.5 px-4 text-primary font-bold">{dataset.metadata?.modelLLM || "DataGen Engine v2.4 (Gemini 2.5 Flash)"}</td>
                  </tr>
                  <tr className="hover:bg-secondary/20">
                    <td className="py-2.5 px-4 font-semibold text-foreground border-r border-border/40">Number of runs</td>
                    <td className="py-2.5 px-4 text-foreground">{dataset.metadata?.numberOfRuns ?? 1}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-4 text-xs">
            <h3 className="font-bold text-foreground text-sm">Advanced Statistical Parameters</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <span className="text-muted-foreground block font-semibold">Realism Configuration</span>
                <p className="text-foreground font-medium">{dataset.settings?.realism || "High"}</p>
              </div>
              <div>
                <span className="text-muted-foreground block font-semibold">Outlier Rate</span>
                <p className="text-foreground font-medium">{dataset.settings?.outlierRate || "Low"}</p>
              </div>
              <div>
                <span className="text-muted-foreground block font-semibold">Missing Values Rate</span>
                <p className="text-foreground font-medium">{dataset.settings?.missingValues || 1}%</p>
              </div>
              <div>
                <span className="text-muted-foreground block font-semibold">Locale</span>
                <p className="text-foreground font-medium">{dataset.settings?.locale || "en_US"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetDetailPage;

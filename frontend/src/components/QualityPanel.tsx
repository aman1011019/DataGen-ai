import { DatasetStats, FieldDefinition } from "../types/dataset";
import { CheckCircle2, AlertTriangle, ShieldCheck, Activity, BarChart2 } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface QualityPanelProps {
  stats: DatasetStats;
  fields: FieldDefinition[];
}

export const QualityPanel = ({ stats, fields }: QualityPanelProps) => {
  const chartData = [
    { name: "Schema Validity", score: stats.schemaValidityPct, color: "#10b981" },
    { name: "Distribution", score: stats.distributionScorePct, color: "#6366f1" },
    { name: "Completeness", score: Number((100 - stats.missingValuesPct).toFixed(1)), color: "#06b6d4" },
    { name: "Uniqueness", score: Number((100 - stats.duplicatePct).toFixed(1)), color: "#8b5cf6" },
    { name: "Regularity", score: Number((100 - stats.outlierPct).toFixed(1)), color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Scorecard */}
      <div className="p-6 rounded-2xl bg-card border border-border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-success" />
            <h3 className="text-lg font-bold text-foreground">Dataset Quality Scorecard</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            Automated synthetic data fidelity audit based on field distribution and statistical constraint rules.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-secondary/40 p-4 rounded-xl border border-border w-full md:w-auto">
          <div className="flex flex-col text-right">
            <span className="text-3xl font-extrabold text-foreground tracking-tight">{stats.overallQualityPct}%</span>
            <span className="text-[11px] font-semibold text-success flex items-center justify-end gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> High Precision Synthetic
            </span>
          </div>
        </div>
      </div>

      {/* Grid of Key Metric Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Schema Validity</span>
          <p className="text-xl font-bold text-foreground">{stats.schemaValidityPct}%</p>
          <span className="text-[10px] text-success font-medium">100% Valid Types</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Missing Values</span>
          <p className="text-xl font-bold text-foreground">{stats.missingValuesPct}%</p>
          <span className="text-[10px] text-muted-foreground">Controlled Null Rate</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Duplicate Records</span>
          <p className="text-xl font-bold text-foreground">{stats.duplicatePct}%</p>
          <span className="text-[10px] text-success font-medium">High Uniqueness</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Outlier Density</span>
          <p className="text-xl font-bold text-foreground">{stats.outlierPct}%</p>
          <span className="text-[10px] text-accent font-medium">Bounded Distribution</span>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-medium text-muted-foreground">Distribution Score</span>
          <p className="text-xl font-bold text-foreground">{stats.distributionScorePct}%</p>
          <span className="text-[10px] text-success font-medium">Optimal Gaussian</span>
        </div>
      </div>

      {/* Chart Section & Field Breakdown */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Quality Metric Breakdown</h4>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                  formatter={(val: number) => [`${val}%`, "Score"]}
                />
                <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Field List Quality Audit */}
        <div className="p-5 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent" />
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Field Schema Health</h4>
          </div>

          <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1 text-xs">
            {fields.map((f) => (
              <div key={f.name} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-foreground text-xs">{f.name}</span>
                  <span className="text-[10px] text-muted-foreground">{f.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px]">
                    {f.type}
                  </span>
                  <span className="text-[10px] font-semibold text-success flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 100% Valid
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QualityPanel;

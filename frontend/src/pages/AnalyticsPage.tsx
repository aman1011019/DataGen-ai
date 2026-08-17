import { useState } from "react";
import { BarChart3, Database, Sparkles, TrendingUp, ShieldCheck, Download } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from "recharts";
import { getDashboardStats, getSavedDatasets } from "../services/datasetStorageService";

export const AnalyticsPage = () => {
  const stats = getDashboardStats();
  const datasets = getSavedDatasets();

  const activityData = [
    { month: "Jan", records: 24000, datasets: 4 },
    { month: "Feb", records: 48000, datasets: 7 },
    { month: "Mar", records: 85000, datasets: 11 },
    { month: "Apr", records: 120000, datasets: 15 },
    { month: "May", records: 155000, datasets: 18 },
    { month: "Jun", records: 185000, datasets: 22 },
  ];

  const categoryBreakdown = [
    { name: "Finance", count: 8, color: "#6366f1" },
    { name: "Healthcare", count: 6, color: "#10b981" },
    { name: "E-commerce", count: 4, color: "#06b6d4" },
    { name: "IoT", count: 3, color: "#8b5cf6" },
    { name: "HR", count: 2, color: "#f59e0b" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Synthetic Data Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Monitor record synthesis volume, domain coverage, and overall statistical fidelity metrics.
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Total Generated Records</span>
          <p className="text-2xl font-black text-foreground font-mono">{stats.recordsGenerated.toLocaleString()}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Avg Quality Score</span>
          <p className="text-2xl font-black text-success font-mono">{stats.avgQualityScore}%</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Active Schemas</span>
          <p className="text-2xl font-black text-foreground font-mono">{stats.datasetsCreated}</p>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground">Total Exports</span>
          <p className="text-2xl font-black text-accent font-mono">{stats.exportsCount}</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Record Generation Growth Area Chart */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Cumulative Record Synthesis Volume</h3>
            <span className="text-[10px] font-semibold text-success bg-success/10 px-2.5 py-0.5 rounded-full">
              +42% MoM Growth
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRecords" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                  formatter={(val: number) => [val.toLocaleString(), "Records"]}
                />
                <Area type="monotone" dataKey="records" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRecords)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Domain Distribution Bar Chart */}
        <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
          <h3 className="text-sm font-bold text-foreground">Domain Category Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", borderColor: "#334155", borderRadius: "12px", color: "#f8fafc" }}
                  formatter={(val: number) => [val, "Datasets"]}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

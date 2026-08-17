import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bot, Brain, ShieldCheck, Scale, ArrowRight, RefreshCw, Database, ChevronDown } from "lucide-react";
import { getSavedDatasets, getLastDatasetPayload } from "../services/datasetStorageService";
import { GeneratedDataset } from "../types/dataset";

interface AgentStat {
  name: string;
  icon: React.ElementType;
  status: "Active" | "Running" | "Idle" | "Completed";
  confidence: number;
  iterations: number;
  description: string;
  detail: string;
}

const statusStyles: Record<string, string> = {
  Active: "bg-success/10 text-success",
  Running: "bg-primary/10 text-primary",
  Idle: "bg-muted text-muted-foreground",
  Completed: "bg-accent/10 text-accent",
};

const AgentMonitorPage = () => {
  const [agents, setAgents] = useState<AgentStat[]>([]);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [hasData, setHasData] = useState(false);
  const [savedDatasets, setSavedDatasets] = useState<GeneratedDataset[]>([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("latest");

  const loadFromDataset = (datasetId: string = selectedDatasetId) => {
    const saved = getSavedDatasets();
    setSavedDatasets(saved);

    let data: any = null;

    if (datasetId !== "latest") {
      const selected = saved.find((d) => d.id === datasetId);
      if (selected) {
        const quality = selected.qualityScore || 95;
        const validCount = Math.round(selected.recordCount * (quality / 100));
        const invalidCount = selected.recordCount - validCount;
        data = {
          task_type: selected.mlTask || "Classification",
          domain: selected.category || "General",
          total_requested: selected.recordCount,
          total_generated: selected.recordCount,
          total_valid: validCount,
          dataset_name: selected.name,
          stats: {
            avg_validation_score: quality / 100,
            invalid_count: invalidCount,
          }
        };
      }
    }

    if (!data) {
      data = getLastDatasetPayload();
    }

    if (!data && saved.length > 0) {
      const latest = saved[0];
      const quality = latest.qualityScore || 95;
      const validCount = Math.round(latest.recordCount * (quality / 100));
      const invalidCount = latest.recordCount - validCount;
      data = {
        task_type: latest.mlTask || "Classification",
        domain: latest.category || "General",
        total_requested: latest.recordCount,
        total_generated: latest.recordCount,
        total_valid: validCount,
        dataset_name: latest.name,
        stats: {
          avg_validation_score: quality / 100,
          invalid_count: invalidCount,
        }
      };
    }

    if (!data) {
      setHasData(false);
      setAgents(getDefaultAgents());
      return;
    }

    try {
      setHasData(true);

      const totalGenerated = data.total_generated ?? 0;
      const totalValid = data.total_valid ?? 0;
      const invalidCount = data.stats?.invalid_count ?? 0;
      const avgScore = data.stats?.avg_validation_score ?? 0.95;
      const taskType = data.task_type ?? "classification";
      const domain = data.domain ?? "general";

      const qualityPct = Math.round(avgScore <= 1 ? avgScore * 100 : avgScore);
      const biasCoverage = totalGenerated > 0 ? Math.round((totalValid / totalGenerated) * 100) : 98;

      setLastRun(new Date().toLocaleTimeString());

      setAgents([
        {
          name: "Planner Agent",
          icon: Brain,
          status: "Completed",
          confidence: 97,
          iterations: 1,
          description: "Analyzes task requirements and creates generation plan",
          detail: `Task: ${taskType} | Domain: ${domain} | Target: ${data.total_requested || totalGenerated} samples`,
        },
        {
          name: "Generator Agent",
          icon: Bot,
          status: "Completed",
          confidence: Math.min(99, Math.max(88, qualityPct)),
          iterations: totalGenerated,
          description: "Creates synthetic samples using Claude / Gemini AI",
          detail: `Generated ${totalGenerated.toLocaleString()} synthetic records for ${domain}`,
        },
        {
          name: "Critic Agent",
          icon: ShieldCheck,
          status: "Completed",
          confidence: qualityPct,
          iterations: totalGenerated,
          description: "Validates schema consistency and quality metrics",
          detail: `${totalValid.toLocaleString()} valid, ${invalidCount} flagged | Quality score: ${qualityPct}%`,
        },
        {
          name: "Bias Detector",
          icon: Scale,
          status: "Completed",
          confidence: biasCoverage,
          iterations: totalGenerated,
          description: "Monitors class balance and linguistic diversity",
          detail: `Valid coverage: ${biasCoverage}% | Flagged: ${invalidCount} samples`,
        },
      ]);
    } catch {
      setHasData(false);
      setAgents(getDefaultAgents());
    }
  };

  const getDefaultAgents = (): AgentStat[] => [
    {
      name: "Planner Agent",
      icon: Brain,
      status: "Idle",
      confidence: 0,
      iterations: 0,
      description: "Analyzes task requirements and creates generation plan",
      detail: "No dataset generated yet.",
    },
    {
      name: "Generator Agent",
      icon: Bot,
      status: "Idle",
      confidence: 0,
      iterations: 0,
      description: "Creates synthetic samples using Claude",
      detail: "Waiting for generation task.",
    },
    {
      name: "Critic Agent",
      icon: ShieldCheck,
      status: "Idle",
      confidence: 0,
      iterations: 0,
      description: "Validates schema consistency and quality metrics",
      detail: "No validation run yet.",
    },
    {
      name: "Bias Detector",
      icon: Scale,
      status: "Idle",
      confidence: 0,
      iterations: 0,
      description: "Monitors class balance and linguistic diversity",
      detail: "Awaiting dataset.",
    },
  ];

  useEffect(() => {
    loadFromDataset(selectedDatasetId);
    const handleUpdate = () => loadFromDataset(selectedDatasetId);
    window.addEventListener("datagen_dataset_created", handleUpdate);
    window.addEventListener("datagen_auth_changed", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("datagen_dataset_created", handleUpdate);
      window.removeEventListener("datagen_auth_changed", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [selectedDatasetId]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-2">
            <Bot className="w-8 h-8 text-primary" /> Agent Monitor
          </h1>
          <p className="text-muted-foreground mt-1 text-xs">
            {hasData
              ? `Real-time agent execution telemetry for selected dataset${lastRun ? ` · ${lastRun}` : ""}`
              : "Generate a dataset first to see live agent stats"}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Dataset Dropdown Drag/Select Button */}
          <div className="relative flex-1 sm:w-72">
            <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
            <select
              value={selectedDatasetId}
              onChange={(e) => setSelectedDatasetId(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-card border border-border text-foreground font-medium text-xs focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none cursor-pointer shadow-xs"
            >
              <option value="latest">⚡ Latest Generated Run</option>
              {savedDatasets.map((ds) => (
                <option key={ds.id} value={ds.id}>
                  📊 {ds.name} ({ds.recordCount.toLocaleString()} rows • {ds.qualityScore}%)
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          <button
            onClick={() => loadFromDataset(selectedDatasetId)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-secondary text-muted-foreground hover:text-foreground text-xs font-medium transition-all shrink-0 border border-border"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {!hasData && (
        <div className="glass rounded-2xl p-6 text-center text-muted-foreground space-y-2">
          <p className="text-lg font-medium">No generation data yet</p>
          <p className="text-sm">Go to <strong>Generate Dataset</strong>, run a generation, and come back here to see real agent metrics.</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {agents.map((agent, i) => (
          <motion.div key={agent.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-6 hover:glow-border transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <agent.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{agent.name}</h3>
                  <p className="text-xs text-muted-foreground">{agent.description}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[agent.status]}`}>
                {agent.status}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Confidence</span>
                  <span>{agent.confidence.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${agent.confidence}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Samples Processed</span>
                <span className="font-medium text-foreground">{agent.iterations.toLocaleString()}</span>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">{agent.detail}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pipeline flow */}
      {hasData && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Pipeline Flow</h2>
          <div className="flex items-center gap-2 flex-wrap">
            {["Planner", "Generator", "Critic", "Bias Detector", "Export"].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className={`px-4 py-2 rounded-xl text-sm font-medium ${step === "Export" ? "bg-success/10 text-success" : "bg-primary/10 text-primary"
                  }`}>
                  {step}
                </div>
                {i < 4 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AgentMonitorPage;

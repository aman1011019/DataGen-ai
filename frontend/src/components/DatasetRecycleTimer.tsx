import React, { useState, useEffect } from "react";
import { Clock, Sparkles, Key, AlertCircle, CheckCircle } from "lucide-react";
import { 
  getDefaultApiUsage, 
  formatCountdownMs, 
  hasCustomApiKey, 
  DEFAULT_FREE_DATASETS_LIMIT 
} from "../services/defaultApiKeyService";
import { Link } from "react-router-dom";

export const DatasetRecycleTimer: React.FC<{ className?: string }> = ({ className = "" }) => {
  const [isCustomKeyActive, setIsCustomKeyActive] = useState<boolean>(hasCustomApiKey());
  const [usage, setUsage] = useState(getDefaultApiUsage());
  const [timerText, setTimerText] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const customActive = hasCustomApiKey();
      setIsCustomKeyActive(customActive);
      const currentUsage = getDefaultApiUsage();
      setUsage(currentUsage);
      setTimerText(formatCountdownMs(currentUsage.msRemaining));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  if (isCustomKeyActive) {
    return (
      <div className={`p-4 rounded-2xl bg-success/10 border border-success/30 text-foreground flex items-center justify-between gap-4 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-success/20 text-success">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-foreground">Custom API Key Active</h4>
            <p className="text-[11px] text-muted-foreground">
              Unlimited dataset generations enabled with your personal API key. No cooldown or dataset count limit.
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full bg-success/20 text-success border border-success/30 text-[10px] font-bold shrink-0">
          Unlimited Access
        </span>
      </div>
    );
  }

  const isLimitReached = usage.count >= DEFAULT_FREE_DATASETS_LIMIT;
  const pct = Math.min(100, Math.round((usage.count / DEFAULT_FREE_DATASETS_LIMIT) * 100));

  return (
    <div className={`p-5 rounded-2xl bg-card border border-border shadow-xs space-y-3.5 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl border ${isLimitReached ? "bg-amber-500/10 border-amber-500/30 text-amber-500" : "bg-primary/10 border-primary/20 text-primary"}`}>
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Default API Key Free Tier</h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${isLimitReached ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-primary/10 text-primary border-primary/20"}`}>
                {usage.count} / {DEFAULT_FREE_DATASETS_LIMIT} Free Datasets Used
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isLimitReached
                ? "You have reached the 3 free datasets limit. Wait for the recycle reset or add your own key."
                : `You can generate up to ${DEFAULT_FREE_DATASETS_LIMIT} free datasets using the default API key.`}
            </p>
          </div>
        </div>

        {/* Live Recycling Countdown Timer */}
        {usage.msRemaining > 0 && (
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-secondary/80 border border-border shrink-0 font-mono text-xs">
            <Clock className="w-4 h-4 text-primary animate-pulse" />
            <div>
              <span className="text-[10px] text-muted-foreground block font-sans font-medium uppercase tracking-tight">Recycles In</span>
              <span className="font-bold text-primary">{timerText}</span>
            </div>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${isLimitReached ? "bg-amber-500" : "bg-primary"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Upgrade / Add Custom Key Notice */}
      <div className="flex items-center justify-between text-[11px] pt-1">
        <span className="text-muted-foreground flex items-center gap-1">
          <Key className="w-3.5 h-3.5 text-primary" />
          Add your custom API key in Settings to bypass all limits & recycling cooldowns.
        </span>
        <Link 
          to="/dashboard/settings" 
          className="text-primary hover:underline font-bold shrink-0 ml-2"
        >
          Settings →
        </Link>
      </div>
    </div>
  );
};

export default DatasetRecycleTimer;

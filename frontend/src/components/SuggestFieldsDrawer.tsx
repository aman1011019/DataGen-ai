import { FieldDefinition } from "../types/dataset";
import { Sparkles, Plus, Check, X, Loader2 } from "lucide-react";

interface SuggestFieldsDrawerProps {
  isOpen: boolean;
  isLoading: boolean;
  suggestions: FieldDefinition[];
  onAddField: (field: FieldDefinition) => void;
  onClose: () => void;
}

export const SuggestFieldsDrawer = ({
  isOpen,
  isLoading,
  suggestions,
  onAddField,
  onClose,
}: SuggestFieldsDrawerProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="text-sm font-bold text-foreground">AI Schema Recommendations</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4 text-xs">
          <p className="text-muted-foreground">
            Our AI engine analyzed your dataset schema and domain context to recommend these supplementary fields:
          </p>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3 text-muted-foreground">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="font-medium">Analyzing current schema & predicting optimal fields...</p>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="p-6 rounded-xl bg-secondary/30 border border-border text-center space-y-2">
              <Check className="w-6 h-6 text-success mx-auto" />
              <p className="font-medium text-foreground">Schema is Comprehensive!</p>
              <p className="text-muted-foreground text-[11px]">No additional contextual fields suggested at this time.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {suggestions.map((field) => (
                <div
                  key={field.id}
                  className="p-4 rounded-xl bg-secondary/40 border border-border hover:border-primary/40 transition-all flex flex-col gap-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground text-xs">{field.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10px] font-semibold">
                      {field.type}
                    </span>
                  </div>

                  <p className="text-muted-foreground text-[11px] leading-relaxed">{field.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                    <span>Strategy: {field.syntheticStrategy}</span>
                    <button
                      onClick={() => onAddField(field)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Field
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestFieldsDrawer;

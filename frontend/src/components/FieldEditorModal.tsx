import { useState, useEffect } from "react";
import { FieldDefinition, FieldType, SyntheticStrategy } from "../types/dataset";
import { X, Plus, Trash2, Sliders, Check } from "lucide-react";

interface FieldEditorModalProps {
  isOpen: boolean;
  field?: FieldDefinition | null;
  onSave: (field: FieldDefinition) => void;
  onClose: () => void;
}

const FIELD_TYPES: FieldType[] = [
  "String", "Integer", "Float", "Boolean", "Date", "DateTime",
  "Email", "Phone", "UUID", "URL", "Enum", "Currency",
  "Percentage", "Address", "Name", "Company", "Custom"
];

const STRATEGIES: { id: SyntheticStrategy; label: string }[] = [
  { id: "realistic_distribution", label: "Realistic Distribution" },
  { id: "gaussian", label: "Gaussian (Bell Curve)" },
  { id: "categorical", label: "Categorical Random Sampling" },
  { id: "unique_identifier", label: "Unique Identifier / UUID" },
  { id: "range", label: "Uniform Range (Min/Max)" },
  { id: "sequence", label: "Auto Sequential" },
  { id: "pattern", label: "Regex / Template Pattern" },
  { id: "correlated", label: "Correlated Field Ratio" },
];

export const FieldEditorModal = ({ isOpen, field, onSave, onClose }: FieldEditorModalProps) => {
  const [name, setName] = useState("");
  const [type, setType] = useState<FieldType>("String");
  const [description, setDescription] = useState("");
  const [required, setRequired] = useState(true);
  const [nullable, setNullable] = useState(false);
  const [strategy, setStrategy] = useState<SyntheticStrategy>("realistic_distribution");
  const [min, setMin] = useState<string>("");
  const [max, setMax] = useState<string>("");
  const [pattern, setPattern] = useState<string>("");
  const [enumOptions, setEnumOptions] = useState<string[]>([]);
  const [newOption, setNewOption] = useState<string>("");

  useEffect(() => {
    if (field) {
      setName(field.name);
      setType(field.type);
      setDescription(field.description);
      setRequired(field.required);
      setNullable(field.nullable);
      setStrategy(field.syntheticStrategy);
      setMin(field.constraints?.min !== undefined ? String(field.constraints.min) : "");
      setMax(field.constraints?.max !== undefined ? String(field.constraints.max) : "");
      setPattern(field.constraints?.pattern || "");
      setEnumOptions(field.constraints?.options || []);
    } else {
      setName("");
      setType("String");
      setDescription("");
      setRequired(true);
      setNullable(false);
      setStrategy("realistic_distribution");
      setMin("");
      setMax("");
      setPattern("");
      setEnumOptions(["Option A", "Option B"]);
    }
  }, [field, isOpen]);

  if (!isOpen) return null;

  const handleAddEnumOption = () => {
    if (newOption.trim() && !enumOptions.includes(newOption.trim())) {
      setEnumOptions([...enumOptions, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveEnumOption = (opt: string) => {
    setEnumOptions(enumOptions.filter((o) => o !== opt));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedName = name.toLowerCase().replace(/[^a-z0-9_]/g, "_");

    const updatedField: FieldDefinition = {
      id: field ? field.id : `fld_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      name: formattedName,
      type,
      description: description.trim() || `${type} dataset field`,
      required,
      nullable,
      syntheticStrategy: strategy,
      constraints: {
        min: min !== "" ? Number(min) : undefined,
        max: max !== "" ? Number(max) : undefined,
        pattern: pattern.trim() || undefined,
        options: type === "Enum" ? enumOptions : undefined,
      },
    };

    onSave(updatedField);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">
              {field ? "Edit Schema Field" : "Configure New Field"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Field Name & Data Type */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-foreground mb-1.5 block">
                Field Name (snake_case) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. customer_age"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-foreground mb-1.5 block">Data Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as FieldType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs"
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-foreground mb-1.5 block">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context description for AI generator & docstrings"
              className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs"
            />
          </div>

          {/* Synthetic Strategy */}
          <div>
            <label className="font-semibold text-foreground mb-1.5 block">Synthetic Generation Strategy</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value as SyntheticStrategy)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs"
            >
              {STRATEGIES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Constraints according to type */}
          {(type === "Integer" || type === "Float" || type === "Currency" || type === "Percentage") && (
            <div className="grid sm:grid-cols-2 gap-4 p-3.5 rounded-xl bg-secondary/30 border border-border/50">
              <div>
                <label className="font-medium text-foreground mb-1 block">Minimum Value</label>
                <input
                  type="number"
                  step="any"
                  value={min}
                  onChange={(e) => setMin(e.target.value)}
                  placeholder="e.g. 0"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs"
                />
              </div>
              <div>
                <label className="font-medium text-foreground mb-1 block">Maximum Value</label>
                <input
                  type="number"
                  step="any"
                  value={max}
                  onChange={(e) => setMax(e.target.value)}
                  placeholder="e.g. 100"
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs"
                />
              </div>
            </div>
          )}

          {type === "Enum" && (
            <div className="space-y-2 p-3.5 rounded-xl bg-secondary/30 border border-border/50">
              <label className="font-medium text-foreground block">Allowed Enum Values</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddEnumOption();
                    }
                  }}
                  placeholder="Add option and press Enter..."
                  className="flex-1 px-3 py-2 rounded-lg bg-secondary border border-border text-foreground text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddEnumOption}
                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {enumOptions.map((opt) => (
                  <span
                    key={opt}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-card border border-border text-[11px] font-medium"
                  >
                    {opt}
                    <button
                      type="button"
                      onClick={() => handleRemoveEnumOption(opt)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {(type === "String" || type === "Custom") && (
            <div>
              <label className="font-semibold text-foreground mb-1 block">Pattern Template (Optional)</label>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="e.g. SKU-##### or 192.168.#.#"
                className="w-full px-3.5 py-2.5 rounded-xl bg-secondary/60 border border-border text-foreground text-xs font-mono"
              />
            </div>
          )}

          {/* Toggles */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={required}
                onChange={(e) => setRequired(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="font-medium text-foreground">Required Field</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={nullable}
                onChange={(e) => setNullable(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span className="font-medium text-foreground">Allow Null Values</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>{field ? "Save Changes" : "Add Field"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FieldEditorModal;

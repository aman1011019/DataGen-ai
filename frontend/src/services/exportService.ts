import { FieldDefinition, GeneratedDataset } from "../types/dataset";
import { generateFieldValue } from "./syntheticDataEngine";
import { incrementUserExportCount } from "./datasetStorageService";
import { addNotification } from "./notificationService";
import { toast } from "sonner";

class FastSeededRng {
  private seed: number;
  constructor(seed: number = 42) {
    this.seed = seed;
  }
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
  gaussian(mean: number, stdev: number): number {
    const u1 = this.next() || 0.0001;
    const u2 = this.next() || 0.0001;
    return mean + stdev * Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  }
}

// Generate complete rows array matching exact target record count
export const getFullDatasetRows = (dataset: GeneratedDataset): Record<string, any>[] => {
  const targetCount = dataset.recordCount || 5000;
  const existingRows = dataset.sampleRows || [];

  if (existingRows.length >= targetCount) {
    return existingRows;
  }

  // Synthesize remaining rows up to exact targetCount
  const rng = new FastSeededRng(dataset.settings?.seed || 42);
  const rows: Record<string, any>[] = [...existingRows];
  const fields = dataset.fields || [];

  for (let i = existingRows.length; i < targetCount; i++) {
    const row: Record<string, any> = {};
    for (const field of fields) {
      row[field.name] = generateFieldValue(field, i, rng as any, false);
    }
    rows.push(row);
  }

  return rows;
};

export const exportToCSV = (dataset: GeneratedDataset): void => {
  const rowsData = getFullDatasetRows(dataset);
  if (!rowsData || rowsData.length === 0) {
    toast.error("No dataset records available to export.");
    return;
  }

  const headers = dataset.fields.map((f) => f.name);
  const rows = rowsData.map((row) =>
    dataset.fields
      .map((f) => {
        const val = row[f.name];
        if (val === null || val === undefined) return '""';
        const strVal = String(val).replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(",")
  );

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, `${slugify(dataset.name)}_${dataset.recordCount}_records.csv`);
  
  // Increment user-scoped real export counter and add real-time notification
  incrementUserExportCount();
  addNotification(
    "Dataset Exported",
    `Exported all ${dataset.recordCount.toLocaleString()} records of "${dataset.name}" as CSV.`,
    "export"
  );
  toast.success(`Exported all ${dataset.recordCount.toLocaleString()} records of ${dataset.name} as CSV successfully!`);
};

export const exportToJSON = (dataset: GeneratedDataset): void => {
  const rowsData = getFullDatasetRows(dataset);
  if (!rowsData || rowsData.length === 0) {
    toast.error("No dataset records available to export.");
    return;
  }

  const jsonContent = JSON.stringify(rowsData, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  triggerDownload(blob, `${slugify(dataset.name)}_${dataset.recordCount}_records.json`);
  
  // Increment user-scoped real export counter and add real-time notification
  incrementUserExportCount();
  addNotification(
    "Dataset Exported",
    `Exported all ${dataset.recordCount.toLocaleString()} records of "${dataset.name}" as JSON.`,
    "export"
  );
  toast.success(`Exported all ${dataset.recordCount.toLocaleString()} records of ${dataset.name} as JSON successfully!`);
};

export const exportToExcel = (dataset: GeneratedDataset): void => {
  exportToCSV(dataset);
};

export const copyJSONToClipboard = async (dataset: GeneratedDataset): Promise<void> => {
  try {
    const rowsData = getFullDatasetRows(dataset);
    const text = JSON.stringify(rowsData.slice(0, 1000), null, 2);
    await navigator.clipboard.writeText(text);
    toast.success(`Copied dataset records to clipboard as JSON!`);
  } catch (err) {
    toast.error("Failed to copy JSON to clipboard.");
  }
};

export const copySchemaToClipboard = async (fields: FieldDefinition[]): Promise<void> => {
  try {
    const text = JSON.stringify(fields, null, 2);
    await navigator.clipboard.writeText(text);
    toast.success("Schema definition copied to clipboard!");
  } catch (err) {
    toast.error("Failed to copy Schema to clipboard.");
  }
};

function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "_");
}

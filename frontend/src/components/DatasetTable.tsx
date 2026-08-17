import { useState, useMemo } from "react";
import { FieldDefinition } from "../types/dataset";
import { Search, ArrowUpDown, ChevronLeft, ChevronRight, Eye, EyeOff, SlidersHorizontal } from "lucide-react";

interface DatasetTableProps {
  fields: FieldDefinition[];
  rows: Record<string, any>[];
  totalRecords?: number;
}

export const DatasetTable = ({ fields, rows, totalRecords }: DatasetTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [hiddenColumns, setHiddenColumns] = useState<Set<string>>(new Set());
  const [showColumnToggle, setShowColumnToggle] = useState(false);

  // Visible fields filter
  const visibleFields = useMemo(
    () => fields.filter((f) => !hiddenColumns.has(f.name)),
    [fields, hiddenColumns]
  );

  // Filter rows by search term
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();
    return rows.filter((row) =>
      Object.values(row).some(
        (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(term)
      )
    );
  }, [rows, searchTerm]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sortField) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (typeof valA === "number" && typeof valB === "number") {
        return sortAsc ? valA - valB : valB - valA;
      }
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return sortAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });
  }, [filteredRows, sortField, sortAsc]);

  // Paginate rows
  const totalPages = Math.ceil(sortedRows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, currentPage, rowsPerPage]);

  const handleSort = (fieldName: string) => {
    if (sortField === fieldName) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(fieldName);
      setSortAsc(true);
    }
  };

  const toggleColumnVisibility = (fieldName: string) => {
    const updated = new Set(hiddenColumns);
    if (updated.has(fieldName)) {
      updated.delete(fieldName);
    } else {
      updated.add(fieldName);
    }
    setHiddenColumns(updated);
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar: Search + Page size + Column Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search all columns..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-secondary/60 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="relative">
            <button
              onClick={() => setShowColumnToggle(!showColumnToggle)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Columns ({visibleFields.length}/{fields.length})</span>
            </button>

            {showColumnToggle && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border shadow-xl p-3 z-30 space-y-2 max-h-60 overflow-y-auto">
                <div className="text-[10px] font-bold text-muted-foreground uppercase">Toggle Column Visibility</div>
                {fields.map((f) => (
                  <label key={f.name} className="flex items-center gap-2 cursor-pointer hover:bg-secondary/40 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={!hiddenColumns.has(f.name)}
                      onChange={() => toggleColumnVisibility(f.name)}
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="font-mono text-xs">{f.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg bg-secondary border border-border text-foreground text-xs"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="py-3 px-4 text-[11px] font-bold text-muted-foreground w-12 text-center border-r border-border/50">
                  #
                </th>
                {visibleFields.map((f) => (
                  <th
                    key={f.name}
                    onClick={() => handleSort(f.name)}
                    className="py-3 px-4 font-mono font-semibold text-foreground cursor-pointer hover:bg-secondary/80 transition-colors border-r border-border/50 whitespace-nowrap"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span>{f.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-sans font-normal">
                          {f.type}
                        </span>
                      </div>
                      <ArrowUpDown className="w-3 h-3 text-muted-foreground opacity-60 hover:opacity-100" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-sans">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={visibleFields.length + 1} className="py-12 text-center text-muted-foreground">
                    No matching records found.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const absoluteIndex = (currentPage - 1) * rowsPerPage + idx + 1;
                  return (
                    <tr key={idx} className="hover:bg-secondary/30 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono text-[11px] text-muted-foreground border-r border-border/50 bg-secondary/10">
                        {absoluteIndex}
                      </td>
                      {visibleFields.map((f) => {
                        const val = row[f.name];
                        return (
                          <td key={f.name} className="py-2.5 px-4 border-r border-border/50 text-foreground max-w-xs truncate">
                            {val === null || val === undefined ? (
                              <span className="inline-block px-1.5 py-0.5 rounded bg-destructive/10 text-destructive text-[10px] font-mono">
                                null
                              </span>
                            ) : typeof val === "boolean" ? (
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  val
                                    ? "bg-success/10 text-success border border-success/20"
                                    : "bg-muted/40 text-muted-foreground border border-border"
                                }`}
                              >
                                {val ? "true" : "false"}
                              </span>
                            ) : (
                              <span className="font-mono text-xs">{String(val)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t border-border bg-secondary/20 text-xs">
          <div className="text-muted-foreground">
            Showing <strong className="text-foreground">{paginatedRows.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</strong> to{" "}
            <strong className="text-foreground">{Math.min(currentPage * rowsPerPage, sortedRows.length)}</strong> of{" "}
            <strong className="text-foreground">{sortedRows.length.toLocaleString()}</strong> preview rows
            {totalRecords && totalRecords > sortedRows.length && (
              <span> (Generated dataset size: {totalRecords.toLocaleString()})</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-semibold text-foreground">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl bg-secondary border border-border text-foreground hover:bg-secondary/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetTable;

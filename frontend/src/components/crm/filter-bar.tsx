import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal } from "lucide-react";
import type { ReactNode } from "react";

export interface FilterOption {
  label: string;
  options: { label: string; value: string }[];
  current: string;
  onChange: (v: string) => void;
}

export function FilterBar({
  search,
  onSearch,
  filters = [],
  right,
}: {
  search: string;
  onSearch: (v: string) => void;
  filters?: FilterOption[];
  right?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search..."
          className="pl-9"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <Select key={f.label} value={f.current} onValueChange={f.onChange}>
            <SelectTrigger className="h-9 w-[160px]">
              <SelectValue placeholder={f.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All {f.label}</SelectItem>
              {f.options.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        <Button variant="outline" size="sm" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" /> More
        </Button>
      </div>
      {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
    </div>
  );
}
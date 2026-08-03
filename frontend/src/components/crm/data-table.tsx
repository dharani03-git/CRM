import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { ReactNode } from "react";

export interface DataColumn<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

export function DataTable<T>({ rows, columns, empty }: { rows: T[]; columns: DataColumn<T>[]; empty?: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow>
            {columns.map((c) => (
              <TableHead key={c.header} className={c.className}>{c.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={columns.length} className="py-10 text-center text-sm text-muted-foreground">
                {empty ?? "No results"}
              </TableCell>
            </TableRow>
          )}
          {rows.map((r, i) => (
            <TableRow key={i} className="hover:bg-muted/40">
              {columns.map((c) => (
                <TableCell key={c.header} className={c.className}>{c.cell(r)}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
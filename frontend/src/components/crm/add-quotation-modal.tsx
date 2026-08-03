import { useState } from "react";
import { useCRMStore } from "@/lib/crm-store";
import { products, type QuotationLine } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function AddQuotationModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addQuotation, leads } = useCRMStore();

  const [leadId, setLeadId] = useState("");
  const [discountPct, setDiscountPct] = useState("5");
  const [taxPct, setTaxPct] = useState("18");
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<QuotationLine[]>([{ product: products[0], qty: 100, unitPrice: 150 }]);

  const [loading, setLoading] = useState(false);

  const handleAddLine = () => {
    setLines([...lines, { product: products[0], qty: 100, unitPrice: 150 }]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length === 1) {
      toast.error("Quotation must have at least one line item");
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineChange = (index: number, field: keyof QuotationLine, value: any) => {
    const updated = lines.map((l, i) => {
      if (i === index) {
        return {
          ...l,
          [field]: field === "qty" || field === "unitPrice" ? Number(value) || 0 : value,
        };
      }
      return l;
    });
    setLines(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) {
      toast.error("Please select an associated lead");
      return;
    }

    const lead = leads.find((l) => l.id === leadId);
    if (!lead) {
      toast.error("Selected lead not found");
      return;
    }

    // Filter out invalid lines
    const validLines = lines.filter((l) => l.product && l.qty > 0 && l.unitPrice > 0);
    if (validLines.length === 0) {
      toast.error("Please add at least one valid line item with quantity and unit price greater than 0");
      return;
    }

    setLoading(true);
    try {
      await addQuotation({
        leadId,
        company: lead.company,
        ownerId: lead.ownerId,
        lines: validLines,
        discountPct: Number(discountPct) || 0,
        taxPct: Number(taxPct) || 0,
        notes: notes || undefined,
      });

      toast.success("Quotation draft created successfully!");
      onOpenChange(false);

      // Reset Form
      setLeadId("");
      setDiscountPct("5");
      setTaxPct("18");
      setNotes("");
      setLines([{ product: products[0], qty: 100, unitPrice: 150 }]);
    } catch (err: any) {
      toast.error(err.message || "Failed to create quotation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Quotation Draft</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="lead">Associated Lead *</Label>
            <Select value={leadId} onValueChange={setLeadId}>
              <SelectTrigger id="lead">
                <SelectValue placeholder="Select Lead" />
              </SelectTrigger>
              <SelectContent>
                {leads.map((l) => (
                  <SelectItem key={l.id} value={l.id}>{l.company} ({l.contact})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-semibold">Line Items *</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddLine} className="gap-1">
                <Plus className="h-3.5 w-3.5" /> Add Line
              </Button>
            </div>
            
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {lines.map((line, index) => (
                <div key={index} className="flex gap-2 items-end border p-2 rounded-md bg-muted/40">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px]">Product</Label>
                    <Select value={line.product} onValueChange={(val) => handleLineChange(index, "product", val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-20 space-y-1">
                    <Label className="text-[10px]">Qty</Label>
                    <Input type="number" min="1" value={line.qty} onChange={(e) => handleLineChange(index, "qty", e.target.value)} required />
                  </div>
                  <div className="w-28 space-y-1">
                    <Label className="text-[10px]">Price (INR)</Label>
                    <Input type="number" min="0" value={line.unitPrice} onChange={(e) => handleLineChange(index, "unitPrice", e.target.value)} required />
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveLine(index)} className="text-destructive hover:bg-destructive/15">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-3">
            <div className="space-y-1">
              <Label htmlFor="discount">Discount (%)</Label>
              <Input id="discount" type="number" min="0" max="100" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="tax">Tax / GST (%)</Label>
              <Input id="tax" type="number" min="0" max="100" value={taxPct} onChange={(e) => setTaxPct(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes / Terms</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Valid for 30 days. Delivery within 15 days of order confirmation." />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Quotation"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

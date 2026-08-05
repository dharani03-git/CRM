import { useState, useRef } from "react";
import { useCRMStore } from "@/lib/crm-store";
import { useRole } from "@/lib/role-context";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { leadSources, categories, LEAD_STATUSES, type LeadStatus, type Priority } from "@/lib/mock-data";
import { Download, Upload, AlertCircle, CheckCircle2, FileSpreadsheet, RefreshCw } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";

interface ParsedLead {
  company: string;
  contact: string;
  designation: string;
  mobile: string;
  email: string;
  source: string;
  category: string;
  priority: Priority;
  status: LeadStatus;
  estimatedValue: number;
  city: string;
  notes: string;
  nextFollowUp: string;
  ownerId: string;
  ownerName: string;
  errors: string[];
  isValid: boolean;
}

export function ImportLeadsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { addLeads, employees } = useCRMStore();
  const { currentUser } = useRole();

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedLead[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Download Sample Excel Template
  const handleDownloadTemplate = () => {
    try {
      const headers = [
        "Company",
        "Contact Name",
        "Designation",
        "Mobile",
        "Email",
        "Source",
        "Category",
        "Priority",
        "Status",
        "Estimated Value",
        "City",
        "Notes",
        "Next Follow Up",
        "Owner Name or Email"
      ];

      const sampleRows = [
        {
          "Company": "Kottravai Crafts Ltd",
          "Contact Name": "Arun Kumar",
          "Designation": "Purchase Manager",
          "Mobile": "+91 98765 43210",
          "Email": "arun@kottravaicrafts.com",
          "Source": "Website",
          "Category": "Corporate Gifting",
          "Priority": "High",
          "Status": "New",
          "Estimated Value": 75000,
          "City": "Coimbatore",
          "Notes": "Interested in Coconut Bowls bulk package",
          "Next Follow Up": new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days later
          "Owner Name or Email": currentUser?.email || "admin@kottravai.in"
        },
        {
          "Company": "Nature Retail Inc",
          "Contact Name": "Deepika Raj",
          "Designation": "Founder",
          "Mobile": "+91 91234 56789",
          "Email": "deepika@natureretail.in",
          "Source": "LinkedIn",
          "Category": "Retail Distribution",
          "Priority": "Medium",
          "Status": "New",
          "Estimated Value": 120000,
          "City": "Bangalore",
          "Notes": "Requires eco-gift boxes sample catalogue",
          "Next Follow Up": new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0], // 3 days later
          "Owner Name or Email": employees[0]?.email || "admin@kottravai.in"
        }
      ];

      const ws = XLSX.utils.json_to_sheet(sampleRows, { header: headers });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Leads Template");

      // Write excel file and download
      XLSX.writeFile(wb, "Kottravai_Leads_Import_Template.xlsx");
      toast.success("Template download started");
    } catch (err: any) {
      toast.error("Failed to generate template: " + err.message);
    }
  };

  // Helper to normalize strings for comparison
  const normalize = (val: any) => String(val || "").trim().toLowerCase();

  // Find Owner ID based on Name or Email match
  const findOwner = (identifier: string) => {
    if (!identifier) return { id: currentUser?.id || employees[0]?.id || "", name: currentUser?.name || "System" };
    
    const idNormalized = normalize(identifier);
    const match = employees.find(
      (e) => normalize(e.email) === idNormalized || normalize(e.name) === idNormalized
    );

    if (match) {
      return { id: match.id, name: match.name };
    }
    return { id: currentUser?.id || employees[0]?.id || "", name: `${currentUser?.name || "System"} (Fallback)` };
  };

  // Parse Uploaded File
  const handleFileParse = (uploadedFile: File) => {
    setLoading(true);
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error("Could not read file data");

        const workbook = XLSX.read(data, { type: "binary", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Parse sheet as array of objects
        const rawRows = XLSX.utils.sheet_to_json<any>(sheet);
        if (rawRows.length === 0) {
          throw new Error("Excel sheet is empty or contains no records");
        }

        // Map and validate rows
        const processed: ParsedLead[] = rawRows.map((row, idx) => {
          const errors: string[] = [];
          
          // Field mappings (handling common aliases)
          const company = String(row["Company"] || row["company"] || row["Company Name"] || "").trim();
          const contact = String(row["Contact Name"] || row["contact"] || row["Contact"] || row["Name"] || "").trim();
          const designation = String(row["Designation"] || row["designation"] || "").trim();
          const mobile = String(row["Mobile"] || row["mobile"] || row["Phone"] || row["phone"] || row["Mobile Number"] || "").trim();
          const email = String(row["Email"] || row["email"] || row["Email Address"] || "").trim();
          const source = String(row["Source"] || row["source"] || row["Lead Source"] || "").trim() || leadSources[0];
          const category = String(row["Category"] || row["category"] || "").trim() || categories[0];
          
          let priority: Priority = "Medium";
          const rowPriority = String(row["Priority"] || row["priority"] || "").trim();
          if (["low", "medium", "high"].includes(rowPriority.toLowerCase())) {
            priority = (rowPriority.charAt(0).toUpperCase() + rowPriority.slice(1).toLowerCase()) as Priority;
          }

          let status: LeadStatus = "New";
          const rowStatus = String(row["Status"] || row["status"] || "").trim();
          const matchedStatus = LEAD_STATUSES.find(s => s.toLowerCase() === rowStatus.toLowerCase());
          if (matchedStatus) {
            status = matchedStatus;
          }

          const estimatedValue = Number(row["Estimated Value"] || row["value"] || row["EstimatedValue"] || row["Est Value"] || 0);
          const city = String(row["City"] || row["city"] || "").trim();
          const notes = String(row["Notes"] || row["notes"] || row["Note"] || row["note"] || "").trim();
          
          let nextFollowUp = "";
          const followUpVal = row["Next Follow Up"] || row["nextFollowUp"] || row["Follow Up Date"];
          if (followUpVal) {
            if (followUpVal instanceof Date) {
              nextFollowUp = followUpVal.toISOString();
            } else {
              const d = new Date(followUpVal);
              if (!isNaN(d.getTime())) {
                nextFollowUp = d.toISOString();
              }
            }
          }

          const ownerVal = String(row["Owner Name or Email"] || row["Owner"] || row["owner"] || row["Lead Owner"] || "").trim();
          const owner = findOwner(ownerVal);

          // Validation
          if (!company) errors.push("Company name is required");
          if (!contact) errors.push("Contact Name is required");
          if (!mobile) errors.push("Mobile number is required");
          if (!email) errors.push("Email is required");
          else if (!/\S+@\S+\.\S+/.test(email)) errors.push("Invalid email format");

          return {
            company,
            contact,
            designation,
            mobile,
            email,
            source,
            category,
            priority,
            status,
            estimatedValue,
            city,
            notes,
            nextFollowUp,
            ownerId: owner.id,
            ownerName: owner.name,
            errors,
            isValid: errors.length === 0,
          };
        });

        setParsedData(processed);
        toast.success(`Successfully parsed ${processed.length} rows`);
      } catch (err: any) {
        toast.error("Error parsing file: " + err.message);
        setFile(null);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      toast.error("Failed to read file");
      setLoading(false);
      setFile(null);
    };
    reader.readAsBinaryString(uploadedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const ext = droppedFile.name.split('.').pop()?.toLowerCase();
      if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
        handleFileParse(droppedFile);
      } else {
        toast.error("Please upload only Excel (.xlsx, .xls) or CSV files");
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileParse(e.target.files[0]);
    }
  };

  const handleImport = async () => {
    const validLeads = parsedData.filter((d) => d.isValid);
    if (validLeads.length === 0) {
      toast.error("No valid leads to import");
      return;
    }

    setLoading(true);
    try {
      // Map to exact required schema structure
      const leadsToCreate = validLeads.map((vl) => ({
        company: vl.company,
        contact: vl.contact,
        designation: vl.designation || null,
        mobile: vl.mobile,
        email: vl.email,
        source: vl.source,
        category: vl.category,
        priority: vl.priority,
        status: vl.status,
        estimatedValue: vl.estimatedValue,
        city: vl.city || null,
        notes: vl.notes || null,
        nextFollowUp: vl.nextFollowUp || new Date().toISOString(),
        ownerId: vl.ownerId,
        productInterests: [],
        contacted: false,
        note: `Lead imported via bulk upload. Original Owner specified: ${vl.ownerName}`
      }));

      await addLeads(leadsToCreate);
      toast.success(`Imported ${validLeads.length} leads successfully!`);
      onOpenChange(false);
      resetState();
    } catch (err: any) {
      toast.error(err.message || "Failed to import leads");
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setLoading(false);
  };

  const totalRows = parsedData.length;
  const validRows = parsedData.filter((d) => d.isValid).length;
  const invalidRows = totalRows - validRows;

  return (
    <Dialog open={open} onOpenChange={(val) => { if (!loading) { onOpenChange(val); if (!val) resetState(); } }}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] flex flex-col p-6">
        <DialogHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
          <div>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
              Bulk Import Leads
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload lead information in bulk using Excel (.xlsx, .xls) or CSV files.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Download Sample Template
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors duration-200 text-center min-h-[250px] ${
                dragActive ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50 hover:bg-muted/10"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileInputChange}
              />
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-emerald-500 animate-bounce" />
              </div>
              <p className="text-sm font-semibold text-foreground">Drag & drop your Excel or CSV file here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse from your device</p>
              <p className="text-[10px] text-muted-foreground/60 mt-4 bg-muted px-2 py-1 rounded">
                Supported formats: .xlsx, .xls, .csv (Max 10MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-muted/50 border rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-xs font-semibold text-foreground truncate max-w-[300px]">{file.name}</p>
                    <p className="text-[10px] text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={resetState} className="text-xs h-8 text-destructive hover:bg-destructive/10">
                  Remove File
                </Button>
              </div>

              {/* Status Alert Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="border rounded-lg p-3 bg-slate-500/5 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Total Parsed</span>
                  <span className="text-xl font-bold mt-1 text-foreground">{totalRows}</span>
                </div>
                <div className="border border-emerald-500/20 rounded-lg p-3 bg-emerald-500/5 flex flex-col justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Valid to Import</span>
                  <span className="text-xl font-bold mt-1 text-emerald-600">{validRows}</span>
                </div>
                <div className={`border rounded-lg p-3 flex flex-col justify-between ${invalidRows > 0 ? "border-destructive/20 bg-destructive/5" : "border-muted bg-muted/10"}`}>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ${invalidRows > 0 ? "text-destructive" : "text-muted-foreground"}`}>Contains Errors</span>
                  <span className={`text-xl font-bold mt-1 ${invalidRows > 0 ? "text-destructive" : "text-muted-foreground"}`}>{invalidRows}</span>
                </div>
              </div>

              {invalidRows > 0 && (
                <Alert variant="destructive" className="py-2.5">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle className="text-xs font-semibold">Validation Alerts Present</AlertTitle>
                  <AlertDescription className="text-[11px] text-destructive-foreground/90">
                    We found issues with {invalidRows} rows. Leads with errors will be skipped during import. You can fix them in your spreadsheet and upload again, or click Import to load only the {validRows} valid rows.
                  </AlertDescription>
                </Alert>
              )}

              {/* Preview Table */}
              <div className="border rounded-lg overflow-hidden max-h-[300px] overflow-y-auto">
                <Table className="text-xs">
                  <TableHeader className="bg-muted/70 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="w-12 text-center">Status</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Contact Name</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Assigned Owner</TableHead>
                      <TableHead className="text-right">Est. Value (₹)</TableHead>
                      <TableHead>Error Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, idx) => (
                      <TableRow key={idx} className={row.isValid ? "" : "bg-destructive/5 hover:bg-destructive/10"}>
                        <TableCell className="text-center py-2">
                          {row.isValid ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-destructive mx-auto" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium py-2">{row.company || "-"}</TableCell>
                        <TableCell className="py-2">{row.contact || "-"}</TableCell>
                        <TableCell className="py-2">{row.mobile || "-"}</TableCell>
                        <TableCell className="py-2">{row.email || "-"}</TableCell>
                        <TableCell className="py-2">
                          <span className="inline-flex items-center rounded-md bg-primary/5 px-2 py-0.5 font-medium text-primary ring-1 ring-inset ring-primary/10">
                            {row.ownerName}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-2">{row.estimatedValue.toLocaleString("en-IN")}</TableCell>
                        <TableCell className="py-2">
                          {row.isValid ? (
                            <Badge variant="outline" className="text-[10px] text-emerald-600 bg-emerald-50 border-emerald-200">Ready</Badge>
                          ) : (
                            <span className="text-[10px] text-destructive font-medium block max-w-[200px] truncate" title={row.errors.join(", ")}>
                              {row.errors.join(", ")}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t border-border gap-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          {file && (
            <Button
              onClick={handleImport}
              disabled={loading || validRows === 0}
              size="sm"
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  Import {validRows} Leads
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

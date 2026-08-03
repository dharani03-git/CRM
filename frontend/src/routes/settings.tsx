import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Kottravai CRM" },
      { name: "description", content: "Organization, notifications, and integration settings." },
      { property: "og:title", content: "Settings — Kottravai CRM" },
      { property: "og:description", content: "Configure your CRM workspace." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage workspace preferences</p>
      </div>
      <Tabs defaultValue="org">
        <TabsList>
          <TabsTrigger value="org">Organisation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
        </TabsList>
        <TabsContent value="org" className="mt-4">
          <Card className="rounded-2xl p-5 shadow-sm space-y-4">
            <div className="space-y-1"><Label>Company name</Label><Input defaultValue="Kottravai" /></div>
            <div className="space-y-1"><Label>Support email</Label><Input defaultValue="hello@kottravai.in" /></div>
            <div className="space-y-1"><Label>GSTIN</Label><Input defaultValue="33ABCDE1234F1Z5" /></div>
            <Button>Save changes</Button>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="mt-4">
          <Card className="rounded-2xl p-5 shadow-sm space-y-4">
            {["New lead assigned", "Follow-up reminders", "Quotation viewed", "Deal won"].map((k) => (
              <div key={k} className="flex items-center justify-between">
                <div><p className="text-sm font-medium">{k}</p><p className="text-xs text-muted-foreground">Email + in-app</p></div>
                <Switch defaultChecked />
              </div>
            ))}
          </Card>
        </TabsContent>
        <TabsContent value="pipeline" className="mt-4">
          <Card className="rounded-2xl p-5 shadow-sm">
            <p className="text-sm text-muted-foreground">Customise pipeline stages, lead sources, and categories.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
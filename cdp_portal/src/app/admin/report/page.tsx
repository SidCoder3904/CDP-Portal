import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReportGenerator } from "@/components/report_generator";
import { TemplateManager } from "@/components/template_manager";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-template">
            Generate Reports
          </h2>
          <Tabs defaultValue="generate" className="space-y-6">
            <TabsList>
              <TabsTrigger value="generate">Generate Reports</TabsTrigger>
              <TabsTrigger value="templates">Manage Templates</TabsTrigger>
            </TabsList>
            <TabsContent value="generate">
              <div>
                <p className="text-muted-foreground">
                  Generate and download various reports for placement and
                  internship analysis
                </p>
              </div>
              <Separator className="my-6" />
              <ReportGenerator />
            </TabsContent>
            <TabsContent value="templates">
              <TemplateManager />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

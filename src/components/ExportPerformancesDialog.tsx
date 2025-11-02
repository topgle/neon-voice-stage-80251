import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { usePerformanceExport } from '@/hooks/usePerformanceExport';
import { Card } from '@/components/ui/card';

interface ExportPerformancesDialogProps {
  sessionId?: string;
}

export const ExportPerformancesDialog = ({ sessionId }: ExportPerformancesDialogProps) => {
  const [open, setOpen] = useState(false);
  const { exportToCSV, exportToJSON } = usePerformanceExport();

  const handleExportCSV = async () => {
    await exportToCSV(sessionId);
    setOpen(false);
  };

  const handleExportJSON = async () => {
    await exportToJSON(sessionId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg">
          <Download className="h-5 w-5 mr-2" />
          Exportar Histórico
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Exportar Performances</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Escolha o formato de exportação para {sessionId ? 'esta sessão' : 'todas as performances'}
          </p>

          <Card 
            className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={handleExportCSV}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Exportar CSV</h4>
                <p className="text-xs text-muted-foreground">
                  Planilha compatível com Excel e Google Sheets
                </p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
            onClick={handleExportJSON}
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileJson className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Exportar JSON</h4>
                <p className="text-xs text-muted-foreground">
                  Dados estruturados para análise e integração
                </p>
              </div>
            </div>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

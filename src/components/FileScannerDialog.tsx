import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FolderOpen, Upload, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useFileScanner } from '@/hooks/useFileScanner';
import { Card } from '@/components/ui/card';

interface FileScannerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FileScannerDialog = ({ open, onOpenChange }: FileScannerDialogProps) => {
  const { isScanning, progress, scanFiles, scanFolder } = useFileScanner();
  const [dragActive, setDragActive] = useState(false);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      scanFiles(e.target.files);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      scanFiles(e.dataTransfer.files);
    }
  };

  const progressPercent = progress.total > 0 
    ? (progress.processed / progress.total) * 100 
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Scanner de Músicas Locais</DialogTitle>
          <DialogDescription>
            Importe músicas do seu computador para a biblioteca
          </DialogDescription>
        </DialogHeader>

        {!isScanning ? (
          <div className="space-y-4">
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-semibold mb-2">
                Arraste arquivos aqui
              </p>
              <p className="text-sm text-muted-foreground">
                ou clique nos botões abaixo
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                size="lg"
                className="h-24"
                onClick={scanFolder}
              >
                <div className="flex flex-col items-center gap-2">
                  <FolderOpen className="h-8 w-8" />
                  <div>
                    <p className="font-semibold">Escanear Pasta</p>
                    <p className="text-xs text-muted-foreground">
                      Selecione uma pasta inteira
                    </p>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-24"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8" />
                  <div>
                    <p className="font-semibold">Selecionar Arquivos</p>
                    <p className="text-xs text-muted-foreground">
                      Escolha arquivos específicos
                    </p>
                  </div>
                </div>
              </Button>
            </div>

            <input
              id="file-input"
              type="file"
              multiple
              accept="audio/*,video/mp4,video/quicktime"
              className="hidden"
              onChange={handleFileInput}
            />

            {/* Supported Formats */}
            <Card className="p-4 bg-muted/50">
              <p className="text-sm font-semibold mb-2">Formatos Suportados:</p>
              <div className="flex flex-wrap gap-2">
                {['MP4', 'MOV', 'MP3', 'WAV', 'OGG', 'WebM', 'M4A'].map(format => (
                  <span 
                    key={format}
                    className="px-3 py-1 bg-primary/10 rounded-full text-xs font-medium"
                  >
                    {format}
                  </span>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Progress Header */}
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-semibold mb-1">Processando Arquivos</h3>
              <p className="text-sm text-muted-foreground">
                {progress.processed} de {progress.total} arquivos
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {Math.round(progressPercent)}% concluído
              </p>
            </div>

            {/* Current File */}
            {progress.current && (
              <Card className="p-4 bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Processando:</p>
                <p className="text-sm font-medium truncate">{progress.current}</p>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Indexadas</p>
                    <p className="text-2xl font-bold text-green-500">
                      {progress.indexed}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <p className="text-xs text-muted-foreground">Erros</p>
                    <p className="text-2xl font-bold text-destructive">
                      {progress.errors}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

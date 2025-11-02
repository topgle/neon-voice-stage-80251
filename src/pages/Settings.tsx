import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadSongDialog } from "@/components/UploadSongDialog";
import { YouTubeSearchDialog } from "@/components/YouTubeSearchDialog";
import { FileScannerDialog } from "@/components/FileScannerDialog";
import { MicCalibration } from "@/components/MicCalibration";
import { MusicLibraryManager } from "@/components/MusicLibraryManager";
import { AIAudioProcessor } from "@/components/AIAudioProcessor";
import { Button } from "@/components/ui/button";
import { FolderSearch, Upload, Youtube, Mic, Music, Settings as SettingsIcon, Bot, Sparkles } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [scannerOpen, setScannerOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground">Configure seu sistema de karaokê</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Assistant Highlight */}
          <Card className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <Bot className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Experimente o Assistente Inteligente
                </h3>
                <p className="text-sm text-muted-foreground">
                  Controle o app com comandos naturais: "Buscar Bohemian Rhapsody", "Criar playlist Rock", "Iniciar The Voices"
                </p>
              </div>
              <Button 
                variant="neon" 
                size="lg"
                onClick={() => navigate('/assistant')}
                className="hidden md:flex"
              >
                <Bot className="h-5 w-5 mr-2" />
                Testar Agora
              </Button>
            </div>
            <Button 
              variant="neon" 
              size="lg"
              onClick={() => navigate('/assistant')}
              className="w-full mt-4 md:hidden"
            >
              <Bot className="h-5 w-5 mr-2" />
              Testar Assistente
            </Button>
          </Card>

          {/* Gerenciamento de Músicas */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Music className="h-5 w-5" />
                Gerenciamento de Músicas
              </CardTitle>
              <CardDescription>
                Adicione músicas ao seu repertório de diferentes formas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setScannerOpen(true)}
                  className="h-auto flex-col gap-3 py-6"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <FolderSearch className="h-6 w-6" />
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">Escanear Arquivos</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Busque músicas em pastas do seu computador
                    </div>
                  </div>
                </Button>

                <div className="flex">
                  <UploadSongDialog 
                    trigger={
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="h-auto flex-col gap-3 py-6 w-full"
                      >
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">Adicionar Música</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Faça upload de arquivos MP3, WAV ou M4A
                          </div>
                        </div>
                      </Button>
                    }
                  />
                </div>

                <div className="flex">
                  <YouTubeSearchDialog 
                    trigger={
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="h-auto flex-col gap-3 py-6 w-full"
                      >
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Youtube className="h-6 w-6" />
                        </div>
                        <div className="text-center">
                          <div className="font-semibold">Buscar no YouTube</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Baixe músicas diretamente do YouTube
                          </div>
                        </div>
                      </Button>
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Processamento com IA */}
          <AIAudioProcessor />

          {/* Gerenciador de Biblioteca */}
          <MusicLibraryManager />

          {/* Calibração de Áudio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5" />
                Calibração de Microfone
              </CardTitle>
              <CardDescription>
                Configure e teste seu microfone para melhor performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MicCalibration />
            </CardContent>
          </Card>

          {/* Informações do Sistema */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Sistema</CardTitle>
              <CardDescription>
                Informações sobre o Karaoke Lovable
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Versão</span>
                  <span className="font-medium">1.0.0</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Desenvolvido com</span>
                  <span className="font-medium">Lovable.dev</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Modo de análise</span>
                  <span className="font-medium">Pitch + Ritmo + Expressão</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <FileScannerDialog open={scannerOpen} onOpenChange={setScannerOpen} />
    </div>
  );
};

export default Settings;

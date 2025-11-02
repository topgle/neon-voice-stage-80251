import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wand2, Loader2, FileAudio, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSongs } from "@/hooks/useSongs";

export const AIAudioProcessor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<string>("");
  const { toast } = useToast();
  const { uploadSong } = useSongs();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Arquivo inválido",
          description: "Por favor, selecione um arquivo de áudio válido",
          variant: "destructive"
        });
      }
    }
  };

  const processAudio = async () => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um arquivo de áudio",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);

    try {
      // Step 1: Upload do arquivo
      setStep("Fazendo upload do arquivo...");
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `songs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('karaoke-songs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('karaoke-songs')
        .getPublicUrl(filePath);

      // Step 2: Extrair letra com IA
      setStep("Extraindo letra com IA...");
      const { data: lyricsData, error: lyricsError } = await supabase.functions.invoke('process-audio', {
        body: { action: 'extract-lyrics', audioUrl: publicUrl }
      });

      if (lyricsError) throw lyricsError;

      // Step 3: Separar vocal (simulado)
      setStep("Processando separação vocal...");
      const { data: vocalData, error: vocalError } = await supabase.functions.invoke('process-audio', {
        body: { action: 'separate-vocals', audioUrl: publicUrl }
      });

      if (vocalError) throw vocalError;

      // Step 4: Cadastrar música
      setStep("Cadastrando música no sistema...");
      
      // Extrair metadados básicos do nome do arquivo
      const fileName_parts = file.name.replace(/\.[^/.]+$/, "").split('-');
      const title = fileName_parts[0]?.trim() || 'Música sem título';
      const artist = fileName_parts[1]?.trim() || 'Artista desconhecido';

      // Get audio duration
      const audio = new Audio(URL.createObjectURL(file));
      await new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', resolve);
      });
      const duration = Math.floor(audio.duration);

      const { error: insertError } = await supabase
        .from('songs')
        .insert([{
          title,
          artist,
          duration,
          file_path: publicUrl,
          source: 'local',
          format: fileExt as any,
          lyrics_timed: lyricsData?.lyrics ? { lyrics: lyricsData.lyrics } : null,
          instrumental_track_path: vocalData?.instrumentalUrl,
        }]);

      if (insertError) throw insertError;

      toast({
        title: "Música processada com sucesso!",
        description: "A música foi adicionada ao catálogo com letra e faixa instrumental",
      });

      setFile(null);
      setStep("");

    } catch (error) {
      console.error("Erro ao processar áudio:", error);
      toast({
        title: "Erro ao processar áudio",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Processamento Inteligente de Áudio
        </CardTitle>
        <CardDescription>
          Carregue uma música e a IA irá extrair a letra e remover o vocal automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="audio-file">Arquivo de Áudio</Label>
          <Input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={processing}
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Arquivo selecionado: {file.name}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-sm">Extração de letra com IA</span>
          </div>
          <div className="flex items-center gap-2">
            <FileAudio className="h-4 w-4 text-primary" />
            <span className="text-sm">Separação vocal</span>
          </div>
        </div>

        {processing && step && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">{step}</span>
          </div>
        )}

        <Button
          onClick={processAudio}
          disabled={!file || processing}
          className="w-full"
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5 mr-2" />
              Processar com IA
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

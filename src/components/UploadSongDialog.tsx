import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Music } from "lucide-react";
import { useSongs } from "@/hooks/useSongs";

interface UploadSongDialogProps {
  trigger?: React.ReactNode;
}

export const UploadSongDialog = ({ trigger }: UploadSongDialogProps = {}) => {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [duration, setDuration] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadSong, isUploading } = useSongs();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Extract metadata from file
      if (selectedFile.type.startsWith('video/') || selectedFile.type.startsWith('audio/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          setDuration(Math.round(video.duration));
          URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(selectedFile);
      }
      
      // Set default title from filename
      if (!title) {
        const fileName = selectedFile.name.replace(/\.[^/.]+$/, "");
        setTitle(fileName);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    uploadSong({
      file,
      metadata: {
        title,
        artist: artist || "Artista Desconhecido",
        duration,
      },
    }, {
      onSuccess: () => {
        setOpen(false);
        setFile(null);
        setTitle("");
        setArtist("");
        setDuration(0);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="neon" size="lg">
            <Upload className="h-5 w-5 mr-2" />
            Adicionar Música
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Música Local</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="file">Arquivo de Música</Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                id="file"
                type="file"
                accept="video/mp4,video/quicktime,audio/mpeg,audio/mp3,audio/wav"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                {file ? (
                  <span className="flex items-center gap-2">
                    <Music className="h-4 w-4" />
                    {file.name}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Selecionar Arquivo
                  </span>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos: MP4, MOV, MP3, WAV (máx. 500MB)
            </p>
          </div>

          <div>
            <Label htmlFor="title">Título da Música</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da música"
              required
            />
          </div>

          <div>
            <Label htmlFor="artist">Artista</Label>
            <Input
              id="artist"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Nome do artista"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="neon"
              className="flex-1"
              disabled={!file || !title || isUploading}
            >
              {isUploading ? "Enviando..." : "Adicionar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
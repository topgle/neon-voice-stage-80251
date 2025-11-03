import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Youtube, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  duration: string;
}

interface YouTubeSearchDialogProps {
  trigger?: React.ReactNode;
}

export const YouTubeSearchDialog = ({ trigger }: YouTubeSearchDialogProps = {}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<YouTubeVideo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const searchYouTube = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      // Nota: Para produção, você precisará configurar a YouTube Data API v3
      // Por enquanto, vou criar um placeholder
      toast({
        title: "Busca YouTube",
        description: "A integração com YouTube requer configuração da API key. Configure em Configurações do projeto.",
      });
      
      // Mock results para demonstração
      setResults([
        {
          id: "dQw4w9WgXcQ",
          title: query + " - Karaoke Version",
          thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=320&h=180&fit=crop",
          channelTitle: "Karaoke Channel",
          duration: "3:45",
        },
      ]);
    } catch (error: any) {
      toast({
        title: "Erro na busca",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const addYouTubeVideo = async (video: YouTubeVideo) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase.from('songs').insert([{
        title: video.title,
        artist: video.channelTitle,
        duration: 225,
        source: 'youtube',
        source_id: video.id,
        thumbnail_url: video.thumbnail,
        format: 'youtube' as any,
        user_id: user.id,
      }]);

      if (error) throw error;

      toast({
        title: "Música adicionada!",
        description: "A música do YouTube foi adicionada à biblioteca.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao adicionar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg">
            <Youtube className="h-5 w-5 mr-2" />
            Buscar no YouTube
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Buscar Karaokê no YouTube</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nome da música + karaoke"
            onKeyDown={(e) => e.key === 'Enter' && searchYouTube()}
          />
          <Button onClick={searchYouTube} disabled={isSearching}>
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-3">
          {results.map((video) => (
            <Card key={video.id}>
              <CardContent className="p-3">
                <div className="flex gap-3">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-32 h-18 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm line-clamp-2">{video.title}</h4>
                    <p className="text-xs text-muted-foreground">{video.channelTitle}</p>
                    <p className="text-xs text-muted-foreground">{video.duration}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addYouTubeVideo(video)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {results.length === 0 && query && (
          <div className="text-center py-8 text-muted-foreground">
            <Youtube className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum resultado encontrado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
import { Play, Music, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SongCardProps {
  title: string;
  artist: string;
  duration: string;
  thumbnail?: string;
  onPlay: () => void;
}

export const SongCard = ({ title, artist, duration, thumbnail, onPlay }: SongCardProps) => {
  return (
    <Card className="group cursor-pointer hover:scale-105 transition-all duration-300 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative aspect-video bg-gradient-card">
          {thumbnail ? (
            <img src={thumbnail} alt={title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Music className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="neon" size="lg" onClick={onPlay}>
              <Play className="h-6 w-6 mr-2" />
              Cantar
            </Button>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-bold text-lg text-foreground line-clamp-1">{title}</h3>
          <p className="text-muted-foreground text-sm line-clamp-1">{artist}</p>
          <div className="flex items-center mt-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" />
            {duration}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

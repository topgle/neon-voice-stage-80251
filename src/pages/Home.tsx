import { useState } from "react";
import { SearchBar } from "@/components/SearchBar";
import { SongCard } from "@/components/SongCard";
import { Navigation } from "@/components/Navigation";
import { useNavigate } from "react-router-dom";
import { useSongs } from "@/hooks/useSongs";
import { Loader2, Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const {
    songs,
    isLoading
  } = useSongs();
  const filteredSongs = songs.filter(song => song.title.toLowerCase().includes(searchQuery.toLowerCase()) || song.artist.toLowerCase().includes(searchQuery.toLowerCase()));
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  return <div className="min-h-screen bg-background pb-24 md:pb-8 md:pt-20">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 md:hidden">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            🎤 Karaoke Lovable
          </h1>
          <p className="text-muted-foreground">Seu sistema de karaokê completo</p>
        </div>

        <div className="mb-8">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">Repertório musical</h2>
          <p className="text-muted-foreground">
            {filteredSongs.length} música{filteredSongs.length !== 1 ? "s" : ""} disponível
            {filteredSongs.length !== 1 ? "is" : ""}
          </p>
        </div>

        {isLoading ? <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSongs.map(song => <SongCard key={song.id} title={song.title} artist={song.artist} duration={formatDuration(song.duration)} thumbnail={song.thumbnail_url} onPlay={() => navigate(`/player?song=${song.id}`)} />)}
          </div>}

        {filteredSongs.length === 0 && <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">
              Nenhuma música encontrada para "{searchQuery}"
            </p>
          </div>}
      </div>
    </div>;
};
export default Home;
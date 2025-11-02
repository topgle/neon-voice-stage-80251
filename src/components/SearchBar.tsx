import { useState, useEffect, useRef } from "react";
import { Search, Mic, Keyboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { VirtualKeyboard } from "./VirtualKeyboard";
import { useVoiceSearch } from "@/hooks/useVoiceSearch";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Buscar música, artista..." }: SearchBarProps) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const { isListening, transcript, startListening, stopListening, isSupported } = useVoiceSearch();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (transcript) {
      onChange(transcript);
    }
  }, [transcript, onChange]);

  const handleKeyPress = (key: string) => {
    onChange(value + key);
  };

  const handleDelete = () => {
    onChange(value.slice(0, -1));
  };

  const handleSpace = () => {
    onChange(value + ' ');
  };

  const handleVoiceSearch = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <>
      <div className="relative w-full max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pl-12 pr-24 h-14 bg-card/60 backdrop-blur-md border-border/50 rounded-2xl text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
          {isSupported && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleVoiceSearch}
              className={cn(
                "h-10 w-10 rounded-full transition-all",
                isListening && "bg-primary text-primary-foreground animate-pulse"
              )}
              title="Busca por voz"
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowKeyboard(!showKeyboard)}
            className={cn(
              "h-10 w-10 rounded-full",
              showKeyboard && "bg-primary/10"
            )}
            title="Teclado virtual"
          >
            <Keyboard className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {showKeyboard && (
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          onDelete={handleDelete}
          onSpace={handleSpace}
          onClose={() => setShowKeyboard(false)}
        />
      )}
    </>
  );
};
